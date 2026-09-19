"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

/**
 * Called once on login to fold the guest (localStorage) wishlist into
 * the user's persistent wishlist. Requires MONGODB_URI to be configured.
 */
export async function mergeWishlistAction(productIds: string[]) {
  const session = await auth();
  if (!session?.user?.id || productIds.length === 0) return;

  await connectDB();
  await User.updateOne(
    { _id: session.user.id },
    { $addToSet: { wishlist: { $each: productIds } } },
  );
}

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return;

  const alreadySaved = user.wishlist.some(
    (id: { toString(): string }) => id.toString() === productId,
  );

  if (alreadySaved) {
    user.wishlist = user.wishlist.filter(
      (id: { toString(): string }) => id.toString() !== productId,
    );
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
}
