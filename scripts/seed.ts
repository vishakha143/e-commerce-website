/**
 * Seeds MongoDB with the same catalog the UI has been running against as
 * mock data (src/lib/mock-products.ts, src/lib/categories.ts), plus a
 * local-dev admin user. Run with: npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { User } from "../src/models/User";
import { CATEGORY_TREE } from "../src/lib/categories";
import { MOCK_PRODUCTS } from "../src/lib/mock-products";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set (checked .env.local)");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Drop rather than deleteMany so stale indexes (e.g. an old schema's
  // unique constraint) don't linger across reseeds.
  await Category.collection.drop().catch(() => {});
  await Product.collection.drop().catch(() => {});
  await Category.syncIndexes();
  await Product.syncIndexes();

  for (const category of CATEGORY_TREE) {
    const parent = await Category.create({ name: category.name, slug: category.slug });
    for (const child of category.children ?? []) {
      await Category.create({ name: child.name, slug: child.slug, parent: parent._id });
    }
  }
  console.log(`Seeded ${CATEGORY_TREE.length} top-level categories`);

  const createdProducts = await Product.insertMany(
    MOCK_PRODUCTS.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      variants: p.variants,
      rating: p.rating,
      reviewCount: p.reviewCount,
      featured: p.featured ?? false,
      isNew: p.isNew ?? false,
      tags: p.tags ?? [],
    })),
  );
  console.log(`Seeded ${createdProducts.length} products`);
  console.log("\nslug -> _id (for reference, e.g. updating mock-products.ts ids):");
  for (const doc of createdProducts) {
    console.log(`  ${doc.slug}: ${doc._id.toString()}`);
  }

  const adminEmail = "admin@fashion.test";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin12345", 10);
    await User.create({ name: "Admin", email: adminEmail, password: passwordHash, role: "admin" });
    console.log(`\nSeeded admin user: ${adminEmail} / admin12345`);
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
