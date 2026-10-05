// Controllers/staffOtpController.js
//
// WhatsApp-OTP login for EMPLOYEES and VENDORS (never for admins).
//
//   POST /api/employee/auth/send-otp    { phone }        → code on WhatsApp
//   POST /api/employee/auth/verify-otp  { phone, otp }   → same response as employee-sign-in
//   POST /api/vendor/auth/send-otp      { phone }
//   POST /api/vendor/auth/verify-otp    { phone, otp }   → same response as vendor-sign-in
//
// Accounts are NOT created here: the number must already belong to an employee / vendor that the admin
// added. Unknown numbers are rejected before any WhatsApp message is sent (no cost, no spam).
// The 1-minute resend cool-down lives in services/otpService.js and is returned as `retryAfter` (seconds)
// so the apps can show the countdown.
import Employee from "../Models/employeeModel.js";
import Vendor from "../Models/vendorModel.js";
import { localNumber, phoneMatchQuery, toWhatsAppNumber } from "../Utils/phone.js";
import { isWhatsAppConfigured, sendWhatsAppOtp } from "../services/whatsappService.js";
import { issueOtp, verifyOtp, ipLimited, issueFailureResponse } from "../services/otpService.js";
import { buildEmployeeSession } from "./employeeController.js";
import { buildVendorSession } from "./vendorController.js";

/**
 * @param {object}   cfg
 * @param {"employee"|"vendor"} cfg.purpose
 * @param {import("mongoose").Model} cfg.Model
 * @param {(doc:any)=>boolean} cfg.allowed        false → this account may not use WhatsApp login
 * @param {(doc:any)=>object}  cfg.buildSession   JSON body to return after a successful login
 */
function makeStaffOtpHandlers({ purpose, Model, allowed, buildSession }) {
    /** @returns {Promise<{doc?:any, status?:number, message?:string}>} */
    async function findAccount(local) {
        const matches = await Model.find(phoneMatchQuery(local)).limit(2);
        if (!matches.length) {
            return { status: 404, message: `No ${purpose} account is registered with this mobile number. Please contact the admin.` };
        }
        if (matches.length > 1) {
            // legacy data: the same number saved on two accounts. Never guess which one is meant.
            return { status: 409, message: "This mobile number is linked to more than one account. Please contact the admin." };
        }
        if (!allowed(matches[0])) {
            return { status: 403, message: "WhatsApp login is not available for this account. Please sign in with your password." };
        }
        return { doc: matches[0] };
    }

    const sendOtp = async (req, res) => {
        try {
            const local = localNumber(req.body?.phone);
            if (!local) return res.status(400).json({ message: "Enter a valid 10-digit mobile number." });
            if (ipLimited(req.ip)) return res.status(429).json({ message: "Too many requests. Please try again later." });

            const account = await findAccount(local);
            if (!account.doc) return res.status(account.status).json({ message: account.message });

            const phone = toWhatsAppNumber(local);
            const result = await issueOtp({
                phone,
                purpose,
                send: async (code) => {
                    // Local testing without Meta credentials: WHATSAPP_OTP_DEV_LOG=true prints the code in the server console.
                    if (process.env.WHATSAPP_OTP_DEV_LOG === "true" && !isWhatsAppConfigured()) {
                        console.log(`[otp] DEV — ${purpose} code for ${phone}: ${code}`);
                        return { sent: true };
                    }
                    return sendWhatsAppOtp(phone, code);
                },
            });

            if (!result.ok) {
                const { status, body } = issueFailureResponse(result);
                return res.status(status).json(body);
            }
            res.json({ success: true, channel: "whatsapp", expiresIn: result.expiresIn, resendIn: result.resendIn });
        } catch (err) {
            console.error(`[staffOtp:${purpose}] send-otp:`, err);
            res.status(500).json({ message: "Could not send the code. Please try again." });
        }
    };

    const verify = async (req, res) => {
        try {
            const local = localNumber(req.body?.phone);
            const otp = String(req.body?.otp ?? "").trim();
            if (!local) return res.status(400).json({ message: "Enter a valid 10-digit mobile number." });
            if (!/^\d{6}$/.test(otp)) return res.status(400).json({ message: "Enter the 6-digit code." });

            const account = await findAccount(local);
            if (!account.doc) return res.status(account.status).json({ message: account.message });

            const checked = await verifyOtp({ phone: toWhatsAppNumber(local), purpose, otp });
            if (!checked.ok) return res.status(checked.status).json({ message: checked.message });

            res.status(200).json(buildSession(account.doc));
        } catch (err) {
            console.error(`[staffOtp:${purpose}] verify-otp:`, err);
            res.status(500).json({ message: "Could not verify the code. Please try again." });
        }
    };

    return { sendOtp, verify };
}

const employee = makeStaffOtpHandlers({
    purpose: "employee",
    Model: Employee,
    // admins sign in with their own admin login — WhatsApp login is for staff and vendors only
    allowed: (doc) => String(doc.position || "").toLowerCase() !== "admin" && String(doc.role || "").toLowerCase() !== "admin",
    buildSession: buildEmployeeSession,
});

const vendor = makeStaffOtpHandlers({
    purpose: "vendor",
    Model: Vendor,
    allowed: () => true,
    buildSession: buildVendorSession,
});

export const employeeSendOtp = employee.sendOtp;
export const employeeVerifyOtp = employee.verify;
export const vendorSendOtp = vendor.sendOtp;
export const vendorVerifyOtp = vendor.verify;
