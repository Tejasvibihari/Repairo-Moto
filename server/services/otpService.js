// services/otpService.js
//
// Shared OTP engine for every mobile-number login (customer, employee, vendor).
// It owns the rules, so all three behave identically:
//
//   • 1 minute cool-down between two codes for the same number  (RESEND_MS)
//   • max 5 codes per number per hour
//   • a code is valid for 5 minutes, 5 wrong guesses, single use
//
// The cool-down is claimed with ONE atomic Mongo update, so two requests that arrive at the same
// moment cannot both get through (the second one hits the unique index and is told to wait).
import crypto from "crypto";
import PhoneOtp from "../Models/phoneOtpModel.js";

export const OTP_TTL_MS = 5 * 60 * 1000;     // matches "Expires in 5 minutes" on the WhatsApp template
export const RESEND_MS = 60 * 1000;          // minimum gap between two codes for one number
export const WINDOW_MS = 60 * 60 * 1000;
export const MAX_SENDS_PER_WINDOW = 5;       // codes per number per hour
export const MAX_ATTEMPTS = 5;               // wrong guesses per code

const secondsUntil = (ms) => Math.max(1, Math.ceil(ms / 1000));

export const hashCode = (purpose, phone, code) =>
    crypto.createHmac("sha256", process.env.OTP_SECRET || process.env.USER_JWT_SECRET || "dev-only-secret")
        .update(`${purpose}:${phone}:${code}`).digest("hex");

const safeEqual = (a, b) => {
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// tiny per-IP guard on top of the per-number limits (in memory: resets on restart, fine for a safety net)
const ipHits = new Map();
export const ipLimited = (ip, max = 30) => {
    const now = Date.now();
    const hit = ipHits.get(ip);
    if (!hit || now > hit.reset) { ipHits.set(ip, { count: 1, reset: now + WINDOW_MS }); return false; }
    hit.count += 1;
    return hit.count > max;
};

/**
 * Create + send a code, honouring the cool-down.
 *
 * @param {object}   o
 * @param {string}   o.phone     WhatsApp format, "919876543210"
 * @param {string}   o.purpose   "user" | "employee" | "vendor"
 * @param {(code:string)=>Promise<{sent:boolean}>} o.send   delivers the code
 * @returns {Promise<
 *   {ok:true, expiresIn:number, resendIn:number} |
 *   {ok:false, reason:"cooldown"|"limit"|"send_failed", retryAfter:number}>}
 */
export async function issueOtp({ phone, purpose, send }) {
    const now = new Date();

    // Fast, friendly answers first (the atomic claim below is what actually enforces them).
    const row = await PhoneOtp.findOne({ phone, purpose }).lean();
    if (row) {
        const waitMs = RESEND_MS - (now - row.lastSentAt);
        if (waitMs > 0) return { ok: false, reason: "cooldown", retryAfter: secondsUntil(waitMs) };
        if (now - row.windowStart < WINDOW_MS && row.sendCount >= MAX_SENDS_PER_WINDOW) {
            return { ok: false, reason: "limit", retryAfter: secondsUntil(row.windowStart.getTime() + WINDOW_MS - now) };
        }
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const windowCutoff = new Date(now.getTime() - WINDOW_MS);
    const coolCutoff = new Date(now.getTime() - RESEND_MS);
    const inWindow = { $gt: ["$windowStart", windowCutoff] };

    try {
        // Matches only if the cool-down has passed (or there is no row yet). If a row exists but is still
        // cooling down, the filter misses → Mongo tries to insert → unique index {phone, purpose} rejects it.
        await PhoneOtp.updateOne(
            { phone, purpose, lastSentAt: { $lte: coolCutoff } },
            [{
                $set: {
                    codeHash: { $literal: hashCode(purpose, phone, code) },
                    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
                    attempts: 0,
                    lastSentAt: now,
                    windowStart: { $cond: [inWindow, "$windowStart", now] },
                    sendCount: { $cond: [inWindow, { $add: [{ $ifNull: ["$sendCount", 0] }, 1] }, 1] },
                    purgeAt: new Date(now.getTime() + WINDOW_MS),
                },
            }],
            { upsert: true }
        );
    } catch (err) {
        if (err?.code === 11000) {
            const cur = await PhoneOtp.findOne({ phone, purpose }).lean();
            const waitMs = cur ? RESEND_MS - (Date.now() - cur.lastSentAt) : RESEND_MS;
            return { ok: false, reason: "cooldown", retryAfter: secondsUntil(waitMs) };
        }
        throw err;
    }

    // The slot is ours. A failed delivery still keeps the cool-down, so a broken WhatsApp setup
    // cannot be hammered with retries.
    const result = await send(code);
    if (!result?.sent) return { ok: false, reason: "send_failed", retryAfter: RESEND_MS / 1000 };

    return { ok: true, expiresIn: OTP_TTL_MS / 1000, resendIn: RESEND_MS / 1000 };
}

/**
 * Check a code. On success the code is burned (single use).
 * @returns {Promise<{ok:true} | {ok:false, status:number, message:string}>}
 */
export async function verifyOtp({ phone, purpose, otp }) {
    const row = await PhoneOtp.findOne({ phone, purpose });
    if (!row || row.expiresAt < new Date()) {
        return { ok: false, status: 400, message: "This code has expired. Please request a new one." };
    }
    if (row.attempts >= MAX_ATTEMPTS) {
        return { ok: false, status: 429, message: "Too many wrong attempts. Please request a new code." };
    }

    if (!safeEqual(hashCode(purpose, phone, otp), row.codeHash)) {
        const upd = await PhoneOtp.findOneAndUpdate({ _id: row._id }, { $inc: { attempts: 1 } }, { new: true });
        const left = Math.max(0, MAX_ATTEMPTS - (upd?.attempts ?? MAX_ATTEMPTS));
        return {
            ok: false,
            status: 400,
            message: left ? `Incorrect code. ${left} attempt${left > 1 ? "s" : ""} left.` : "Too many wrong attempts. Please request a new code.",
        };
    }

    // Single use: only the request that actually flips the row to "used" may log in.
    // The row is kept (not deleted) so the cool-down and hourly counters survive a successful login.
    const used = await PhoneOtp.updateOne(
        { _id: row._id, codeHash: row.codeHash },
        { $set: { expiresAt: new Date(0), codeHash: "used" } }
    );
    if (!used.modifiedCount) return { ok: false, status: 400, message: "This code was already used. Please request a new one." };
    return { ok: true };
}

/** Map a failed issueOtp() result to an HTTP status + body. */
export function issueFailureResponse(result, { fallback } = {}) {
    if (result.reason === "cooldown") {
        return { status: 429, body: { message: `Please wait ${result.retryAfter}s before requesting another code.`, retryAfter: result.retryAfter } };
    }
    if (result.reason === "limit") {
        return { status: 429, body: { message: "Too many codes requested. Please try again after some time.", retryAfter: result.retryAfter } };
    }
    return {
        status: 503,
        body: {
            message: fallback
                ? "Could not send the WhatsApp code. Use SMS verification instead."
                : "Could not send the WhatsApp code. Please try again in a minute.",
            retryAfter: result.retryAfter,
            ...(fallback ? { fallback } : {}),
        },
    };
}
