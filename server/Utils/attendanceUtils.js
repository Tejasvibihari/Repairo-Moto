// Utils/attendanceUtils.js
//
// Pure helpers for the attendance feature (no DB, no network) — IST date keys,
// location validation, phone normalising and the WhatsApp message template.

const IST = "Asia/Kolkata";

// ─── Time (IST) ───────────────────────────────────────────────────────────────

/** "2026-10-03" — the IST calendar day of a Date. */
export const istDateKey = (d = new Date()) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d);

/** "2026-10" — the IST month of a Date. */
export const istMonthKey = (d = new Date()) => istDateKey(d).slice(0, 7);

export const formatTimeIST = (d) =>
    new Date(d).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true, timeZone: IST,
    }).toUpperCase();

export const formatDateIST = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: IST,
    });

export const minutesBetween = (from, to) =>
    Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000));

export const isValidMonthKey = (s) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(s || ""));

// ─── Location ─────────────────────────────────────────────────────────────────

/**
 * Validate the location the app sends.
 * @returns {{ok: true, value: object} | {ok: false, message: string}}
 */
export function parseLocation(body = {}) {
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (body.lat === undefined || body.lng === undefined || body.lat === null || body.lng === null
        || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return { ok: false, message: "Location is required to mark attendance." };
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return { ok: false, message: "Invalid location coordinates." };
    }
    const accuracy = Number(body.accuracy);
    const address = typeof body.address === "string" ? body.address.trim().slice(0, 300) : "";
    return {
        ok: true,
        value: {
            lat,
            lng,
            accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : undefined,
            address: address || undefined,
            mocked: body.mocked === true,
        },
    };
}

export const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

// ─── Phone numbers ────────────────────────────────────────────────────────────

/**
 * Normalise to digits-only with country code (what WhatsApp APIs expect, no "+").
 *   "98765 43210" → "919876543210" · "+91 98765-43210" → "919876543210" · "09876543210" → "919876543210"
 * Returns null when it does not look like a phone number.
 */
export function normalizePhone(raw, defaultCountry = "91") {
    const digits = String(raw ?? "").replace(/\D/g, "");
    if (!digits) return null;
    if (digits.length === 10) return defaultCountry + digits;
    if (digits.length === 11 && digits.startsWith("0")) return defaultCountry + digits.slice(1);
    if (digits.length >= 11 && digits.length <= 15) return digits;
    return null;
}

/** Employee's own number first (if enabled), then every active extra number — de-duplicated. */
export function resolveWhatsAppRecipients(employee, settings) {
    const out = [];
    const seen = new Set();
    const add = (num) => {
        const n = normalizePhone(num);
        if (n && !seen.has(n)) { seen.add(n); out.push(n); }
    };
    if (settings?.notifyEmployee !== false) add(employee?.phone);
    for (const entry of settings?.numbers || []) {
        if (entry.active !== false) add(entry.number);
    }
    return out;
}

// ─── WhatsApp message (fixed placeholders) ────────────────────────────────────

export const ATTENDANCE_WA_TEMPLATE =
    `✅ *Attendance Marked*
👤 Name: {{name}}
💼 Role: {{role}}
📅 Date: {{date}}
⏰ Time: {{time}}
📍 Location: {{address}}
🗺️ Map: {{mapLink}}
— Repairo Moto`;

// Order matters if your provider uses numbered template variables ({{1}}, {{2}} ...)
export const ATTENDANCE_WA_PARAM_ORDER = ["name", "role", "date", "time", "address", "mapLink"];

const titleCase = (s) => String(s || "").replace(/\b\w/g, (c) => c.toUpperCase());

export const employeeName = (e) =>
    [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim() || e?.email || "An employee";

/** Everything the template (and the admin push) needs, from the employee + attendance record. */
export function attendanceVars(employee, record) {
    const at = record.checkIn?.at || new Date();
    const { lat, lng, address } = record.checkIn || {};
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    return {
        name: employeeName(employee),
        role: titleCase(employee?.position || employee?.role || "employee"),
        date: formatDateIST(at),
        time: formatTimeIST(at),
        address: address || (hasCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Not available"),
        mapLink: hasCoords ? mapsLink(lat, lng) : "Not available",
    };
}

export const fillTemplate = (template, vars) =>
    template.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : ""));

export const buildAttendanceMessage = (vars) => fillTemplate(ATTENDANCE_WA_TEMPLATE, vars);
export const buildAttendanceParams = (vars) => ATTENDANCE_WA_PARAM_ORDER.map((k) => String(vars[k] ?? ""));
