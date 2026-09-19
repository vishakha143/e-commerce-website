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
