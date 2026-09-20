import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { calculateShipping } from "@/lib/pricing";
import type { CartItem } from "@/types/cart";
import type { ShippingAddress } from "@/types/order";

export interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

/**
 * Validates every line against the DB (product exists, variant exists,
 * stock covers the quantity) and recomputes price/shipping/total
 * server-side — the client's cart is never trusted for money figures.
 * Not wrapped in a transaction: acceptable for this project's scope,
 * but a partial failure could leave inventory adjusted without an
 * order (or vice versa) under concurrent load.
 */
export async function createOrder(
  userId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress,
): Promise<CreateOrderResult> {
  await connectDB();

  if (items.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return { success: false, error: `${item.name} is no longer available.` };
    }

    const variant = product.variants.find(
      (v: { sku: string }) => v.sku === item.sku,
    );
    if (!variant) {
      return { success: false, error: `${product.name} is no longer available in that option.` };
    }
    if (variant.stock < item.quantity) {
      return {
        success: false,
        error:
          variant.stock === 0
            ? `${product.name} is out of stock.`
            : `Only ${variant.stock} left of ${product.name}.`,
      };
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

  const order = await Order.create({
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
  });

  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId, "variants.sku": item.sku },
      { $inc: { "variants.$.stock": -item.quantity } },
    );
  }

  return { success: true, orderId: order._id.toString() };
}

export async function getOrdersByUserId(userId: string) {
  await connectDB();
  return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export async function getOrderById(orderId: string, userId: string) {
  await connectDB();
  return Order.findOne({ _id: orderId, user: userId }).lean();
}
