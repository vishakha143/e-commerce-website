import { Schema, model, models } from "mongoose";

const RateLimitEntrySchema = new Schema({
  // "<action>:<actor>:<windowIndex>", e.g. "login:203.0.113.4:29234567"
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

// TTL index: each fixed window's document is reaped automatically once it
// ends, so this collection never grows unbounded.
RateLimitEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitEntry = models.RateLimitEntry || model("RateLimitEntry", RateLimitEntrySchema);
