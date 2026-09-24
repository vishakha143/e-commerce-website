"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/authz";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import {
  createReview,
  getReviewEligibility,
  setReviewStatus,
  type Eligibility,
} from "@/services/reviewService";

const reviewSchema = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product"),
  rating: z.number().int().min(1, "Please choose a star rating").max(5),
  title: z.string().trim().max(100, "Title is too long").optional(),
  comment: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Review is too long (2000 characters max)"),
});

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

export async function getReviewEligibilityAction(productId: string): Promise<Eligibility & { loggedIn: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { canReview: false, hasReviewed: false, loggedIn: false };
  const e = await getReviewEligibility(session.user.id, String(productId));
  return { ...e, loggedIn: true };
}

export async function submitReviewAction(
  productId: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please log in to write a review." };

  const limit = await checkRateLimit(`review:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) return { error: "Too many reviews submitted. Please try again later." };

  const parsed = reviewSchema.safeParse({
    productId,
    rating: Number(formData.get("rating")),
    title: String(formData.get("title") ?? "") || undefined,
    comment: String(formData.get("comment") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await createReview({ userId: session.user.id, ...parsed.data });
  if (!result.success) return { error: result.error };

  await connectDB();
  const product = await Product.findById(parsed.data.productId).select("slug").lean<{ slug: string }>();
  if (product) revalidatePath(`/product/${product.slug}`);
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function setReviewStatusAction(id: string, status: "published" | "hidden") {
  await requireAdmin();
  if (!/^[a-f\d]{24}$/i.test(id) || (status !== "published" && status !== "hidden")) {
    return { success: false };
  }
  const ok = await setReviewStatus(id, status);
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
  return { success: ok };
}
