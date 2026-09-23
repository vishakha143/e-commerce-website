import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, "Code must be 3-30 letters, numbers, dashes or underscores"),
    type: z.enum(["percent", "fixed"]),
    value: z.number().positive("Value must be greater than 0"),
    minSubtotal: z.number().min(0).default(0),
    maxUses: z.number().int().min(1).nullable(),
    expiresAt: z.date().nullable(),
  })
  .refine((c) => c.type !== "percent" || c.value <= 100, {
    message: "A percentage discount can't exceed 100",
    path: ["value"],
  });

export type CouponInput = z.infer<typeof couponSchema>;
