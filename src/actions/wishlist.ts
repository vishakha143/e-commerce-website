"use server";

import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const MAX_WISHLIST = 200;

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  // Ignore anything that isn't a real ObjectId rather than storing arbitrary values.
  if (typeof productId !== "string" || !mongoose.isValidObjectId(productId)) return;

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
    if (user.wishlist.length >= MAX_WISHLIST) return;
    user.wishlist.push(productId);
  }

  await user.save();
}
