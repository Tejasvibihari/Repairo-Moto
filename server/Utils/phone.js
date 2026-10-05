// Utils/phone.js
// One definition of "the same phone number" for login. Numbers reach us as "9876543210",
// "+91 98765-43210", "919876543210" (WhatsApp / Firebase) and old accounts were saved exactly as typed,
// so everything is compared on the last 10 digits (Indian mobile numbers).
const DEFAULT_CC = process.env.DEFAULT_COUNTRY_CODE || "91";

const digitsOf = (raw) => String(raw ?? "").replace(/\D/g, "");

/** Last 10 digits, or null if this cannot be a mobile number. */
export function localNumber(raw) {
    let d = digitsOf(raw);
    if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    if (d.length === 12 && d.startsWith(DEFAULT_CC)) d = d.slice(DEFAULT_CC.length);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/** "919876543210" — what the WhatsApp API wants (country code, no "+"). Accepts other countries' full numbers. */
export function toWhatsAppNumber(raw) {
    const local = localNumber(raw);
    if (local) return DEFAULT_CC + local;
    const d = digitsOf(raw);
    return d.length >= 11 && d.length <= 15 ? d : null;
}

/** Looks like a phone number rather than an email (used by the single "Phone or Email" login field). */
export const looksLikePhone = (value) =>
    !!value && !String(value).includes("@") && digitsOf(value).length >= 10 && /^[\d+\-\s()]+$/.test(String(value).trim());

/**
 * Mongo filter matching a stored `phone` however it was typed:
 * 9876543210 / 09876543210 / +91 9876543210 / 91-98765-43210 ...
 */
export function phoneMatchQuery(raw) {
    const local = localNumber(raw);
    if (!local) return null;
    const sep = "[\\s\\-()]*";
    return { phone: { $regex: new RegExp(`^\\s*(?:\\+?${sep}${DEFAULT_CC}${sep})?0?${sep}${local.split("").join(sep)}\\s*$`) } };
}
