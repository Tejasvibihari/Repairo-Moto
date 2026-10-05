// Controllers/phoneAuthController.js
//
// Passwordless customer login by phone number. ONE account per number, whichever way it logs in:
//   • number already belongs to an account (even one made with email + password) → log into THAT account
//   • number is new → create the account right away
//
//   POST /api/user/auth/phone/send-otp   { phone }            → code sent on WhatsApp (primary)
//   POST /api/user/auth/phone/verify-otp { phone, otp }       → login / sign-up
//   POST /api/user/auth/phone/firebase   { idToken }          → login / sign-up from Firebase Phone Verification (secondary)
import crypto from "crypto";
import User from "../Models/userModel.js";
import PhoneOtp from "../Models/phoneOtpModel.js";
import { generateReferralCode } from "../Utils/generateReferralCode.js";
import { localNumber, phoneMatchQuery, toWhatsAppNumber } from "../Utils/phone.js";
import { isWhatsAppConfigured, sendWhatsAppOtp } from "../services/whatsappService.js";
import { verifyFirebasePhoneToken } from "../Utils/firebaseVerify.js";
import { signUserToken, userAuthPayload } from "../Utils/userAuth.js";

const OTP_TTL_MS = 5 * 60 * 1000;      // matches "Expires in 5 minutes" on the WhatsApp template
const RESEND_MS = 30 * 1000;           // minimum gap between two codes for one number
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;        // codes per number per hour
const MAX_ATTEMPTS = 5;                // wrong guesses per code

// ─── helpers ──────────────────────────────────────────────────────────────────

const hashCode = (phone, code) =>
    crypto.createHmac("sha256", process.env.OTP_SECRET || process.env.USER_JWT_SECRET || "dev-only-secret")
        .update(`${phone}:${code}`).digest("hex");

const safeEqual = (a, b) => {
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// tiny per-IP guard on top of the per-number limits (in memory: resets on restart, fine for a safety net)
const ipHits = new Map();
const ipLimited = (ip, max = 30) => {
    const now = Date.now();
    const hit = ipHits.get(ip);
    if (!hit || now > hit.reset) { ipHits.set(ip, { count: 1, reset: now + WINDOW_MS }); return false; }
    hit.count += 1;
    return hit.count > max;
};

/** @returns {Promise<{user, created: boolean}>} */
async function createPhoneUser(local, method) {
    for (let i = 0; i < 5; i++) {
        try {
            const user = await User.create({
                firstName: "Customer",
                phone: local,
                accountType: "personal",
                status: "approved",
                referralCode: generateReferralCode("USER", local),
                phoneVerified: true,
                phoneVerifiedAt: new Date(),
                signupMethod: method,
            });
            return { user, created: true };
        } catch (err) {
            if (err?.code !== 11000) throw err;
            const again = await User.findOne(phoneMatchQuery(local));   // someone created it a moment ago
            if (again) return { user: again, created: false };
            // otherwise it was a referral-code clash → try another random code
        }
    }
    throw new Error("Could not create account");
}

/** Core of both verify endpoints. `local` = verified 10-digit number. */
async function loginOrCreateByPhone(local, method, res) {
    let user = await User.findOne(phoneMatchQuery(local));
    let isNewUser = false;
    if (!user) {
        ({ user, created: isNewUser } = await createPhoneUser(local, method));
    }

    if (user.status === "suspended") {
        return res.status(403).json({
            message: "Account is suspended. Please reactivate your account via the website.",
            reactivationUrl: "/account-delete",
        });
    }

    if (!user.phoneVerified) {
        await User.updateOne({ _id: user._id }, { $set: { phoneVerified: true, phoneVerifiedAt: new Date() } });
        user.phoneVerified = true;
    }

    return res.status(200).json({
        message: isNewUser ? "Account created" : "Sign-in successful",
        token: signUserToken(user),
        user: userAuthPayload(user),
        isNewUser,
    });
}

// ─── 1. send the code on WhatsApp ─────────────────────────────────────────────

export const sendPhoneOtp = async (req, res) => {
    try {
        const local = localNumber(req.body?.phone);
        if (!local) return res.status(400).json({ message: "Enter a valid 10-digit mobile number." });
        if (ipLimited(req.ip)) return res.status(429).json({ message: "Too many requests. Please try again later." });

        const phone = toWhatsAppNumber(local);
        const now = new Date();
        const row = await PhoneOtp.findOne({ phone });
        let windowActive = false;
        if (row) {
            const wait = Math.ceil((RESEND_MS - (now - row.lastSentAt)) / 1000);
            if (wait > 0) {
                return res.status(429).json({ message: `Please wait ${wait}s before requesting another code.`, retryAfter: wait });
            }
            windowActive = now - row.windowStart < WINDOW_MS;
            if (windowActive && row.sendCount >= MAX_SENDS_PER_WINDOW) {
                return res.status(429).json({ message: "Too many codes requested. Please try again after some time." });
            }
        }

        const code = String(crypto.randomInt(100000, 1000000));

        // Local testing without Meta credentials: WHATSAPP_OTP_DEV_LOG=true prints the code in the server console.
        const devLog = process.env.WHATSAPP_OTP_DEV_LOG === "true" && !isWhatsAppConfigured();
        if (devLog) {
            console.log(`[otp] DEV — code for ${phone}: ${code}`);
        } else {
            const result = await sendWhatsAppOtp(phone, code);
            if (!result.sent) {
                // Tell the app to switch to the secondary method (Firebase SMS verification).
                return res.status(503).json({
                    message: "Could not send the WhatsApp code. Use SMS verification instead.",
                    fallback: "firebase",
                });
            }
        }

        const windowStart = windowActive ? row.windowStart : now;
        const expiresAt = new Date(now.getTime() + OTP_TTL_MS);
        await PhoneOtp.findOneAndUpdate(
            { phone },
            {
                phone,
                codeHash: hashCode(phone, code),
                expiresAt,
                attempts: 0,
                lastSentAt: now,
                windowStart,
                sendCount: windowActive ? row.sendCount + 1 : 1,
                purgeAt: new Date(Math.max(windowStart.getTime() + WINDOW_MS, expiresAt.getTime())),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, channel: "whatsapp", expiresIn: OTP_TTL_MS / 1000, resendIn: RESEND_MS / 1000 });
    } catch (err) {
        console.error("[phoneAuth] send-otp:", err);
        res.status(500).json({ message: "Could not send the code. Please try again." });
    }
};

// ─── 2. check the code → login or sign-up ─────────────────────────────────────

export const verifyPhoneOtp = async (req, res) => {
    try {
        const local = localNumber(req.body?.phone);
        const otp = String(req.body?.otp ?? "").trim();
        if (!local) return res.status(400).json({ message: "Enter a valid 10-digit mobile number." });
        if (!/^\d{6}$/.test(otp)) return res.status(400).json({ message: "Enter the 6-digit code." });

        const phone = toWhatsAppNumber(local);
        const row = await PhoneOtp.findOne({ phone });
        if (!row || row.expiresAt < new Date()) {
            return res.status(400).json({ message: "This code has expired. Please request a new one." });
        }
        if (row.attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({ message: "Too many wrong attempts. Please request a new code." });
        }

        if (!safeEqual(hashCode(phone, otp), row.codeHash)) {
            const upd = await PhoneOtp.findOneAndUpdate({ _id: row._id }, { $inc: { attempts: 1 } }, { new: true });
            const left = Math.max(0, MAX_ATTEMPTS - (upd?.attempts ?? MAX_ATTEMPTS));
            return res.status(400).json({
                message: left ? `Incorrect code. ${left} attempt${left > 1 ? "s" : ""} left.` : "Too many wrong attempts. Please request a new code.",
            });
        }

        // single use: only the request that actually deletes the row may log in
        const used = await PhoneOtp.deleteOne({ _id: row._id, codeHash: row.codeHash });
        if (!used.deletedCount) return res.status(400).json({ message: "This code was already used. Please request a new one." });

        return await loginOrCreateByPhone(local, "whatsapp", res);
    } catch (err) {
        console.error("[phoneAuth] verify-otp:", err);
        res.status(500).json({ message: "Could not verify the code. Please try again." });
    }
};

// ─── 3. Firebase Phone Number Verification (secondary) ────────────────────────

export const verifyFirebasePhone = async (req, res) => {
    try {
        const idToken = req.body?.idToken;
        if (!idToken) return res.status(400).json({ message: "Missing verification token." });

        let verified;
        try {
            verified = await verifyFirebasePhoneToken(idToken);
        } catch (err) {
            console.warn("[phoneAuth] firebase token rejected:", err.message);
            return res.status(401).json({ message: "Phone verification failed. Please try again." });
        }

        const local = localNumber(verified.phone);
        if (!local) return res.status(400).json({ message: "Only Indian mobile numbers are supported." });

        return await loginOrCreateByPhone(local, "firebase", res);
    } catch (err) {
        console.error("[phoneAuth] firebase:", err);
        res.status(500).json({ message: "Could not sign you in. Please try again." });
    }
};
