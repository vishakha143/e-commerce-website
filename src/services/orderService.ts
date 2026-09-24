import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { calculateShipping } from "@/lib/pricing";
import { canTransition, allowedNextPaymentStatuses } from "@/lib/orderStatus";
import { escapeRegex } from "@/lib/utils";
import { User } from "@/models/User";
import { Coupon } from "@/models/Coupon";
import { evaluateCoupon } from "@/services/couponService";
import type { CartItem } from "@/types/cart";
import type { OrderStatus, PaymentStatus, ShippingAddress } from "@/types/order";

export interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

/** Expected, user-facing validation failures (out of stock, etc.) — distinct
 * from unexpected errors, which should propagate rather than be swallowed. */
class OrderValidationError extends Error {}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

/**
 * Validates every line against the DB (product exists, variant exists,
 * stock covers the quantity) and recomputes price/shipping/total
 * server-side — the client's cart is never trusted for money figures.
 *
 * Runs as a MongoDB transaction (Atlas free-tier clusters are replica
 * sets, so this is supported) so order creation and every stock
 * decrement commit or roll back together — a failure partway through
 * (e.g. item 3 of 4 is out of stock) can't leave items 1-2 decremented
 * with no order to show for it. Each decrement is also its own atomic
 * conditional update (`stock >= quantity` in the filter, matched against
 * the specific variant via $elemMatch), so two concurrent checkouts for
 * the same last unit can't both succeed even if their transactions
 * overlap — one's update simply matches zero documents and the whole
 * transaction aborts.
 *
 * `idempotencyKey` is a value the client generates once per checkout
 * attempt and resubmits on every retry (double-click, network retry, a
 * second tab), so a retry returns the order that already exists instead
 * of creating a duplicate.
 */
export async function createOrder(
  userId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress,
  idempotencyKey: string,
  couponCode?: string,
): Promise<CreateOrderResult> {
  await connectDB();

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }
  // The bag comes from the browser, so shape and quantities are checked here
  // rather than relying on schema validators to fail later inside the transaction.
  if (
    items.length > 50 ||
    !items.every(
      (i) =>
        typeof i.productId === "string" &&
        mongoose.isValidObjectId(i.productId) &&
        typeof i.sku === "string" &&
        i.sku.length > 0 &&
        Number.isInteger(i.quantity) &&
        i.quantity >= 1 &&
        i.quantity <= 99,
    )
  ) {
    return { success: false, error: "Your bag has an invalid item. Please refresh and try again." };
  }

  const existing = await Order.findOne({ idempotencyKey }).lean<{ _id: mongoose.Types.ObjectId }>();
  if (existing) {
    return { success: true, orderId: existing._id.toString() };
  }

  const session = await mongoose.startSession();
  try {
    let orderId = "";

    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product || product.published === false) {
          throw new OrderValidationError(`${item.name} is no longer available.`);
        }

        const variant = product.variants.find((v: { sku: string }) => v.sku === item.sku);
        if (!variant) {
          throw new OrderValidationError(`${product.name} is no longer available in that option.`);
        }

        const decremented = await Product.updateOne(
          {
            _id: item.productId,
            variants: { $elemMatch: { sku: item.sku, stock: { $gte: item.quantity } } },
          },
          { $inc: { "variants.$.stock": -item.quantity } },
        ).session(session);

        if (decremented.modifiedCount === 0) {
          throw new OrderValidationError(
            variant.stock === 0
              ? `${product.name} is out of stock.`
              : `Only ${variant.stock} left of ${product.name}.`,
          );
        }

        // Server-authoritative price — never trust the price on the client's cart item.
        const price = product.price;
        subtotal += price * item.quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          quantity: item.quantity,
          price,
        });
      }

      // Discount is recomputed here from the DB, and the redemption is claimed
      // atomically (usage cap checked in the update filter) inside the same
      // transaction, so two checkouts can't both take the last use.
      let discount = 0;
      let appliedCode: string | undefined;
      if (couponCode) {
        const evaluation = await evaluateCoupon(couponCode, subtotal, userId);
        if (!evaluation.ok) throw new OrderValidationError(evaluation.error);

        const claimed = await Coupon.updateOne(
          {
            _id: evaluation.coupon._id,
            active: true,
            $or: [{ maxUses: null }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }],
          },
          { $inc: { usedCount: 1 } },
        ).session(session);
        if (claimed.modifiedCount === 0) {
          throw new OrderValidationError("That code has reached its usage limit.");
        }
        discount = evaluation.discount;
        appliedCode = evaluation.coupon.code;
      }

      // Shipping is judged on the pre-discount subtotal so the free-shipping
      // threshold shown in the bag means the same thing at checkout.
      const shippingCost = calculateShipping(subtotal);
      const total = Math.round((subtotal - discount + shippingCost) * 100) / 100;

      const [order] = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            shippingAddress,
            subtotal,
            shippingCost,
            discount,
            couponCode: appliedCode,
            total,
            status: "pending",
            paymentStatus: "pending",
            paymentMethod: "cod",
            idempotencyKey,
          },
        ],
        { session },
      );

      orderId = order._id.toString();
    });

    return { success: true, orderId };
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return { success: false, error: err.message };
    }
    if (isDuplicateKeyError(err)) {
      const raced = await Order.findOne({ idempotencyKey }).lean<{ _id: mongoose.Types.ObjectId }>();
      if (raced) return { success: true, orderId: raced._id.toString() };
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

export async function getOrdersByUserId(userId: string) {
  await connectDB();
  return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export async function getOrderById(orderId: string, userId: string) {
  await connectDB();
  return Order.findOne({ _id: orderId, user: userId }).lean();
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const MAX_SEARCH_LENGTH = 100;

export interface AdminOrderQuery {
  q?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

/**
 * Admin order list with search, status/payment filters and pagination.
 * Search matches the short order number shown in the UI (last 8 hex chars
 * of the id, or a full id) and customer name/email. Filter values are
 * checked against the enums and search text is regex-escaped, so nothing
 * from the query string reaches Mongo as an operator or pattern.
 */
export async function listOrdersAdmin(query: AdminOrderQuery = {}) {
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (query.status && ORDER_STATUSES.includes(query.status as OrderStatus)) {
    filter.status = query.status;
  }
  if (query.paymentStatus && PAYMENT_STATUSES.includes(query.paymentStatus as PaymentStatus)) {
    filter.paymentStatus = query.paymentStatus;
  }

  const q = query.q?.trim();
  if (q && q.length <= MAX_SEARCH_LENGTH) {
    const clauses: Record<string, unknown>[] = [];
    const idText = q.replace(/^#/, "");
    if (/^[0-9a-f]{4,24}$/i.test(idText)) {
      clauses.push({
        $expr: {
          $regexMatch: { input: { $toString: "$_id" }, regex: `${idText}$`, options: "i" },
        },
      });
    }
    const pattern = new RegExp(escapeRegex(q), "i");
    const users = await User.find({ $or: [{ name: pattern }, { email: pattern }] })
      .select("_id")
      .limit(100)
      .lean();
    if (users.length > 0) clauses.push({ user: { $in: users.map((u) => u._id) } });
    // No possible match at all -> force an empty result rather than ignoring the search.
    filter.$or = clauses.length > 0 ? clauses : [{ _id: null }];
  }

  const limit = query.limit && query.limit > 0 ? query.limit : 15;
  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email")
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Payment status change, checked against the allowed transitions. */
export async function updatePaymentStatus(
  orderId: string,
  next: PaymentStatus,
): Promise<UpdateStatusResult> {
  await connectDB();

  const order = await Order.findById(orderId).lean<{ status: OrderStatus; paymentStatus: PaymentStatus }>();
  if (!order) return { success: false, error: "Order not found." };

  if (!allowedNextPaymentStatuses(order.paymentStatus, order.status).includes(next)) {
    return {
      success: false,
      error: `Payment marked ${order.paymentStatus} can't be changed to ${next} on a ${order.status} order.`,
    };
  }

  const result = await Order.updateOne(
    { _id: orderId, paymentStatus: order.paymentStatus },
    { $set: { paymentStatus: next } },
  );
  if (result.modifiedCount !== 1) {
    return { success: false, error: "This order was just updated by someone else. Refresh and try again." };
  }
  return { success: true };
}

export async function updateOrderDetails(
  orderId: string,
  details: { trackingReference: string; adminNotes: string },
): Promise<UpdateStatusResult> {
  await connectDB();
  const result = await Order.updateOne(
    { _id: orderId },
    { $set: { trackingReference: details.trackingReference, adminNotes: details.adminNotes } },
    { runValidators: true },
  );
  if (result.matchedCount === 0) return { success: false, error: "Order not found." };
  return { success: true };
}

export async function getOrderByIdAdmin(orderId: string) {
  await connectDB();
  return Order.findById(orderId).populate("user", "name email").lean();
}

export interface UpdateStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Validates the transition against the fulfilment rules, and applies it
 * with the current status in the filter so two admins clicking at once
 * can't both act on the same starting state. Cancelling also puts the
 * order's units back into stock in the same transaction — otherwise a
 * cancelled order would keep inventory locked up forever — and marks a
 * paid order refunded.
 */
export async function updateOrderStatus(
  orderId: string,
  next: OrderStatus,
): Promise<UpdateStatusResult> {
  await connectDB();

  const order = await Order.findById(orderId).lean<{
    status: OrderStatus;
    paymentStatus: string;
    couponCode?: string;
    items: { product: mongoose.Types.ObjectId; sku: string; quantity: number }[];
  }>();
  if (!order) return { success: false, error: "Order not found." };

  if (!canTransition(order.status, next)) {
    return {
      success: false,
      error: `An order that is ${order.status} can't be changed to ${next}.`,
    };
  }

  const session = await mongoose.startSession();
  try {
    let applied = false;

    await session.withTransaction(async () => {
      const update: Record<string, unknown> = { status: next };
      if (next === "cancelled" && order.paymentStatus === "paid") {
        update.paymentStatus = "refunded";
      }

      const result = await Order.updateOne(
        { _id: orderId, status: order.status },
        { $set: update },
        { session },
      );
      applied = result.modifiedCount === 1;
      if (!applied) return;

      if (next === "cancelled") {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product, "variants.sku": item.sku },
            { $inc: { "variants.$.stock": item.quantity } },
            { session },
          );
        }
        // A cancelled order frees its coupon redemption again.
        if (order.couponCode) {
          await Coupon.updateOne(
            { code: order.couponCode, usedCount: { $gt: 0 } },
            { $inc: { usedCount: -1 } },
            { session },
          );
        }
      }
    });

    if (!applied) {
      return { success: false, error: "This order was just updated by someone else. Refresh and try again." };
    }
    return { success: true };
  } finally {
    await session.endSession();
  }
}
