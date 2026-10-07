// Utils/employeeStats.js
//
// One place that computes the numbers shown on an employee's own dashboard, so every role
// (mechanic, delivery, manager, operational manager, telecaller …) reads the SAME definitions
// as the admin Staff Overview and the Orders tab:
//
//   • orders are matched on the real assignment fields — `mechanicIds` (array) for a mechanic,
//     `deliveryId` for a delivery partner, `city` (upper-case, like Order.city) for managers.
//   • "today" / "this month" are IST calendar days, never the server's (usually UTC) day.
//   • status buckets are exclusive, so  pending + open + completed + cancelled = total.
//   • distance comes from the Trip collection (server-computed), attendance from Attendance.
import mongoose from "mongoose";
import Order from "../Models/orderModel.js";
import Attendance from "../Models/attendanceModel.js";
import Trip from "../Models/tripModel.js";
import {
    breakMinutesOf,
    istDateKey,
    istMonthKey,
    netWorkedMinutes,
    openBreakOf,
} from "./attendanceUtils.js";
import { toKm } from "./geo.js";

// ─── Status buckets (same lists as Controllers/staffOverviewController.js) ────
export const PENDING_STATUSES = ["Pending"];
export const OPEN_STATUSES = ["Mechanic Assigned", "Mechanic Start", "Mechanic Arrived", "In Progress", "Completion Requested"];
export const DONE_STATUSES = ["Work Completed", "Invoice Generated", "Completed"];
export const CANCELLED_STATUSES = ["Cancelled"];

const TZ = "Asia/Kolkata";
const oid = (id) => new mongoose.Types.ObjectId(String(id));
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

// ─── IST helpers ──────────────────────────────────────────────────────────────
export const istStart = (key) => new Date(`${key}T00:00:00.000+05:30`);
export const istEnd = (key) => new Date(`${key}T23:59:59.999+05:30`);

/** "2026-10-07" ± n days (pure calendar maths, no timezone surprises). */
export const addDays = (key, n) => {
    const [y, m, d] = key.split("-").map(Number);
    return istDateKey(new Date(Date.UTC(y, m - 1, d + n, 12)));
};

/** Booking days are stored as UTC midnight of the chosen day (see Utils/bookingPolicy.js). */
export const bookingDay = (key) => new Date(`${key}T00:00:00.000Z`);

// ─── Which orders belong to this employee ─────────────────────────────────────
export function orderScopeFor(employee) {
    switch (employee?.position) {
        case "mechanic":
            return { mechanicIds: oid(employee._id) };
        case "delivery":
            return { deliveryId: oid(employee._id) };
        default: {
            // Order.city is stored upper-case, Employee.city is stored as typed.
            const city = String(employee?.city || "").trim().toUpperCase();
            return city ? { city } : {};
        }
    }
}

const bucketOf = (countsByStatus) => {
    const sum = (list) => list.reduce((s, k) => s + (countsByStatus[k] || 0), 0);
    const total = Object.values(countsByStatus).reduce((s, n) => s + n, 0);
    return {
        total,
        pending: sum(PENDING_STATUSES),
        open: sum(OPEN_STATUSES),
        completed: sum(DONE_STATUSES),
        cancelled: sum(CANCELLED_STATUSES),
    };
};

/** Light version used by the legacy `/api/admin/dashboard/order-counts` endpoint. */
export async function countOrdersByBucket(scope) {
    const rows = await Order.aggregate([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
    const countsByStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    return { countsByStatus, ...bucketOf(countsByStatus) };
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function buildOrderStats(scope, { today, month }) {
    const monthFrom = `${month}-01`;
    const weekFrom = addDays(today, -6);
    const rangeFrom = monthFrom < weekFrom ? monthFrom : weekFrom;
    const doneAt = { $ifNull: ["$workCompletedAt", "$updatedAt"] };
    const cancelledAt = { $ifNull: ["$cancelledAt", "$updatedAt"] };
    const todayDay = bookingDay(today);
    const tomorrowDay = bookingDay(addDays(today, 1));
    const in7Days = bookingDay(addDays(today, 7));
    const unfinished = [...PENDING_STATUSES, ...OPEN_STATUSES];

    const [statusAgg, doneByDay, cancelledMonth, scheduledToday, overdue, upcoming, recent] = await Promise.all([
        Order.aggregate([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Order.aggregate([
            { $match: { ...scope, status: { $in: DONE_STATUSES } } },
            { $addFields: { doneAt } },
            { $match: { doneAt: { $gte: istStart(rangeFrom), $lte: istEnd(today) } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$doneAt", timezone: TZ } }, n: { $sum: 1 } } },
        ]),
        Order.aggregate([
            { $match: { ...scope, status: { $in: CANCELLED_STATUSES } } },
            { $addFields: { cancelledAt } },
            { $match: { cancelledAt: { $gte: istStart(monthFrom), $lte: istEnd(today) } } },
            { $count: "n" },
        ]),
        // Jobs booked for today (cancelled ones don't count) and how many are already finished.
        Order.aggregate([
            { $match: { ...scope, status: { $nin: CANCELLED_STATUSES }, preferredDate: { $gte: todayDay, $lt: tomorrowDay } } },
            { $group: { _id: null, total: { $sum: 1 }, done: { $sum: { $cond: [{ $in: ["$status", DONE_STATUSES] }, 1, 0] } } } },
        ]),
        // Booked for an earlier day and still not finished.
        Order.countDocuments({ ...scope, status: { $in: unfinished }, preferredDate: { $lt: todayDay } }),
        Order.find({ ...scope, status: { $in: unfinished }, preferredDate: { $gte: todayDay, $lt: in7Days } })
            .sort({ preferredDate: 1, createdAt: 1 })
            .limit(6)
            .select("orderId name address city status serviceType services selectedBrand selectedModel modelName preferredDate preferredTime")
            .lean(),
        Order.find(scope)
            .sort({ updatedAt: -1 })
            .limit(8)
            .select("orderId name city status serviceType services selectedBrand selectedModel modelName preferredDate preferredTime updatedAt workCompletedAt travel.distanceMeters")
            .lean(),
    ]);

    const countsByStatus = Object.fromEntries(statusAgg.map((r) => [r._id, r.count]));
    const buckets = bucketOf(countsByStatus);
    const doneMap = new Map(doneByDay.map((r) => [r._id, r.n]));
    const completedMonth = [...doneMap].reduce((s, [k, n]) => (k >= monthFrom ? s + n : s), 0);
    const finishedOrOpen = buckets.completed + buckets.open + buckets.pending;

    return {
        stats: {
            ...buckets,
            countsByStatus,
            completionPct: finishedOrOpen ? Math.round((buckets.completed / finishedOrOpen) * 100) : 0,
            scheduledToday: scheduledToday[0]?.total || 0,
            scheduledTodayDone: scheduledToday[0]?.done || 0,
            completedToday: doneMap.get(today) || 0,
            completedMonth,
            cancelledMonth: cancelledMonth[0]?.n || 0,
            overdue,
        },
        doneMap,
        upcoming,
        recent,
    };
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export async function buildAttendanceStats(employeeId, { today, month, now = new Date() }) {
    const monthFrom = `${month}-01`;
    const weekFrom = addDays(today, -6);
    const from = monthFrom < weekFrom ? monthFrom : weekFrom;

    const records = await Attendance.find({ employeeId: oid(employeeId), date: { $gte: from, $lte: today } })
        .select("date checkIn checkOut breaks workedMinutes breakMinutes")
        .lean();

    const minutesOf = (r) => {
        if (!r?.checkIn?.at) return 0;
        if (r.checkOut?.at) return r.workedMinutes || 0;
        // Still working today → live number. A past day that was never signed out is unknown → 0.
        return r.date === today ? netWorkedMinutes(r.checkIn.at, now, r.breaks) : 0;
    };

    const todayRec = records.find((r) => r.date === today) || null;
    const state = !todayRec ? "not_marked"
        : todayRec.checkOut?.at ? "checked_out"
            : openBreakOf(todayRec.breaks) ? "on_break"
                : "checked_in";

    const monthRecs = records.filter((r) => r.date >= monthFrom && r.checkIn?.at);
    const closed = monthRecs.filter((r) => r.checkOut?.at);
    const closedMinutes = closed.reduce((s, r) => s + (r.workedMinutes || 0), 0);

    const minutesByDay = new Map(records.map((r) => [r.date, minutesOf(r)]));
    const presentDays = new Set(records.filter((r) => r.checkIn?.at).map((r) => r.date));

    return {
        attendance: {
            today: {
                state,
                checkInAt: todayRec?.checkIn?.at || null,
                checkOutAt: todayRec?.checkOut?.at || null,
                address: todayRec?.checkIn?.address || "",
                workedMinutes: minutesOf(todayRec),
                breakMinutes: todayRec ? (todayRec.checkOut?.at ? todayRec.breakMinutes || 0 : breakMinutesOf(todayRec.breaks, now)) : 0,
                breakCount: (todayRec?.breaks || []).length,
            },
            month: {
                month,
                daysElapsed: Number(today.slice(8, 10)),
                presentDays: monthRecs.length,
                totalMinutes: monthRecs.reduce((s, r) => s + minutesOf(r), 0),
                avgMinutes: closed.length ? Math.round(closedMinutes / closed.length) : 0,
                breakMinutes: monthRecs.reduce((s, r) => s + (r.checkOut?.at ? r.breakMinutes || 0 : breakMinutesOf(r.breaks, now)), 0),
                missedSignOut: monthRecs.filter((r) => !r.checkOut?.at && r.date < today).length,
            },
        },
        minutesByDay,
        presentDays,
    };
}

// ─── Distance (mechanic + delivery) ───────────────────────────────────────────
export async function buildDistanceStats(employeeId, { today, month }) {
    const id = oid(employeeId);
    const monthFrom = `${month}-01`;
    const weekFrom = addDays(today, -6);
    const from = monthFrom < weekFrom ? monthFrom : weekFrom;

    const [byDay, monthAgg, openTrip] = await Promise.all([
        Trip.aggregate([
            { $match: { employeeId: id, date: { $gte: from, $lte: today } } },
            { $group: { _id: "$date", meters: { $sum: "$distanceMeters" }, trips: { $sum: 1 } } },
        ]),
        Trip.aggregate([
            { $match: { employeeId: id, date: { $gte: monthFrom, $lte: today } } },
            {
                $group: {
                    _id: null,
                    meters: { $sum: "$distanceMeters" },
                    outbound: { $sum: "$legs.outboundM" },
                    returned: { $sum: "$legs.returnM" },
                    trips: { $sum: 1 },
                    flagged: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$flags", []] } }, 0] }, 1, 0] } },
                },
            },
        ]),
        Trip.findOne({ employeeId: id, open: true })
            .select("orderRef orderId phase startedAt distanceMeters")
            .lean(),
    ]);

    const dayMap = new Map(byDay.map((r) => [r._id, r]));
    const m = monthAgg[0] || {};
    const t = dayMap.get(today);

    return {
        distance: {
            todayKm: toKm(t?.meters),
            todayTrips: t?.trips || 0,
            monthKm: toKm(m.meters),
            monthTrips: m.trips || 0,
            avgKmPerTrip: m.trips ? toKm((m.meters || 0) / m.trips) : 0,
            outboundKm: toKm(m.outbound),
            returnKm: toKm(m.returned),
            flaggedTrips: m.flagged || 0,
            openTrip: openTrip
                ? {
                    orderId: String(openTrip.orderId),
                    orderRef: openTrip.orderRef || "",
                    phase: openTrip.phase,
                    startedAt: openTrip.startedAt,
                    km: toKm(openTrip.distanceMeters),
                }
                : null,
        },
        kmByDay: new Map(byDay.map((r) => [r._id, toKm(r.meters)])),
    };
}

// ─── Everything for one employee ──────────────────────────────────────────────
export async function buildEmployeeDashboard(employee, now = new Date()) {
    const today = istDateKey(now);
    const month = istMonthKey(now);
    const position = employee.position || "employee";
    const tracked = position === "mechanic" || position === "delivery";
    const scope = orderScopeFor(employee);

    const [orderPart, attPart, distPart, needsMechanic] = await Promise.all([
        buildOrderStats(scope, { today, month }),
        buildAttendanceStats(employee._id, { today, month, now }),
        tracked ? buildDistanceStats(employee._id, { today, month }) : null,
        // Managers: bookings still waiting for a mechanic.
        tracked ? 0 : Order.countDocuments({
            ...scope,
            status: { $in: PENDING_STATUSES },
            $or: [{ mechanicIds: { $exists: false } }, { mechanicIds: { $size: 0 } }],
        }),
    ]);

    // Last 7 days, oldest → newest, for the small bar chart.
    const week = [];
    for (let i = 6; i >= 0; i -= 1) {
        const date = addDays(today, -i);
        week.push({
            date,
            present: attPart.presentDays.has(date),
            minutes: attPart.minutesByDay.get(date) || 0,
            km: distPart?.kmByDay.get(date) || 0,
            completed: orderPart.doneMap.get(date) || 0,
        });
    }

    const ratings = Array.isArray(employee.ratings) ? employee.ratings : [];
    const computedAvg = ratings.length ? ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length : 0;

    return {
        role: position,
        today,
        month,
        profile: {
            name: [employee.firstName, employee.lastName].filter(Boolean).join(" ").trim() || employee.email || "",
            city: employee.city || "",
            isOnline: !!employee.isOnline,
            lastOnlineAt: employee.lastOnlineAt || null,
        },
        orders: orderPart.stats,
        attendance: attPart.attendance,
        distance: distPart?.distance || null,
        rating: position === "mechanic"
            ? { average: round1(employee.averageRating || computedAvg), count: ratings.length }
            : null,
        team: tracked ? null : { needsMechanic },
        week,
        upcoming: orderPart.upcoming,
        recent: orderPart.recent,
    };
}
