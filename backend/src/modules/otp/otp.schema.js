// ── otp.schema.js ───────────────────────────────────────────
const { Schema, model } = require("mongoose");

const OtpSchema = new Schema(
  {
    referenceCode: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true },
    code: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = model("Otp", OtpSchema);
