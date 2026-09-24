/**
 * Adds a set of demo products so every category has something in it.
 * Idempotent: a product whose slug already exists is left alone.
 * Every demo product is tagged "demo" so they are easy to find and delete
 * later in Admin -> Products (search "demo" is not needed: filter by tag in the DB
 * or just delete by name).
 *
 *   npm run seed-demo
 *
 * Names, prices and descriptions are invented placeholders. New products start
 * with no ratings on purpose, so nothing looks reviewed that hasn't been.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import { Product } from "../src/models/Product";

interface Demo {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  color: string;
  sizes: string[];
  skuPrefix: string;
  stock: number;
  isNew?: boolean;
  featured?: boolean;
  tags: string[];
}

const CLOTHING = ["XS", "S", "M", "L"];
const MEN = ["S", "M", "L", "XL"];

const DEMOS: Demo[] = [
  {
    name: "Floral Wrap Dress", slug: "floral-wrap-dress", category: "women", subcategory: "dresses",
    price: 89, compareAtPrice: 110, color: "Pink", sizes: CLOTHING, skuPrefix: "FWD-PNK", stock: 12, featured: true,
    description: "A flowing wrap dress in a soft floral print, with a tie waist and a relaxed skirt. Easy to dress up or down.",
    tags: ["dress", "floral", "summer", "demo"],
  },
  {
    name: "Black Slip Dress", slug: "black-slip-dress", category: "women", subcategory: "dresses",
    price: 79, color: "Black", sizes: CLOTHING, skuPrefix: "BSD-BLK", stock: 10, isNew: true,
    description: "A clean, satin-finish slip dress with adjustable straps. Wear it alone for evenings or layered over a tee.",
    tags: ["dress", "evening", "black", "demo"],
  },
  {
    name: "Ribbed Knit Top", slug: "ribbed-knit-top", category: "women", subcategory: "tops",
    price: 42, color: "Cream", sizes: CLOTHING, skuPrefix: "RKT-CRM", stock: 15,
    description: "A fitted ribbed knit top with a soft stretch. A wardrobe basic that goes with everything.",
    tags: ["top", "knit", "basics", "demo"],
  },
  {
    name: "Puff Sleeve Blouse", slug: "puff-sleeve-blouse", category: "women", subcategory: "tops",
    price: 56, compareAtPrice: 68, color: "White", sizes: CLOTHING, skuPrefix: "PSB-WHT", stock: 10, isNew: true,
    description: "A crisp white blouse with romantic puffed sleeves and a relaxed fit.",
    tags: ["blouse", "top", "white", "demo"],
  },
  {
    name: "Essential Grey Hoodie", slug: "essential-grey-hoodie", category: "men", subcategory: "hoodies",
    price: 72, color: "Grey", sizes: MEN, skuPrefix: "EGH-GRY", stock: 14, featured: true,
    description: "A heavyweight cotton-blend hoodie with a kangaroo pocket and a brushed inside. Made for everyday wear.",
    tags: ["hoodie", "grey", "essentials", "demo"],
  },
  {
    name: "Black Pullover Hoodie", slug: "black-pullover-hoodie", category: "men", subcategory: "hoodies",
    price: 68, compareAtPrice: 84, color: "Black", sizes: MEN, skuPrefix: "BPH-BLK", stock: 14,
    description: "A classic black pullover hoodie with a roomy hood and ribbed cuffs.",
    tags: ["hoodie", "black", "streetwear", "demo"],
  },
  {
    name: "Linen Button-Down Shirt", slug: "linen-button-down-shirt", category: "men", subcategory: "shirts",
    price: 64, color: "Stone", sizes: MEN, skuPrefix: "LBD-STN", stock: 12, isNew: true,
    description: "A lightweight linen-blend shirt that stays cool in warm weather. Relaxed fit with a soft collar.",
    tags: ["shirt", "linen", "summer", "demo"],
  },
  {
    name: "Leather Slide Sandals", slug: "leather-slide-sandals", category: "footwear", subcategory: "sandals",
    price: 58, color: "Black", sizes: ["6", "7", "8", "9", "10"], skuPrefix: "LSS-BLK", stock: 10,
    description: "Buckled leather-look slides with a cushioned footbed. Slip on and go.",
    tags: ["sandals", "leather", "summer", "demo"],
  },
  {
    name: "Everyday Tote Bag", slug: "everyday-tote-bag", category: "accessories", subcategory: "bags",
    price: 52, color: "Cream", sizes: ["One Size"], skuPrefix: "ETB-CRM", stock: 20, isNew: true, featured: true,
    description: "A roomy structured tote with sturdy handles and an inside pocket. Fits a laptop and a lunch.",
    tags: ["bag", "tote", "everyday", "demo"],
  },
  {
    name: "Slim Leather Wallet", slug: "slim-leather-wallet", category: "accessories", subcategory: "wallets",
    price: 44, color: "Brown", sizes: ["One Size"], skuPrefix: "SLW-BRN", stock: 25,
    description: "A slim bifold wallet with card slots and a note pocket, stitched from soft brown leather.",
    tags: ["wallet", "leather", "gift", "demo"],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (checked .env.local)");
  await mongoose.connect(uri);

  let created = 0;
  for (const d of DEMOS) {
    if (await Product.exists({ slug: d.slug })) {
      console.log(`- ${d.slug}: already exists, skipped`);
      continue;
    }
    await Product.create({
      name: d.name,
      slug: d.slug,
      description: d.description,
      category: d.category,
      subcategory: d.subcategory,
      brand: "Fashion",
      price: d.price,
      compareAtPrice: d.compareAtPrice,
      images: [],
      variants: d.sizes.map((size) => ({
        color: d.color,
        size,
        sku: `${d.skuPrefix}-${size.replace(/\s+/g, "").toUpperCase()}`,
        stock: d.stock,
      })),
      rating: 0,
      reviewCount: 0,
      featured: !!d.featured,
      isNew: !!d.isNew,
      tags: d.tags,
    });
    console.log(`+ ${d.slug}`);
    created++;
  }
  console.log(`\nCreated ${created} demo product(s).`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
