import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { calculateShipping } from "@/lib/pricing";
import { canTransition } from "@/lib/orderStatus";
import type { CartItem } from "@/types/cart";
import type { OrderStatus, ShippingAddress } from "@/types/order";

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
): Promise<CreateOrderResult> {
  await connectDB();

  if (items.length === 0) {
    return { success: false, error: "Your bag is empty." };
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
        if (!product) {
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

      const shippingCost = calculateShipping(subtotal);
      const total = subtotal + shippingCost;

      const [order] = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            shippingAddress,
            subtotal,
            shippingCost,
            discount: 0,
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

export async function getAllOrders() {
  await connectDB();
  return Order.find().sort({ createdAt: -1 }).populate("user", "name email").lean();
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
