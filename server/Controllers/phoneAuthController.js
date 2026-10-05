// Controllers/phoneAuthController.js
//
// Passwordless customer login by phone number. ONE account per number, whichever way it logs in:
//   • number already belongs to an account (even one made with email + password) → log into THAT account
//   • number is new → create the account right away
//
//   POST /api/user/auth/phone/send-otp   { phone }            → code sent on WhatsApp (primary)
//   POST /api/user/auth/phone/verify-otp { phone, otp }       → login / sign-up
//   POST /api/user/auth/phone/firebase   { idToken }          → login / sign-up from Firebase Phone Verification (secondary)
import User from "../Models/userModel.js";
import { generateReferralCode } from "../Utils/generateReferralCode.js";
import { localNumber, phoneMatchQuery, toWhatsAppNumber } from "../Utils/phone.js";
import { isWhatsAppConfigured, sendWhatsAppOtp } from "../services/whatsappService.js";
import { verifyFirebasePhoneToken } from "../Utils/firebaseVerify.js";
import { signUserToken, userAuthPayload } from "../Utils/userAuth.js";
import { issueOtp, verifyOtp, ipLimited, issueFailureResponse } from "../services/otpService.js";

const PURPOSE = "user";

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
        const result = await issueOtp({
            phone,
            purpose: PURPOSE,
            send: async (code) => {
                // Local testing without Meta credentials: WHATSAPP_OTP_DEV_LOG=true prints the code in the server console.
                if (process.env.WHATSAPP_OTP_DEV_LOG === "true" && !isWhatsAppConfigured()) {
                    console.log(`[otp] DEV — code for ${phone}: ${code}`);
                    return { sent: true };
                }
                return sendWhatsAppOtp(phone, code);
            },
        });

        if (!result.ok) {
            // On a delivery failure, tell the app to switch to the secondary method (Firebase SMS verification).
            const { status, body } = issueFailureResponse(result, { fallback: "firebase" });
            return res.status(status).json(body);
        }

        res.json({ success: true, channel: "whatsapp", expiresIn: result.expiresIn, resendIn: result.resendIn });
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

        const checked = await verifyOtp({ phone: toWhatsAppNumber(local), purpose: PURPOSE, otp });
        if (!checked.ok) return res.status(checked.status).json({ message: checked.message });

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
