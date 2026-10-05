// services/whatsappService.js
//
// The ONE place that talks to WhatsApp (Meta WhatsApp Business Cloud API).
// Everything else (OTP login, attendance alerts, future notifications) calls the helpers below.
//
// Config (server/.env):
//   WHATSAPP_ACCESS_TOKEN        permanent System-User token (Meta Business Settings → System users)
//   WHATSAPP_PHONE_NUMBER_ID     the "Phone number ID" from WhatsApp Manager → API setup
//   WHATSAPP_API_VERSION         optional, default v21.0
//   WHATSAPP_OTP_TEMPLATE        optional, default "otp"     (the AUTHENTICATION template name)
//   WHATSAPP_OTP_LANGUAGE        optional, default "en_US"   (English (US))
//   WHATSAPP_ATTENDANCE_TEMPLATE optional — approved template for attendance alerts (see sendAttendanceWhatsApp)
//
// Every helper RETURNS { to, sent, ... } and never throws: a WhatsApp problem must never crash a request.
import axios from "axios";
import AttendanceSettings from "../Models/attendanceSettings.js";
import {
    attendanceVars,
    buildAttendanceMessage,
    buildAttendanceParams,
    resolveWhatsAppRecipients,
} from "../Utils/attendanceUtils.js";
import { toWhatsAppNumber } from "../Utils/phone.js";

const cfg = () => ({
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    version: process.env.WHATSAPP_API_VERSION || "v21.0",
    otpTemplate: process.env.WHATSAPP_OTP_TEMPLATE || "otp",
    otpLanguage: process.env.WHATSAPP_OTP_LANGUAGE || "en_US",
    attendanceTemplate: process.env.WHATSAPP_ATTENDANCE_TEMPLATE || "",
});

export const isWhatsAppConfigured = () => {
    const { token, phoneNumberId } = cfg();
    return !!(token && phoneNumberId);
};

/** POST one message to the Cloud API. Resolves with Meta's response; rejects with the axios error. */
async function post(payload) {
    const { token, phoneNumberId, version } = cfg();
    const { data } = await axios.post(
        `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
        { messaging_product: "whatsapp", recipient_type: "individual", ...payload },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    return data;
}

const describeError = (err) => {
    const e = err?.response?.data?.error;
    return e ? `${e.message}${e.code ? ` (code ${e.code})` : ""}` : err.message;
};

/** Run `payload` through the API with the shared config/validation/error handling. */
async function deliver(rawTo, payload, label) {
    const to = toWhatsAppNumber(rawTo);
    if (!to) return { to: rawTo, sent: false, error: "Invalid phone number" };
    if (!isWhatsAppConfigured()) {
        console.log(`[whatsapp] not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID) — skipped ${label} to ${to}`);
        return { to, sent: false, skipped: true, error: "WhatsApp is not configured" };
    }
    try {
        const data = await post({ to, ...payload });
        return { to, sent: true, messageId: data?.messages?.[0]?.id || null };
    } catch (err) {
        const error = describeError(err);
        console.error(`[whatsapp] ${label} to ${to} failed:`, error);
        return { to, sent: false, error };
    }
}

/**
 * Send an approved template.
 * @param {object} o
 * @param {string} o.to            any phone format ("9876543210", "+91 98765 43210", "919876543210")
 * @param {string} o.name          template name
 * @param {string} [o.language]    e.g. "en_US"
 * @param {string[]} [o.bodyParams] values for {{1}}, {{2}} ... in the body
 * @param {string}  [o.buttonParam] value for a dynamic URL / copy-code button (index 0)
 */
export function sendWhatsAppTemplate({ to, name, language = "en_US", bodyParams = [], buttonParam }) {
    const components = [];
    if (bodyParams.length) {
        components.push({ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: String(t) })) });
    }
    if (buttonParam != null) {
        components.push({ type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: String(buttonParam) }] });
    }
    return deliver(to, { type: "template", template: { name, language: { code: language }, components } }, `template "${name}"`);
}

/** Plain text. WhatsApp only delivers this inside the 24h window after the customer messaged us — use templates otherwise. */
export function sendWhatsAppText({ to, body }) {
    return deliver(to, { type: "text", text: { body, preview_url: false } }, "text");
}

/**
 * Login OTP through the AUTHENTICATION template.
 * Authentication templates take the code twice: once in the body ("{{1}} is your verification code")
 * and once in the Copy-code / One-tap / Zero-tap button — Meta rejects the call if either is missing.
 */
export function sendWhatsAppOtp(to, code) {
    const { otpTemplate, otpLanguage } = cfg();
    return sendWhatsAppTemplate({ to, name: otpTemplate, language: otpLanguage, bodyParams: [code], buttonParam: code });
}

// ─── Backwards-compatible helpers used by the attendance feature ─────────────────────────────

/** Send one message: a template when `template` is given, otherwise plain text. */
export function sendWhatsAppMessage({ to, message, params = [], template, language = "en_US" }) {
    return template
        ? sendWhatsAppTemplate({ to, name: template, language, bodyParams: params })
        : sendWhatsAppText({ to, body: message });
}

/**
 * Tell everyone on the list that `employee` marked attendance.
 * Recipients = the employee (if admin left that on) + every active number the admin added.
 * Business-initiated, so Meta needs an approved template: set WHATSAPP_ATTENDANCE_TEMPLATE
 * (its body variables are filled from buildAttendanceParams). Without it plain text is attempted,
 * which only works inside the 24h customer-service window.
 */
export async function sendAttendanceWhatsApp(employee, record) {
    try {
        const settings = await AttendanceSettings.findOne().lean();
        if (settings && settings.whatsappEnabled === false) return [];

        const recipients = resolveWhatsAppRecipients(employee, settings);
        if (!recipients.length) return [];

        const vars = attendanceVars(employee, record);
        const message = buildAttendanceMessage(vars);
        const params = buildAttendanceParams(vars);
        const { attendanceTemplate } = cfg();

        return await Promise.all(
            recipients.map((to) => sendWhatsAppMessage({ to, message, params, template: attendanceTemplate || undefined }))
        );
    } catch (err) {
        console.error("[whatsapp] attendance alert failed:", err.message);
        return [];
    }
}
