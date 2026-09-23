import { z } from "zod";

export const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().min(1, "Every variant needs a SKU"),
  stock: z.number().int().min(0, "Stock can't be negative"),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional(),
  sortOrder: z.number().int(),
  isPrimary: z.boolean(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  compareAtPrice: z.number().positive().optional(),
  featured: z.boolean(),
  isNew: z.boolean(),
  tags: z.array(z.string()),
  images: z.array(productImageSchema),
  variants: z.array(variantSchema),
});

export type ProductInput = z.infer<typeof productSchema>;
