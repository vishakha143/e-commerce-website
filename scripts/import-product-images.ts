/**
 * Bulk-attaches product photos from a local folder, so nothing has to be
 * clicked through in the admin.
 *
 *   npm run import-images -- --init       create product-images/<slug>/ for every product
 *   npm run import-images -- --dry-run    show what would happen, upload nothing
 *   npm run import-images                 upload + attach (skips products that already have photos)
 *   npm run import-images -- --replace    replace existing photos as well
 *
 * Layout (folder is gitignored):
 *   product-images/white-sneakers/1.jpg   <- first file (by name) is the primary photo
 *   product-images/white-sneakers/2.jpg
 *
 * Files go through the same checks as admin uploads (JPEG/PNG/WebP by real
 * content, max 5MB) and to the same Cloudinary folder. A product is updated
 * only if all of its photos upload; otherwise what was uploaded is removed again.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { promises as fs } from "fs";
import path from "path";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { uploadImageToCloudinary, destroyCloudinaryImage } from "../src/lib/cloudinary";
import { MAX_UPLOAD_BYTES, sniffImageType } from "../src/lib/validations/upload";

const ROOT = path.resolve("product-images");
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_PER_PRODUCT = 8;

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const REPLACE = args.has("--replace");
const INIT = args.has("--init");

interface StoredImage {
  url: string;
  publicId: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
}

async function listImageFiles(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (checked .env.local)");
  await mongoose.connect(uri);

  const products = await Product.find().select("name slug images").lean<
    { _id: mongoose.Types.ObjectId; name: string; slug: string; images?: { publicId: string }[] }[]
  >();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  if (INIT) {
    await fs.mkdir(ROOT, { recursive: true });
    for (const p of products) await fs.mkdir(path.join(ROOT, p.slug), { recursive: true });
    console.log(`Created ${products.length} folders in ${ROOT}\nPut each product's photos in its folder (1.jpg, 2.jpg, ...), then run: npm run import-images`);
    return;
  }

  let folders: string[];
  try {
    const entries = await fs.readdir(ROOT, { withFileTypes: true });
    folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    throw new Error(`No product-images folder found. Run: npm run import-images -- --init`);
  }

  let attached = 0;
  let skipped = 0;
  for (const folder of folders.sort()) {
    const product = bySlug.get(folder);
    if (!product) {
      console.warn(`? "${folder}" doesn't match any product slug (valid: ${[...bySlug.keys()].join(", ")})`);
      continue;
    }

    const files = (await listImageFiles(path.join(ROOT, folder))).slice(0, MAX_PER_PRODUCT);
    if (files.length === 0) continue; // empty folder: nothing to do

    const existing = product.images ?? [];
    if (existing.length > 0 && !REPLACE) {
      console.log(`- ${folder}: already has ${existing.length} photo(s), skipped (use --replace to overwrite)`);
      skipped++;
      continue;
    }

    // Validate everything first so a bad file is reported before anything is uploaded.
    const ready: { name: string; buffer: Buffer }[] = [];
    let bad = false;
    for (const name of files) {
      const buffer = await fs.readFile(path.join(ROOT, folder, name));
      if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
        console.error(`x ${folder}/${name}: must be under 5MB`);
        bad = true;
      } else if (!sniffImageType(buffer)) {
        console.error(`x ${folder}/${name}: not a real JPEG/PNG/WebP file`);
        bad = true;
      } else {
        ready.push({ name, buffer });
      }
    }
    if (bad) {
      console.error(`  -> ${folder} skipped until the file problem is fixed`);
      skipped++;
      continue;
    }

    if (DRY) {
      console.log(`+ ${folder} (${product.name}): would upload ${ready.map((r) => r.name).join(", ")}`);
      continue;
    }

    const uploaded: StoredImage[] = [];
    try {
      for (const [i, file] of ready.entries()) {
        const result = await uploadImageToCloudinary(file.buffer, file.name);
        uploaded.push({
          url: result.url,
          publicId: result.publicId,
          alt: i === 0 ? product.name : `${product.name} - view ${i + 1}`,
          sortOrder: i,
          isPrimary: i === 0,
        });
      }
    } catch (err) {
      console.error(`x ${folder}: upload failed (${err instanceof Error ? err.message : err}); undoing`);
      await Promise.all(uploaded.map((u) => destroyCloudinaryImage(u.publicId).catch(() => {})));
      skipped++;
      continue;
    }

    await Product.updateOne({ _id: product._id }, { $set: { images: uploaded } });
    // Replaced photos are no longer referenced anywhere; free the storage (best effort).
    await Promise.all(
      existing
        .filter((img) => img.publicId.startsWith("products/"))
        .map((img) => destroyCloudinaryImage(img.publicId).catch(() => {})),
    );
    console.log(`+ ${folder} (${product.name}): attached ${uploaded.length} photo(s)`);
    attached++;
  }

  console.log(`\n${DRY ? "Dry run - " : ""}products updated: ${attached}, skipped: ${skipped}`);
  if (!DRY && attached > 0) console.log("Storefront pages refresh within about a minute.");
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
