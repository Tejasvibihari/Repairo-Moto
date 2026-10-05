import mongoose from "mongoose";

// One row per (phone number, purpose) holding its CURRENT login code (never the code itself, only an HMAC).
// `purpose` keeps the customer, employee and vendor logins apart even when they share a number.
// A single row also carries the send-rate counters, so resending replaces the old code.
const phoneOtpSchema = new mongoose.Schema({
    phone: { type: String, required: true },                 // "919876543210"
    purpose: { type: String, required: true, default: "user", enum: ["user", "employee", "vendor"] },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },               // code validity (5 min)
    attempts: { type: Number, default: 0 },                  // wrong guesses against the current code
    lastSentAt: { type: Date, required: true },              // start of the 1-minute resend cooldown
    windowStart: { type: Date, required: true },             // start of the 1-hour send window
    sendCount: { type: Number, default: 1 },                 // sends inside that window
    purgeAt: { type: Date, required: true },                 // TTL: row is deleted by MongoDB after this
});

phoneOtpSchema.index({ phone: 1, purpose: 1 }, { unique: true });
phoneOtpSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PhoneOtp", phoneOtpSchema);
