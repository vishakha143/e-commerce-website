import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import type { CartItem } from "@/types/cart";

export async function getCartByUserId(userId: string) {
  await connectDB();
  return Cart.findOne({ user: userId }).lean();
}

/**
 * Merges a guest cart into the user's persistent cart, summing
 * quantities for matching SKUs rather than overwriting either side.
 */
export async function mergeCart(userId: string, guestItems: CartItem[]) {
  await connectDB();

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return Cart.create({ user: userId, items: guestItems.map(toDbItem) });
  }

  for (const guestItem of guestItems) {
    const existing = cart.items.find(
      (item: { sku: string }) => item.sku === guestItem.sku,
    );
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      cart.items.push(toDbItem(guestItem));
    }
  }

  await cart.save();
  return cart;
}

/** Replaces the persisted cart with the client's current one (last write wins). */
export async function replaceCart(userId: string, items: CartItem[]) {
  await connectDB();
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: items.map(toDbItem) } },
    { upsert: true },
  );
}

export async function clearCart(userId: string) {
  await connectDB();
  await Cart.updateOne({ user: userId }, { $set: { items: [] } });
}

function toDbItem(item: CartItem) {
  return {
    product: item.productId,
    sku: item.sku,
    name: item.name,
    slug: item.slug,
    color: item.color,
    size: item.size,
    priceAtAddition: item.price,
    quantity: item.quantity,
  };
}
