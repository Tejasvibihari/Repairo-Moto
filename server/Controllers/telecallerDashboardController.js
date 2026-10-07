import Lead from '../Models/leadModel.js';
import { addDays, buildAttendanceStats, istEnd, istStart } from '../Utils/employeeStats.js';
import { istDateKey, istMonthKey } from '../Utils/attendanceUtils.js';

// Statuses that mean "this lead is finished" — a follow-up date on them no longer needs action.
const CONVERTED = ['booked', 'completed', 'direct_booking'];
const CLOSED = [...CONVERTED, 'not_interested'];

// GET /api/employee/dashboard
export const getTelecallerDashboard = async (req, res) => {
    try {
        const employee = req.employee;
        const leadBy = req.user?.leadBy;

        if (!employee || !leadBy) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // "Today" and "this month" are IST days, not the server's (usually UTC) day.
        const now = new Date();
        const today = istDateKey(now);
        const month = istMonthKey(now);
        const dayStart = istStart(today);
        const dayEnd = istEnd(today);
        const monthStart = istStart(`${month}-01`);

        // Same ownership rule as the admin Staff Overview: by id, falling back to the
        // name for older leads that were saved before `leadById` existed.
        const baseMatch = {
            isDeleted: { $ne: true },
            $or: [{ leadById: employee._id }, { leadById: null, leadBy }],
        };
        const openFollowUp = { status: { $nin: CLOSED } };

        const [
            totalAssigned,
            statusAgg,
            newToday,
            followUpsToday,
            overdueFollowUps,
            bookedCount,
            convertedCount,
            monthLeads,
            monthConverted,
            invoicesLinked,
            recentLeads,
            att,
        ] = await Promise.all([
            Lead.countDocuments(baseMatch),
            Lead.aggregate([
                { $match: baseMatch },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Lead.countDocuments({ ...baseMatch, createdAt: { $gte: dayStart, $lte: dayEnd } }),
            Lead.countDocuments({ ...baseMatch, ...openFollowUp, 'followUp.date': { $gte: dayStart, $lte: dayEnd } }),
            Lead.countDocuments({ ...baseMatch, ...openFollowUp, 'followUp.date': { $lt: dayStart } }),
            Lead.countDocuments({ ...baseMatch, status: 'booked' }),
            Lead.countDocuments({ ...baseMatch, status: { $in: CONVERTED } }),
            Lead.countDocuments({ ...baseMatch, createdAt: { $gte: monthStart, $lte: dayEnd } }),
            Lead.countDocuments({ ...baseMatch, status: { $in: CONVERTED }, createdAt: { $gte: monthStart, $lte: dayEnd } }),
            Lead.countDocuments({ ...baseMatch, 'invoice.linked': true }),
            Lead.find(baseMatch)
                .sort({ createdAt: -1 })
                .limit(10)
                .select('customer vehicle status followUp invoice createdAt')
                .lean(),
            buildAttendanceStats(employee._id, { today, month, now }),
        ]);

        const countsByStatus = {};
        (statusAgg || []).forEach((it) => {
            countsByStatus[it._id] = it.count;
        });

        return res.status(200).json({
            success: true,
            data: {
                totalAssigned,
                countsByStatus,
                newToday,
                followUpsToday,
                overdueFollowUps,
                bookedCount,
                convertedCount,
                monthLeads,
                monthConverted,
                conversionPct: monthLeads ? Math.round((monthConverted / monthLeads) * 100) : 0,
                invoicesLinked,
                recentLeads,
                attendance: att.attendance,
                week: Array.from({ length: 7 }, (_, i) => {
                    const date = addDays(today, i - 6);
                    return { date, present: att.presentDays.has(date), minutes: att.minutesByDay.get(date) || 0 };
                }),
            },
        });
    } catch (err) {
        console.error('Telecaller dashboard error:', err);
        return res.status(500).json({ success: false, message: 'Could not load the dashboard.' });
    }
};

export default { getTelecallerDashboard };
