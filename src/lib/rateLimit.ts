import { headers } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { RateLimitEntry } from "@/models/RateLimitEntry";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Fixed-window rate limiter backed by MongoDB rather than in-process
 * memory. Vercel serverless functions are stateless and can run across
 * multiple instances, so an in-memory counter wouldn't reliably catch
 * abuse spread across invocations — this does, at the cost of one extra
 * DB round trip per call. The atomic $inc/upsert means concurrent
 * requests can't race past the limit.
 *
 * `key` should identify the actor+action, e.g. `login:<ip>`. Each fixed
 * window is its own document (keyed by the window index), which a TTL
 * index cleans up once the window ends.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  await connectDB();

  const now = Date.now();
  const windowIndex = Math.floor(now / windowMs);
  const windowKey = `${key}:${windowIndex}`;
  const expiresAt = new Date((windowIndex + 1) * windowMs);

  const entry = await RateLimitEntry.findOneAndUpdate(
    { key: windowKey },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" },
  );

  if (entry.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((expiresAt.getTime() - now) / 1000) };
  }

  return { allowed: true };
}

/**
 * Best-effort client IP for rate-limiting unauthenticated requests.
 * Vercel sets x-forwarded-for on every request it proxies; this is not
 * spoof-proof for a self-hosted deployment behind no proxy, but Vercel
 * overwrites rather than trusts an inbound copy of this header.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
