// Controllers/staffOverviewController.js
//
// Admin "Staff Overview": one place to see how every employee is doing in a date range.
// What is shown depends on the role:
//   mechanic   → attendance · kilometres travelled · trips · completed orders · rating
//   delivery   → attendance · kilometres travelled · trips / deliveries · completed orders
//   telecaller → attendance · leads created · converted · follow-ups · not reachable
//   others     → attendance
//
//   GET /api/admin/staff-overview?position=mechanic&from=2026-10-01&to=2026-10-31
//   GET /api/admin/staff-overview/:employeeId?from=…&to=…        (day-by-day + trip list)
//
// Everything is computed with a handful of grouped aggregates (no per-employee loops), so the
// list stays fast with many employees.
import mongoose from "mongoose";
import Employee from "../Models/employeeModel.js";
import Attendance from "../Models/attendanceModel.js";
import Trip from "../Models/tripModel.js";
import DutyDistance from "../Models/dutyDistanceModel.js";
import Order from "../Models/orderModel.js";
import Lead from "../Models/leadModel.js";
import {
    MAX_REPORT_DAYS,
    daysInclusive,
    isValidDateKey,
    istDateKey,
} from "../Utils/attendanceUtils.js";
import { toKm } from "../Utils/geo.js";

const POSITIONS = ["mechanic", "delivery", "telecaller", "manager", "operational manager", "employee"];
const DONE_STATUSES = ["Work Completed", "Invoice Generated", "Completed"];
const OPEN_STATUSES = ["Mechanic Assigned", "Mechanic Start", "Mechanic Arrived", "In Progress", "Completion Requested"];
const CONVERTED = ["booked", "completed", "direct_booking"];

const nameOf = (e) => [e.firstName, e.lastName].filter(Boolean).join(" ").trim() || e.email;
const istStart = (key) => new Date(`${key}T00:00:00.000+05:30`);
const istEnd = (key) => new Date(`${key}T23:59:59.999+05:30`);
const oid = (id) => new mongoose.Types.ObjectId(String(id));
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

function parseRange(query) {
    const today = istDateKey();
    const from = query.from ? String(query.from) : today.slice(0, 8) + "01";   // default: this month
    const to = query.to ? String(query.to) : today;
    if (!isValidDateKey(from) || !isValidDateKey(to)) return { error: "from and to must look like 2026-10-03." };
    if (from > to) return { error: "from must not be after to." };
    if (daysInclusive(from, to) > MAX_REPORT_DAYS) return { error: `Choose a range of ${MAX_REPORT_DAYS} days or less.` };
    return { from, to, today };
}

const doneDate = { $ifNull: ["$workCompletedAt", "$updatedAt"] };

/** Grouped numbers for a set of employees → Map(employeeId → metrics) */
async function buildMetrics(employees, from, to, today) {
    const ids = employees.map((e) => e._id);
    const out = new Map(employees.map((e) => [String(e._id), {}]));
    if (!ids.length) return out;

    const mechIds = employees.filter((e) => e.position === "mechanic").map((e) => e._id);
    const delivIds = employees.filter((e) => e.position === "delivery").map((e) => e._id);
    const trackIds = [...mechIds, ...delivIds];
    const telecallers = employees.filter((e) => e.position === "telecaller");
    const rangeStart = istStart(from), rangeEnd = istEnd(to);

    const [att, trips, mechDone, delivDone, openMech, openDeliv, leads, dutyDays, tripDays] = await Promise.all([
        Attendance.aggregate([
            { $match: { employeeId: { $in: ids }, date: { $gte: from, $lte: to }, "checkIn.at": { $exists: true } } },
            {
                $group: {
                    _id: "$employeeId",
                    daysPresent: { $sum: 1 },
                    totalMinutes: { $sum: "$workedMinutes" },
                    completedDays: { $sum: { $cond: [{ $ifNull: ["$checkOut.at", false] }, 1, 0] } },
                    missedSignOut: {
                        $sum: { $cond: [{ $and: [{ $not: [{ $ifNull: ["$checkOut.at", false] }] }, { $lt: ["$date", today] }] }, 1, 0] },
                    },
                },
            },
        ]),
        trackIds.length ? Trip.aggregate([
            { $match: { employeeId: { $in: trackIds }, date: { $gte: from, $lte: to } } },
            {
                $group: {
                    _id: "$employeeId",
                    meters: { $sum: "$distanceMeters" },
                    trips: { $sum: 1 },
                    deliveries: { $sum: { $cond: [{ $ifNull: ["$arrivedAt", false] }, 1, 0] } },
                    flagged: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$flags", []] } }, 0] }, 1, 0] } },
                },
            },
        ]) : [],
        mechIds.length ? Order.aggregate([
            { $match: { mechanicIds: { $in: mechIds }, status: { $in: DONE_STATUSES } } },
            { $addFields: { doneAt: doneDate } },
            { $match: { doneAt: { $gte: rangeStart, $lte: rangeEnd } } },
            { $unwind: "$mechanicIds" },
            { $match: { mechanicIds: { $in: mechIds } } },
            { $group: { _id: "$mechanicIds", completed: { $sum: 1 } } },
        ]) : [],
        delivIds.length ? Order.aggregate([
            { $match: { deliveryId: { $in: delivIds }, status: { $in: DONE_STATUSES } } },
            { $addFields: { doneAt: doneDate } },
            { $match: { doneAt: { $gte: rangeStart, $lte: rangeEnd } } },
            { $group: { _id: "$deliveryId", completed: { $sum: 1 } } },
        ]) : [],
        mechIds.length ? Order.aggregate([
            { $match: { mechanicIds: { $in: mechIds }, status: { $in: OPEN_STATUSES } } },
            { $unwind: "$mechanicIds" },
            { $match: { mechanicIds: { $in: mechIds } } },
            { $group: { _id: "$mechanicIds", openNow: { $sum: 1 } } },
        ]) : [],
        delivIds.length ? Order.aggregate([
            { $match: { deliveryId: { $in: delivIds }, status: { $in: OPEN_STATUSES } } },
            { $group: { _id: "$deliveryId", openNow: { $sum: 1 } } },
        ]) : [],
        telecallers.length ? Lead.aggregate([
            {
                $match: {
                    isDeleted: { $ne: true },
                    createdAt: { $gte: rangeStart, $lte: rangeEnd },
                    $or: [
                        { leadById: { $in: telecallers.map((t) => t._id) } },
                        { leadById: null, leadBy: { $in: telecallers.map((t) => nameOf(t)) } },
                    ],
                },
            },
            {
                $group: {
                    _id: { $ifNull: ["$leadById", "$leadBy"] },
                    total: { $sum: 1 },
                    converted: { $sum: { $cond: [{ $in: ["$status", CONVERTED] }, 1, 0] } },
                    interested: { $sum: { $cond: [{ $eq: ["$status", "interested"] }, 1, 0] } },
                    followUp: { $sum: { $cond: [{ $eq: ["$status", "follow_up"] }, 1, 0] } },
                    notReachable: { $sum: { $cond: [{ $eq: ["$status", "not_reachable"] }, 1, 0] } },
                    notInterested: { $sum: { $cond: [{ $eq: ["$status", "not_interested"] }, 1, 0] } },
                },
            },
        ]) : [],
        // Kilometres per person per day: what was travelled while ONLINE, plus trip distance to
        // fall back on for days recorded before on-duty distance existed.
        trackIds.length ? DutyDistance.aggregate([
            { $match: { employeeId: { $in: trackIds }, date: { $gte: from, $lte: to } } },
            { $group: { _id: { e: "$employeeId", d: "$date" }, meters: { $sum: "$distanceMeters" } } },
        ]) : [],
        trackIds.length ? Trip.aggregate([
            { $match: { employeeId: { $in: trackIds }, date: { $gte: from, $lte: to } } },
            { $group: { _id: { e: "$employeeId", d: "$date" }, meters: { $sum: "$distanceMeters" } } },
        ]) : [],
    ]);

    // employeeId → total metres (a day with an on-duty record wins over that day's trip total)
    const kmMeters = new Map();
    {
        const dutyKey = new Set(dutyDays.map((r) => `${r._id.e}|${r._id.d}`));
        for (const r of dutyDays) kmMeters.set(String(r._id.e), (kmMeters.get(String(r._id.e)) || 0) + (r.meters || 0));
        for (const r of tripDays) {
            if (dutyKey.has(`${r._id.e}|${r._id.d}`)) continue;
            kmMeters.set(String(r._id.e), (kmMeters.get(String(r._id.e)) || 0) + (r.meters || 0));
        }
    }

    const by = (rows) => new Map(rows.map((r) => [String(r._id), r]));
    const attM = by(att), tripM = by(trips), mDone = by(mechDone), dDone = by(delivDone), mOpen = by(openMech), dOpen = by(openDeliv), leadM = by(leads);

    for (const e of employees) {
        const k = String(e._id);
        const a = attM.get(k);
        const m = {
            attendance: {
                daysPresent: a?.daysPresent || 0,
                totalMinutes: a?.totalMinutes || 0,
                avgMinutes: a?.completedDays ? Math.round(a.totalMinutes / a.completedDays) : 0,
                missedSignOut: a?.missedSignOut || 0,
            },
        };
        if (e.position === "mechanic" || e.position === "delivery") {
            const t = tripM.get(k);
            m.distance = {
                km: toKm(kmMeters.get(k)),
                trips: t?.trips || 0,
                avgKmPerTrip: t?.trips ? toKm((t.meters || 0) / t.trips) : 0,
                flaggedTrips: t?.flagged || 0,
            };
            const isM = e.position === "mechanic";
            m.orders = {
                completed: (isM ? mDone : dDone).get(k)?.completed || 0,
                openNow: (isM ? mOpen : dOpen).get(k)?.openNow || 0,
                ...(isM ? {} : { deliveries: t?.deliveries || 0 }),
            };
            if (isM) m.rating = { average: round1(e.averageRating), count: (e.ratings || []).length };
        } else if (e.position === "telecaller") {
            const l = leadM.get(k) || leadM.get(nameOf(e));
            const total = l?.total || 0;
            m.leads = {
                total,
                converted: l?.converted || 0,
                conversionPct: total ? Math.round(((l?.converted || 0) / total) * 100) : 0,
                interested: l?.interested || 0,
                followUp: l?.followUp || 0,
                notReachable: l?.notReachable || 0,
                notInterested: l?.notInterested || 0,
            };
        }
        out.set(k, m);
    }
    return out;
}

const person = (e) => ({
    id: String(e._id),
    name: nameOf(e),
    position: e.position || "employee",
    phone: e.phone || "",
    profileImage: e.profileImage || "",
});

// GET /api/admin/staff-overview
export const getStaffOverview = async (req, res) => {
    try {
        const range = parseRange(req.query);
        if (range.error) return res.status(400).json({ success: false, message: range.error });
        const position = POSITIONS.includes(req.query.position) ? req.query.position : "mechanic";

        const employees = await Employee.find({ position })
            .select("firstName lastName email phone position profileImage averageRating ratings")
            .sort({ firstName: 1 })
            .lean();
        const metrics = await buildMetrics(employees, range.from, range.to, range.today);
        const rows = employees.map((e) => ({ ...person(e), ...metrics.get(String(e._id)) }));

        const sum = (f) => rows.reduce((s, r) => s + (f(r) || 0), 0);
        res.json({
            success: true,
            from: range.from,
            to: range.to,
            position,
            summary: {
                staff: rows.length,
                present: rows.filter((r) => r.attendance.daysPresent > 0).length,
                totalKm: toKm(sum((r) => r.distance?.km) * 1000),
                trips: sum((r) => r.distance?.trips),
                completedOrders: sum((r) => r.orders?.completed),
                leads: sum((r) => r.leads?.total),
                converted: sum((r) => r.leads?.converted),
            },
            rows,
        });
    } catch (err) {
        console.error("[staffOverview]", err);
        res.status(500).json({ success: false, message: "Could not load the staff overview." });
    }
};

// GET /api/admin/staff-overview/:employeeId
export const getStaffDetail = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ success: false, message: "Invalid employee id." });
        }
        const range = parseRange(req.query);
        if (range.error) return res.status(400).json({ success: false, message: range.error });

        const emp = await Employee.findById(employeeId)
            .select("firstName lastName email phone position profileImage averageRating ratings")
            .lean();
        if (!emp) return res.status(404).json({ success: false, message: "Employee not found." });

        const { from, to, today } = range;
        const id = oid(emp._id);
        const isMech = emp.position === "mechanic";
        const isDeliv = emp.position === "delivery";
        const isTele = emp.position === "telecaller";
        const tz = "Asia/Kolkata";

        const [metrics, records, trips, doneByDay, leadsByDay, dutyRows] = await Promise.all([
            buildMetrics([emp], from, to, today),
            Attendance.find({ employeeId: id, date: { $gte: from, $lte: to } }).lean(),
            isMech || isDeliv
                ? Trip.find({ employeeId: id, date: { $gte: from, $lte: to } }).sort({ startedAt: -1 }).limit(200).lean()
                : [],
            isMech || isDeliv
                ? Order.aggregate([
                    { $match: { [isMech ? "mechanicIds" : "deliveryId"]: id, status: { $in: DONE_STATUSES } } },
                    { $addFields: { doneAt: doneDate } },
                    { $match: { doneAt: { $gte: istStart(from), $lte: istEnd(to) } } },
                    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$doneAt", timezone: tz } }, n: { $sum: 1 } } },
                ])
                : [],
            isTele
                ? Lead.aggregate([
                    {
                        $match: {
                            isDeleted: { $ne: true },
                            createdAt: { $gte: istStart(from), $lte: istEnd(to) },
                            $or: [{ leadById: id }, { leadById: null, leadBy: nameOf(emp) }],
                        },
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: tz } },
                            n: { $sum: 1 },
                            converted: { $sum: { $cond: [{ $in: ["$status", CONVERTED] }, 1, 0] } },
                        },
                    },
                ])
                : [],
            isMech || isDeliv
                ? DutyDistance.find({ employeeId: id, date: { $gte: from, $lte: to } }).select("date distanceMeters").lean()
                : [],
        ]);
        const dutyByDay = new Map(dutyRows.map((r) => [r.date, r.distanceMeters || 0]));

        const attByDay = new Map(records.map((r) => [r.date, r]));
        const tripByDay = new Map();
        for (const t of trips) {
            const d = tripByDay.get(t.date) || { m: 0, n: 0 };
            d.m += t.distanceMeters || 0; d.n += 1;
            tripByDay.set(t.date, d);
        }
        const doneM = new Map(doneByDay.map((r) => [r._id, r.n]));
        const leadM = new Map(leadsByDay.map((r) => [r._id, r]));

        const days = [];
        for (let d = new Date(`${from}T12:00:00Z`); istDateKey(d) <= to && days.length <= MAX_REPORT_DAYS; d = new Date(d.getTime() + 86400000)) {
            const key = istDateKey(d);
            const r = attByDay.get(key);
            const out = r?.checkOut?.at;
            days.push({
                date: key,
                attendance: r?.checkIn?.at
                    ? {
                        status: out ? "completed" : key === today ? "working" : "missed_signout",
                        checkIn: r.checkIn.at,
                        checkOut: out || null,
                        minutes: out ? r.workedMinutes || 0 : 0,
                        breakMinutes: r.breakMinutes || 0,
                    }
                    : null,
                km: toKm(dutyByDay.has(key) ? dutyByDay.get(key) : tripByDay.get(key)?.m),
                trips: tripByDay.get(key)?.n || 0,
                completed: doneM.get(key) || 0,
                leads: leadM.get(key)?.n || 0,
                converted: leadM.get(key)?.converted || 0,
            });
        }
        days.reverse();                                   // newest first

        res.json({
            success: true,
            from, to,
            employee: person(emp),
            metrics: metrics.get(String(emp._id)),
            days,
            trips: trips.map((t) => ({
                id: String(t._id),
                date: t.date,
                orderId: String(t.orderId),
                orderRef: t.orderRef || null,
                role: t.role,
                startedAt: t.startedAt,
                endedAt: t.endedAt || null,
                phase: t.phase,
                endReason: t.endReason || null,
                km: toKm(t.distanceMeters),
                outboundKm: toKm(t.legs?.outboundM),
                returnKm: toKm(t.legs?.returnM),
                flags: t.flags || [],
            })),
        });
    } catch (err) {
        console.error("[staffDetail]", err);
        res.status(500).json({ success: false, message: "Could not load this employee." });
    }
};
