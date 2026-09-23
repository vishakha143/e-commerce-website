import { createHash } from "crypto";

/**
 * Thin adapter around Cloudinary's REST API — no SDK dependency, since a
 * signed upload/destroy call is just a couple of signed form fields. Keeping
 * it isolated here means swapping providers later only touches this file.
 */

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

const UPLOAD_FOLDER = "products";

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured (missing CLOUDINARY_* env vars)");
  }

  return { cloudName, apiKey, apiSecret };
}

function sign(paramsToSign: string, apiSecret: string) {
  return createHash("sha1").update(paramsToSign + apiSecret).digest("hex");
}

export async function uploadImageToCloudinary(
  buffer: Buffer,
  filename: string,
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = getConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(`folder=${UPLOAD_FOLDER}&timestamp=${timestamp}`, apiSecret);

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), filename);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", UPLOAD_FOLDER);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
    format: data.format as string,
  };
}

export async function destroyCloudinaryImage(publicId: string): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(`public_id=${publicId}&timestamp=${timestamp}`, apiSecret);

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cloudinary destroy failed (${res.status}): ${body}`);
  }
}
