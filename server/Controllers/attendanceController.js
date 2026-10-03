// Controllers/attendanceController.js
import Attendance from "../Models/attendanceModel.js";
import AttendanceSettings from "../Models/attendanceSettings.js";
import { createNotification, getAdminRecipients } from "../services/notificationService.js";
// WhatsApp — uncomment this import together with the call inside `checkIn` once the API is ready.
// import { sendAttendanceWhatsApp } from "../services/whatsappService.js";
import {
    attendanceVars,
    formatTimeIST,
    isValidMonthKey,
    istDateKey,
    istMonthKey,
    mapsLink,
    minutesBetween,
    normalizePhone,
    parseLocation,
} from "../Utils/attendanceUtils.js";

const stateOf = (rec) => (!rec ? "not_marked" : rec.checkOut?.at ? "checked_out" : "checked_in");

const getOrCreateSettings = async () =>
    (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));

// Admin gets a DB notification + Expo push. Never throws into the request.
async function notifyAdmins(employee, record) {
    try {
        const v = attendanceVars(employee, record);
        const mocked = record.checkIn?.mocked === true;
        await createNotification({
            type: "attendance",
            title: "✅ Attendance Marked",
            body: `${v.name} (${v.role}) marked attendance at ${v.time}${v.address !== "Not available" ? ` — ${v.address}` : ""}${mocked ? " ⚠️ Fake GPS detected" : ""}`,
            recipients: await getAdminRecipients(),
            data: {
                employeeId: String(employee._id),
                employeeName: v.name,
                at: record.checkIn.at,
                lat: record.checkIn.lat,
                lng: record.checkIn.lng,
                address: record.checkIn.address || null,
                mapUrl: mapsLink(record.checkIn.lat, record.checkIn.lng),
                mocked,
            },
            triggeredBy: { userId: employee._id, userModel: "Employee" },
        });
    } catch (err) {
        console.error("[attendance] admin notify failed:", err.message);
    }
}

// ─── Employee ────────────────────────────────────────────────────────────────

// GET /api/employee/attendance/today
export const getToday = async (req, res) => {
    try {
        const date = istDateKey();
        const attendance = await Attendance.findOne({ employeeId: req.employee._id, date }).lean();
        res.json({ success: true, date, state: stateOf(attendance), attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/employee/attendance/check-in   body: { lat, lng, accuracy?, address?, mocked? }
export const checkIn = async (req, res) => {
    try {
        const loc = parseLocation(req.body);
        if (!loc.ok) return res.status(400).json({ success: false, message: loc.message });

        const date = istDateKey();
        let record;
        try {
            // Unique (employeeId, date) index → a double tap can never create two records
            record = await Attendance.create({
                employeeId: req.employee._id,
                date,
                checkIn: { ...loc.value, at: new Date() },
            });
        } catch (err) {
            if (err?.code === 11000) {
                const existing = await Attendance.findOne({ employeeId: req.employee._id, date }).lean();
                return res.status(409).json({
                    success: false,
                    message: "Attendance already marked for today.",
                    state: stateOf(existing),
                    attendance: existing,
                });
            }
            throw err;
        }

        notifyAdmins(req.employee, record);                     // push to admins
        // sendAttendanceWhatsApp(req.employee, record);        // WhatsApp — uncomment once the API is set up (services/whatsappService.js)

        res.status(201).json({ success: true, date, state: "checked_in", attendance: record });
    } catch (err) {
        console.error("[attendance] check-in failed:", err);
        res.status(500).json({ success: false, message: "Could not mark attendance. Please try again." });
    }
};

// POST /api/employee/attendance/check-out   body: { lat, lng, accuracy?, address?, mocked? }
export const checkOut = async (req, res) => {
    try {
        const loc = parseLocation(req.body);
        if (!loc.ok) return res.status(400).json({ success: false, message: loc.message });

        const date = istDateKey();
        const current = await Attendance.findOne({ employeeId: req.employee._id, date }).lean();
        if (!current?.checkIn?.at) {
            return res.status(400).json({ success: false, message: "Mark your attendance before signing out." });
        }
        if (current.checkOut?.at) {
            return res.status(409).json({
                success: false, message: "You have already signed out today.", state: "checked_out", attendance: current,
            });
        }

        const now = new Date();
        // Filter on "no checkOut yet" → atomic against a double tap
        const updated = await Attendance.findOneAndUpdate(
            { _id: current._id, "checkOut.at": { $exists: false } },
            { $set: { checkOut: { ...loc.value, at: now }, workedMinutes: minutesBetween(current.checkIn.at, now) } },
            { new: true }
        ).lean();

        if (!updated) {
            const latest = await Attendance.findOne({ _id: current._id }).lean();
            return res.status(409).json({
                success: false, message: "You have already signed out today.", state: "checked_out", attendance: latest,
            });
        }
        res.json({ success: true, date, state: "checked_out", attendance: updated });
    } catch (err) {
        console.error("[attendance] check-out failed:", err);
        res.status(500).json({ success: false, message: "Could not sign out. Please try again." });
    }
};

// GET /api/employee/attendance?month=YYYY-MM   (defaults to the current IST month)
export const getMyAttendance = async (req, res) => {
    try {
        const month = req.query.month ? String(req.query.month) : istMonthKey();
        if (!isValidMonthKey(month)) {
            return res.status(400).json({ success: false, message: "month must look like 2026-10." });
        }
        const records = await Attendance.find({
            employeeId: req.employee._id,
            date: { $gte: `${month}-01`, $lte: `${month}-31` },   // string compare on "YYYY-MM-DD" is safe
        }).sort({ date: -1 }).lean();

        res.json({
            success: true,
            month,
            summary: {
                presentDays: records.length,
                totalMinutes: records.reduce((sum, r) => sum + (r.workedMinutes || 0), 0),
            },
            records,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: who gets the WhatsApp message ────────────────────────────────────

const settingsPayload = (s) => ({
    whatsappEnabled: s.whatsappEnabled !== false,
    notifyEmployee: s.notifyEmployee !== false,
    numbers: (s.numbers || []).map((n) => ({ name: n.name || "", number: n.number, active: n.active !== false })),
});

// GET /api/admin/attendance/settings
export const getAttendanceSettings = async (req, res) => {
    try {
        res.json({ success: true, settings: settingsPayload(await getOrCreateSettings()) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/admin/attendance/settings   body: { whatsappEnabled?, notifyEmployee?, numbers?: [{name, number, active}] }
export const updateAttendanceSettings = async (req, res) => {
    try {
        const { whatsappEnabled, notifyEmployee, numbers } = req.body || {};
        const fail = (message) => res.status(400).json({ success: false, message });
        const settings = await getOrCreateSettings();

        if (whatsappEnabled !== undefined) {
            if (typeof whatsappEnabled !== "boolean") return fail("whatsappEnabled must be true or false.");
            settings.whatsappEnabled = whatsappEnabled;
        }
        if (notifyEmployee !== undefined) {
            if (typeof notifyEmployee !== "boolean") return fail("notifyEmployee must be true or false.");
            settings.notifyEmployee = notifyEmployee;
        }
        if (numbers !== undefined) {
            if (!Array.isArray(numbers)) return fail("numbers must be a list.");
            if (numbers.length > 20) return fail("You can add up to 20 numbers.");

            const clean = [];
            const seen = new Set();
            for (const entry of numbers) {
                const number = normalizePhone(entry?.number);
                if (!number) return fail(`"${entry?.number ?? ""}" is not a valid phone number.`);
                if (seen.has(number)) continue;                       // silently drop duplicates
                seen.add(number);
                clean.push({
                    name: String(entry?.name || "").trim().slice(0, 50),
                    number,
                    active: entry?.active !== false,
                });
            }
            settings.numbers = clean;
        }

        await settings.save();
        res.json({ success: true, settings: settingsPayload(settings) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
