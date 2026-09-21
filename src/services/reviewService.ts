import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";

export async function getAllReviewsAdmin() {
  await connectDB();
  return Review.find()
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .populate("product", "name slug")
    .lean();
}
