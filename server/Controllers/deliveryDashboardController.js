import Order from '../Models/orderModel.js';
import mongoose from 'mongoose';

// GET /api/employee/dashboard/delivery
export const getDeliveryDashboard = async (req, res) => {
    try {
        const employee = req.employee;
        if (!employee) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const employeeId = new mongoose.Types.ObjectId(employee._id);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const next7 = new Date();
        next7.setDate(next7.getDate() + 7);

        const matchByDelivery = { deliveryId: employeeId };

        const [
            totalAssigned,
            statusAgg,
            todayDeliveries,
            pendingCount,
            deliveredCount,
            upcomingDeliveries,
            recentDeliveries,
        ] = await Promise.all([
            Order.countDocuments(matchByDelivery),
            Order.aggregate([
                { $match: matchByDelivery },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Order.countDocuments({ ...matchByDelivery, createdAt: { $gte: startOfDay, $lte: endOfDay } }),
            Order.countDocuments({ ...matchByDelivery, status: { $in: ['Pending', 'Mechanic Assigned', 'In Progress'] } }),
            Order.countDocuments({ ...matchByDelivery, status: { $in: ['Completed', 'Invoice Generated'] } }),
            Order.countDocuments({ ...matchByDelivery, preferredDate: { $gte: startOfDay, $lte: next7 } }),
            Order.find(matchByDelivery).sort({ updatedAt: -1 }).limit(10).lean(),
        ]);

        const countsByStatus = {};
        (statusAgg || []).forEach((it) => { countsByStatus[it._id] = it.count; });

        return res.status(200).json({
            success: true,
            data: {
                totalAssigned,
                countsByStatus,
                todayDeliveries,
                pendingCount,
                deliveredCount,
                upcomingDeliveries,
                recentDeliveries,
            },
        });
    } catch (err) {
        console.error('Delivery dashboard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export default { getDeliveryDashboard };
