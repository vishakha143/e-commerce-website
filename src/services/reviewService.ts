import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export interface PublicReview {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  author: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface RatingSummary {
  average: number;
  count: number;
  /** index 0 = 1 star ... index 4 = 5 stars */
  distribution: number[];
}

const PAGE_SIZE = 10;

/** "Priya Sharma" -> "Priya S." so reviewers aren't identified by full name. */
function displayName(name?: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export async function getPublishedReviews(productId: string, page = 1) {
  await connectDB();
  if (!mongoose.isValidObjectId(productId)) return { reviews: [] as PublicReview[], total: 0, page: 1, totalPages: 1 };

  const filter = { product: productId, status: "published" };
  const p = page > 0 ? Math.floor(page) : 1;
  const [docs, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("user", "name")
      .lean(),
    Review.countDocuments(filter),
  ]);

  const reviews: PublicReview[] = docs.map((d) => ({
    id: String(d._id),
    rating: d.rating,
    title: d.title || undefined,
    comment: d.comment,
    author: displayName((d.user as { name?: string } | null)?.name),
    verifiedPurchase: !!d.verifiedPurchase,
    createdAt: new Date(d.createdAt).toISOString(),
  }));

  return { reviews, total, page: p, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  await connectDB();
  const empty: RatingSummary = { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
  if (!mongoose.isValidObjectId(productId)) return empty;

  const rows = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: "published" } },
    { $group: { _id: "$rating", n: { $sum: 1 } } },
  ]);
  const distribution = [0, 0, 0, 0, 0];
  let total = 0;
  let sum = 0;
  for (const r of rows) {
    const idx = Number(r._id) - 1;
    if (idx >= 0 && idx < 5) {
      distribution[idx] = r.n;
      total += r.n;
      sum += r.n * Number(r._id);
    }
  }
  return { average: total ? Math.round((sum / total) * 10) / 10 : 0, count: total, distribution };
}

/**
 * Re-derives the product's headline rating from its published reviews. Once a
 * product has real reviews the seeded placeholder figures are replaced by the
 * true ones; if every review is later hidden it drops back to 0.
 */
export async function recalcProductRating(productId: string) {
  const summary = await getRatingSummary(productId);
  await Product.updateOne(
    { _id: productId },
    { $set: { rating: summary.average, reviewCount: summary.count } },
  );
}

export interface Eligibility {
  canReview: boolean;
  hasReviewed: boolean;
  reason?: "not-purchased";
}

/** Only customers with a delivered order containing the product may review it. */
export async function getReviewEligibility(userId: string, productId: string): Promise<Eligibility> {
  await connectDB();
  if (!mongoose.isValidObjectId(productId)) return { canReview: false, hasReviewed: false };

  const [existing, delivered] = await Promise.all([
    Review.exists({ user: userId, product: productId }),
    Order.exists({ user: userId, status: "delivered", "items.product": productId }),
  ]);
  if (existing) return { canReview: false, hasReviewed: true };
  if (!delivered) return { canReview: false, hasReviewed: false, reason: "not-purchased" };
  return { canReview: true, hasReviewed: false };
}

export interface CreateReviewInput {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export async function createReview(input: CreateReviewInput): Promise<{ success: boolean; error?: string }> {
  await connectDB();

  const eligibility = await getReviewEligibility(input.userId, input.productId);
  if (eligibility.hasReviewed) return { success: false, error: "You have already reviewed this product." };
  if (!eligibility.canReview) {
    return { success: false, error: "Only customers who received this product can review it." };
  }

  try {
    await Review.create({
      user: input.userId,
      product: input.productId,
      rating: input.rating,
      title: input.title || undefined,
      comment: input.comment,
      verifiedPurchase: true,
    });
  } catch (err) {
    // The unique (user, product) index catches a double-submit that slipped past the check above.
    if ((err as { code?: number }).code === 11000) {
      return { success: false, error: "You have already reviewed this product." };
    }
    throw err;
  }

  await recalcProductRating(input.productId);
  return { success: true };
}

export type AdminReviewFilter = "all" | "published" | "hidden";

export async function getAllReviewsAdmin(filter: AdminReviewFilter = "all") {
  await connectDB();
  const query = filter === "all" ? {} : { status: filter };
  return Review.find(query)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("user", "name email")
    .populate("product", "name slug")
    .lean();
}

export async function setReviewStatus(id: string, status: "published" | "hidden") {
  await connectDB();
  const review = await Review.findOneAndUpdate({ _id: id }, { $set: { status } }).lean<{
    product: mongoose.Types.ObjectId;
  }>();
  if (!review) return false;
  await recalcProductRating(String(review.product));
  return true;
}
