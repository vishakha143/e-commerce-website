import { Schema, model, models, Types } from "mongoose";

const PasswordResetTokenSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    // Only the hash is stored — the raw token exists solely in the emailed
    // link, so a database read alone can never produce a usable token.
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true },
);

// TTL index: MongoDB reaps the document itself once expiresAt has passed,
// so expired tokens don't linger indefinitely.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken =
  models.PasswordResetToken || model("PasswordResetToken", PasswordResetTokenSchema);
