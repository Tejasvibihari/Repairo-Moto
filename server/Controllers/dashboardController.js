import Order from '../Models/orderModel.js';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Vendor from '../Models/vendorModel.js';

// ── Period → Date range ───────────────────────────────────────────────────────
const getPeriodRange = (period) => {
    const now = new Date();
    const start = new Date();

    switch (period) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            start.setMonth(now.getMonth() - 1);
    }

    return { start, now };
};

// ── Revenue chart grouping format (changes by period) ────────────────────────
const getChartGroupStage = (period) => {
    if (period === 'today') {
        // Group by hour
        return {
            $group: {
                _id: {
                    hour: { $hour: '$createdAt' },
                },
                revenue: { $sum: '$total.finalPayable' },
                orders: { $sum: 1 },
            },
        };
    }
    if (period === 'year') {
        // Group by month
        return {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                revenue: { $sum: '$total.finalPayable' },
                orders: { $sum: 1 },
            },
        };
    }
    // Default: group by day (week / month)
    return {
        $group: {
            _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' },
            },
            revenue: { $sum: '$total.finalPayable' },
            orders: { $sum: 1 },
        },
    };
};

// ── GET /api/admin/dashboard?period=today|week|month|year ─────────────────────
export const getAdminDashboard = async (req, res) => {
    try {
        const period = ['today', 'week', 'month', 'year'].includes(req.query.period)
            ? req.query.period
            : 'month';

        const { start } = getPeriodRange(period);
        const periodMatch = { createdAt: { $gte: start } };

        const [
            // ── KPI ───────────────────────────────────────────────────────────
            totalOrders,
            periodOrders,
            totalUsers,
            newUsers,
            totalMechanics,
            totalVendors,

            // ── Order status (scoped to period) ───────────────────────────────
            pendingOrders,
            inProgressOrders,
            mechanicAssignedOrders,
            completedOrders,
            invoiceGeneratedOrders,
            cancelledOrders,

            // ── Revenue ───────────────────────────────────────────────────────
            totalRevenueAgg,
            periodRevenueAgg,

            // ── Payment health (scoped to period) ─────────────────────────────
            unpaidCount,
            partialCount,
            paidCount,

            // ── Recent 10 orders (scoped to period) ───────────────────────────
            recentOrders,

            // ── Revenue chart (scoped to period) ─────────────────────────────
            revenueChart,

            // ── Top services (scoped to period) ───────────────────────────────
            topServices,

        ] = await Promise.all([

            // KPI — all-time totals
            Order.countDocuments(),
            Order.countDocuments(periodMatch),
            User.countDocuments(),
            User.countDocuments(periodMatch),
            Employee.countDocuments({ position: 'mechanic' }),
            Vendor.countDocuments(),

            // Order status — scoped to period
            Order.countDocuments({ ...periodMatch, status: 'Pending' }),
            Order.countDocuments({ ...periodMatch, status: 'In Progress' }),
            Order.countDocuments({ ...periodMatch, status: 'Mechanic Assigned' }),
            Order.countDocuments({ ...periodMatch, status: 'Completed' }),
            Order.countDocuments({ ...periodMatch, status: 'Invoice Generated' }),
            Order.countDocuments({ ...periodMatch, status: 'Cancelled' }),

            // Revenue — all-time vs period
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total.finalPayable' } } },
            ]),
            Order.aggregate([
                { $match: { paymentStatus: 'paid', ...periodMatch } },
                { $group: { _id: null, total: { $sum: '$total.finalPayable' } } },
            ]),

            // Payment health — scoped to period
            Order.countDocuments({ ...periodMatch, paymentStatus: 'unpaid' }),
            Order.countDocuments({ ...periodMatch, paymentStatus: 'partial' }),
            Order.countDocuments({ ...periodMatch, paymentStatus: 'paid' }),

            // Recent 10 orders — scoped to period, sorted by latest update
            Order.find(periodMatch)
                .sort({ updatedAt: -1 })
                .limit(10)
                .select('orderId name city status serviceType total paymentStatus createdAt updatedAt assignedMechanic')
                .lean(),

            // Revenue chart — grouped by period granularity
            Order.aggregate([
                { $match: { paymentStatus: 'paid', ...periodMatch } },
                getChartGroupStage(period),
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
            ]),

            // Top 5 services — scoped to period
            Order.aggregate([
                { $match: periodMatch },
                { $unwind: '$services' },
                { $group: { _id: '$services', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);

        // ── Response ──────────────────────────────────────────────────────────
        res.json({
            success: true,
            period,
            data: {
                kpi: {
                    totalRevenue: totalRevenueAgg[0]?.total || 0,
                    periodRevenue: periodRevenueAgg[0]?.total || 0,
                    totalOrders,
                    periodOrders,
                    totalUsers,
                    newUsers,
                    totalMechanics,
                    totalVendors,
                },
                orderStatus: {
                    pending: pendingOrders,
                    inProgress: inProgressOrders,
                    mechanicAssigned: mechanicAssignedOrders,
                    completed: completedOrders,
                    invoiceGenerated: invoiceGeneratedOrders,
                    cancelled: cancelledOrders,
                },
                payments: {
                    unpaid: unpaidCount,
                    partial: partialCount,
                    paid: paidCount,
                },
                revenueChart,
                topServices,
                recentOrders,
            },
        });

    } catch (err) {
        console.error('[Dashboard]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};