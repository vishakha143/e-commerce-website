"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

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
