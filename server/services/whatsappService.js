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
//   WHATSAPP_ATTENDANCE_LANGUAGE optional, default "en_US" — language of the 4 attendance templates
//   WHATSAPP_TPL_CHECK_IN / _BREAK_START / _BREAK_END / _CHECK_OUT
//   WHATSAPP_TPL_ORDER_UPDATE / WHATSAPP_ORDER_LANGUAGE
//                                customer order-status template (default "order_status_update", en_US).
//                                Body: {{1}} customer name, {{2}} order id, {{3}} status message
//                                optional template-name overrides (defaults: employee_attendancemarked,
//                                employee_breakstarted, employee_break_ended, employee_signed_out)
//
// Every helper RETURNS { to, sent, ... } and never throws: a WhatsApp problem must never crash a request.
import axios from "axios";
import AttendanceSettings from "../Models/attendanceSettings.js";
import {
    ATTENDANCE_EVENTS,
    ATTENDANCE_WA_LANGUAGE,
    buildEventTemplateData,
    resolveWhatsAppRecipients,
} from "../Utils/attendanceUtils.js";
import { toWhatsAppNumber } from "../Utils/phone.js";
import AdminSettings from "../Models/adminSettings.js";
import User from "../Models/userModel.js";

const cfg = () => ({
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    version: process.env.WHATSAPP_API_VERSION || "v21.0",
    otpTemplate: process.env.WHATSAPP_OTP_TEMPLATE || "otp",
    otpLanguage: process.env.WHATSAPP_OTP_LANGUAGE || "en_US",
    attendanceLanguage: process.env.WHATSAPP_ATTENDANCE_LANGUAGE || ATTENDANCE_WA_LANGUAGE,
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
        {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            ...payload
        },
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

const TEMPLATE_ENV = {
    check_in: "WHATSAPP_TPL_CHECK_IN",
    break_start: "WHATSAPP_TPL_BREAK_START",
    break_end: "WHATSAPP_TPL_BREAK_END",
    check_out: "WHATSAPP_TPL_CHECK_OUT",
};

/**
 * Tell everyone on the list about one attendance event.
 *   event: "check_in" | "break_start" | "break_end" | "check_out"
 *   stamp: { at, lat, lng, address } — when and where it happened
 * Recipients = the employee (if admin left that on) + every active number in the attendance settings.
 * Business-initiated, so each event uses its approved template (body {{1}}-{{4}} + the Google Maps button).
 * Never throws and is safe to call without await.
 */
export async function sendAttendanceEventWhatsApp(event, employee, stamp) {
    try {
        const def = ATTENDANCE_EVENTS[event];
        if (!def) return [];

        const settings = await AttendanceSettings.findOne().lean();
        if (settings && settings.whatsappEnabled === false) return [];

        const recipients = resolveWhatsAppRecipients(employee, settings);
        if (!recipients.length) return [];

        const { attendanceLanguage } = cfg();
        const name = process.env[TEMPLATE_ENV[event]] || def.template;
        const { bodyParams, buttonParam } = buildEventTemplateData(employee, stamp);

        return await Promise.all(
            recipients.map((to) => sendWhatsAppTemplate({ to, name, language: attendanceLanguage, bodyParams, buttonParam }))
        );
    } catch (err) {
        console.error(`[whatsapp] attendance ${event} alert failed:`, err.message);
        return [];
    }
}

/** Kept for older callers: "attendance marked" alert built from a check-in record. */
export const sendAttendanceWhatsApp = (employee, record) =>
    sendAttendanceEventWhatsApp("check_in", employee, record?.checkIn);


// ─── Customer order-status alerts ────────────────────────────────────────────────────────────

/** Notification types that are customer-facing order progress. OTP / chat / promo types are deliberately NOT here. */
export const ORDER_WHATSAPP_TYPES = new Set([
    "new_order", "order_update", "order_cancelled", "order_rescheduled", "order_assigned", "mechanic_assigned",
    "mechanic_started", "mechanic_arrived", "work_started", "order_confirmed_complete", "delivery_assigned",
    "delivery_update", "invoice_generated", "payment_received",
]);

/** Admin master switch (defaults to ON when the setting has never been saved). */
export async function isOrderWhatsAppEnabled() {
    const s = await AdminSettings.findOne({}, "whatsappNotifications").lean();
    return s?.whatsappNotifications?.orderStatusEnabled !== false;
}

// WhatsApp template parameters may not contain newlines/tabs or 4+ consecutive spaces.
const clean = (t) => String(t ?? "").replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 900);

/**
 * Send the customer a WhatsApp copy of an order notification. Never throws, safe without await.
 * Called from createNotification() so every existing order event is covered in one place.
 */
export async function sendOrderStatusWhatsApp({ userIds = [], orderRef, body, type }) {
    try {
        if (!ORDER_WHATSAPP_TYPES.has(type) || !userIds.length || !body) return [];
        if (!isWhatsAppConfigured()) return [];
        if (!(await isOrderWhatsAppEnabled())) return [];

        const users = await User.find({ _id: { $in: userIds } }, "firstName phone").lean();
        const name = process.env.WHATSAPP_TPL_ORDER_UPDATE || "order_status_update";
        const language = process.env.WHATSAPP_ORDER_LANGUAGE || "en_US";
        return await Promise.all(users.filter((u) => u.phone).map((u) => sendWhatsAppTemplate({
            to: u.phone,
            name,
            language,
            bodyParams: [clean(u.firstName) || "Customer", clean(orderRef) || "-", clean(body)],
        })));
    } catch (err) {
        console.error("[whatsapp] order status alert failed:", err.message);
        return [];
    }
}
