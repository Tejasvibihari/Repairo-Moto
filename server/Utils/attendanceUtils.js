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

// ─── Breaks ───────────────────────────────────────────────────────────────────

/** Milliseconds spent on break. A break with no `end` is still running → counted up to `until`. */
export function breakMsOf(breaks = [], until = new Date()) {
    const to = new Date(until).getTime();
    let ms = 0;
    for (const b of breaks || []) {
        if (!b?.start) continue;
        const end = b.end ? new Date(b.end).getTime() : to;
        ms += Math.max(0, end - new Date(b.start).getTime());
    }
    return ms;
}

export const breakMinutesOf = (breaks, until) => Math.round(breakMsOf(breaks, until) / 60000);

/** Only the breaks that have finished (a running one is not counted). */
export const closedBreakMinutes = (breaks) => breakMinutesOf((breaks || []).filter((b) => b?.end));

/** The break the employee is on right now, or null. */
export const openBreakOf = (breaks = []) => (breaks || []).find((b) => b?.start && !b.end) || null;

/** Finish any running break at `at` (used when the employee signs out while on a break). */
export const closeOpenBreaks = (breaks = [], at) =>
    (breaks || []).map((b) => ({ start: b.start, end: b.end || (b.start ? at : undefined) }));

/** Working minutes between check-in and `until`, with break time taken out. */
export function netWorkedMinutes(checkInAt, until, breaks = []) {
    const gross = new Date(until).getTime() - new Date(checkInAt).getTime();
    return Math.max(0, Math.round((gross - breakMsOf(breaks, until)) / 60000));
}

// ─── Admin report ─────────────────────────────────────────────────────────────

export const MAX_REPORT_DAYS = 62;

/**
 * Turn raw attendance records (+ the employee list) into flat rows for the admin screen.
 *   status: working | on_break | completed | missed_signout | absent
 * - "working"        checked in today, not signed out yet (minutes keep growing)
 * - "on_break"       checked in today and currently on a break (minutes are paused)
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
        const open = live ? openBreakOf(r.breaks) : null;
        const status = out ? "completed" : live ? (open ? "on_break" : "working") : "missed_signout";
        rows.push({
            _id: String(r._id),
            ...person(e, r.employeeId),
            date: r.date,
            status,
            checkIn: r.checkIn || null,
            checkOut: out ? r.checkOut : null,
            // net of breaks; while on a break the figure is naturally frozen at break start
            minutes: out ? (r.workedMinutes || 0) : live ? netWorkedMinutes(r.checkIn.at, now, r.breaks) : 0,
            breaks: (r.breaks || []).map((b) => ({ start: b.start, end: b.end || null })),
            breakMinutes: closedBreakMinutes(r.breaks),          // finished breaks only
            onBreakSince: open ? open.start : null,              // the app ticks the running one itself
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
                breaks: [],
                breakMinutes: 0,
                onBreakSince: null,
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
        onBreak: rows.filter((r) => r.status === "on_break").length,
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

// ─── WhatsApp templates (Meta-approved, English (US)) ─────────────────────────
//
// All four templates share the same body:  {{1}} employee · {{2}} date · {{3}} time · {{4}} location
// and the same dynamic URL button:         https://www.google.com/maps/search/?api=1&query={{1}}
// (the button value is the URL-encoded "lat,lng", e.g. 28.6139%2C77.2090)

export const ATTENDANCE_EVENTS = {
    check_in:    { template: "employee_attendancemarked", label: "Attendance marked" },
    break_start: { template: "employee_breakstarted",     label: "Break started" },
    break_end:   { template: "employee_break_ended",      label: "Break ended" },
    check_out:   { template: "employee_signed_out",       label: "Signed out" },
};

export const ATTENDANCE_WA_LANGUAGE = "en_US";   // "English (US)"

const NA = "Not available";

/** WhatsApp rejects template variables that are empty or contain newlines / tabs / 4+ spaces. */
export const cleanTemplateParam = (value, fallback = NA, max = 300) => {
    const s = String(value ?? "").replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, max);
    return s || fallback;
};

/** Value for the button's {{1}}: URL-encoded "lat,lng" (comma → %2C). null when there are no coordinates. */
export const mapsButtonParam = (lat, lng) =>
    Number.isFinite(lat) && Number.isFinite(lng) ? encodeURIComponent(`${lat},${lng}`) : null;

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

/**
 * Template variables for one attendance event.
 * @param {object} employee
 * @param {{at?: Date, lat?: number, lng?: number, address?: string}} stamp  when + where it happened
 * @returns {{bodyParams: string[], buttonParam: string}}
 */
export function buildEventTemplateData(employee, stamp = {}) {
    const at = stamp.at || new Date();
    const { lat, lng, address } = stamp;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    const location = address || (hasCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : NA);
    return {
        bodyParams: [
            cleanTemplateParam(employeeName(employee), "An employee", 60),
            formatDateIST(at),
            formatTimeIST(at),
            cleanTemplateParam(location),
        ],
        // The URL button always needs a value; with no coordinates fall back to searching the address text.
        buttonParam: mapsButtonParam(lat, lng) ?? encodeURIComponent(cleanTemplateParam(address, "India", 100)),
    };
}

/**
 * Where did this break event happen?
 * 1) location the app sent with the tap  2) the phone's last live ping (≤ 30 min old)  3) today's check-in spot
 */
export function resolveBreakStamp({ own, employee, checkIn, at, maxPingAgeMs = 30 * 60 * 1000 }) {
    if (Number.isFinite(own?.lat) && Number.isFinite(own?.lng)) return { ...own, at };
    const cur = employee?.currentLocation;
    const fresh = cur?.updatedAt && Date.now() - new Date(cur.updatedAt).getTime() <= maxPingAgeMs;
    if (fresh && Number.isFinite(cur.lat) && Number.isFinite(cur.lng)) return { lat: cur.lat, lng: cur.lng, at };
    if (Number.isFinite(checkIn?.lat) && Number.isFinite(checkIn?.lng)) {
        return { lat: checkIn.lat, lng: checkIn.lng, address: checkIn.address, at };
    }
    return { at };
}
