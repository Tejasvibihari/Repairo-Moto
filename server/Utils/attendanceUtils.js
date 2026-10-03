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

/** True only for a real calendar day written as "YYYY-MM-DD" (rejects 2026-02-31). */
export function isValidDateKey(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ""))) return false;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Whole days from a to b (both "YYYY-MM-DD"), inclusive of both ends: same day → 1. */
export const daysInclusive = (a, b) => {
    const t = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
    return Math.round((t(b) - t(a)) / 86400000) + 1;
};

// ─── Admin report ─────────────────────────────────────────────────────────────

export const MAX_REPORT_DAYS = 62;

/**
 * Turn raw attendance records (+ the employee list) into flat rows for the admin screen.
 *   status: working | completed | missed_signout | absent
 * - "working"        checked in today, not signed out yet (minutes keep growing)
 * - "missed_signout" checked in on a PAST day and never signed out (hours unknown → 0)
 * - "absent"         only generated for a single-day report, for every employee who had
 *                    already joined by that day and has no record
 */
export function buildReportRows({ employees = [], records = [], from, to, today, now = new Date() }) {
    const byId = new Map(employees.map((e) => [String(e._id), e]));
    const person = (e, id) => ({
        employeeId: String(id),
        name: e ? employeeName(e) : "Deleted employee",
        position: e?.position || e?.role || "employee",
        phone: e?.phone || "",
        profileImage: e?.profileImage || "",
    });

    const rows = [];
    const seen = new Set();
    for (const r of records) {
        const e = byId.get(String(r.employeeId));
        const out = r.checkOut?.at;
        const live = !out && r.date === today;
        const status = out ? "completed" : live ? "working" : "missed_signout";
        rows.push({
            _id: String(r._id),
            ...person(e, r.employeeId),
            date: r.date,
            status,
            checkIn: r.checkIn || null,
            checkOut: out ? r.checkOut : null,
            minutes: out ? (r.workedMinutes || 0) : live ? minutesBetween(r.checkIn.at, now) : 0,
        });
        seen.add(`${r.employeeId}|${r.date}`);
    }

    if (from === to) {
        for (const e of employees) {
            if (seen.has(`${e._id}|${from}`)) continue;
            if (e.createdAt && istDateKey(e.createdAt) > from) continue;     // had not joined yet
            rows.push({
                _id: `absent-${e._id}-${from}`,
                ...person(e, e._id),
                date: from,
                status: "absent",
                checkIn: null,
                checkOut: null,
                minutes: 0,
            });
        }
    }
    return rows;
}

export function summarizeRows(rows, { singleDay, employeeCount }) {
    const present = rows.filter((r) => r.status !== "absent");
    const completed = rows.filter((r) => r.status === "completed");
    const totalMinutes = present.reduce((sum, r) => sum + r.minutes, 0);
    return {
        employees: employeeCount,
        presentEmployees: new Set(present.map((r) => r.employeeId)).size,
        absent: singleDay ? rows.filter((r) => r.status === "absent").length : null,
        working: rows.filter((r) => r.status === "working").length,
        completed: completed.length,
        missedSignOut: rows.filter((r) => r.status === "missed_signout").length,
        totalMinutes,
        avgMinutes: completed.length ? Math.round(completed.reduce((s, r) => s + r.minutes, 0) / completed.length) : 0,
    };
}

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
