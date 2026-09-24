import { getAdminSession } from "@/lib/authz";
import { destroyCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, sniffImageType } from "@/lib/validations/upload";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await checkRateLimit(`upload:${session.user.id}`, 30, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "File must be under 5MB" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return Response.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);
  if (!sniffed || sniffed !== file.type) {
    return Response.json({ error: "File content doesn't match its declared type" }, { status: 400 });
  }

  try {
    const result = await uploadImageToCloudinary(buffer, file.name);
    return Response.json(result);
  } catch (err) {
    console.error("Cloudinary upload failed", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const publicId = body?.publicId;
  if (typeof publicId !== "string" || !publicId) {
    return Response.json({ error: "publicId is required" }, { status: 400 });
  }
  // Only assets this app uploaded (under products/) can be removed through here,
  // not anything else that happens to live in the same Cloudinary account.
  if (!/^products\/[A-Za-z0-9_-]{1,100}$/.test(publicId)) {
    return Response.json({ error: "Invalid publicId" }, { status: 400 });
  }

  try {
    await destroyCloudinaryImage(publicId);
  } catch (err) {
    console.error("Cloudinary destroy failed", err);
  }

  return Response.json({ ok: true });
}
