import Order from '../Models/orderModel.js';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Vendor from '../Models/vendorModel.js';

// GET /api/admin/dashboard
// Returns everything needed for the admin dashboard home screen in one call

export const getAdminDashboard = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        // ── Date range ────────────────────────────────────────────────────────
        const now = new Date();
        const start = new Date();
        switch (period) {
            case 'today': start.setHours(0, 0, 0, 0); break;
            case 'week': start.setDate(now.getDate() - 7); break;
            case 'month': start.setMonth(now.getMonth() - 1); break;
            case 'year': start.setFullYear(now.getFullYear() - 1); break;
            default: start.setMonth(now.getMonth() - 1);
        }

        // ── Run all queries in parallel ───────────────────────────────────────
        const [
            totalOrders,
            periodOrders,
            totalUsers,
            newUsers,
            totalMechanics,
            totalVendors,

            pendingOrders,
            inProgressOrders,
            mechanicAssignedOrders,
            completedOrders,
            invoiceGeneratedOrders,
            cancelledOrders,

            totalRevenueAgg,
            periodRevenueAgg,

            unpaidCount,
            partialCount,
            paidCount,

            recentOrders,
            revenueChart,
            topServices,

        ] = await Promise.all([

            // KPI counts
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: start } }),
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: start } }),
            Employee.countDocuments({ position: 'mechanic' }),
            Vendor.countDocuments(),

            // Order status pipeline
            Order.countDocuments({ status: 'Pending' }),
            Order.countDocuments({ status: 'In Progress' }),
            Order.countDocuments({ status: 'Mechanic Assigned' }),
            Order.countDocuments({ status: 'Completed' }),
            Order.countDocuments({ status: 'Invoice Generated' }),
            Order.countDocuments({ status: 'Cancelled' }),

            // Revenue
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total.finalPayable' } } },
            ]),
            Order.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: start } } },
                { $group: { _id: null, total: { $sum: '$total.finalPayable' } } },
            ]),

            // Payment health
            Order.countDocuments({ paymentStatus: 'unpaid' }),
            Order.countDocuments({ paymentStatus: 'partial' }),
            Order.countDocuments({ paymentStatus: 'paid' }),

            // Recent 10 orders — live feed
            Order.find()
                .sort({ updatedAt: -1 })
                .limit(10)
                .select('orderId name city status serviceType total.finalPayable paymentStatus createdAt updatedAt assignedMechanic')
                .lean(),

            // Daily revenue chart for selected period
            Order.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: start } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' },
                        },
                        revenue: { $sum: '$total.finalPayable' },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            ]),

            // Top 5 services
            Order.aggregate([
                { $unwind: '$services' },
                { $group: { _id: '$services', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);

        // ── Shape the response ────────────────────────────────────────────────
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
        res.status(500).json({ success: false, message: err.message });
    }
};