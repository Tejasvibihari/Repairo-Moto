import Order from '../Models/orderModel.js';
import mongoose from 'mongoose';

// GET /api/employee/dashboard/mechanic
export const getMechanicDashboard = async (req, res) => {
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

        const matchByMechanic = { mechanicIds: employeeId };

        const [
            totalAssigned,
            statusAgg,
            todayAssigned,
            inProgressCount,
            completedCount,
            upcomingSchedules,
            recentOrders,
        ] = await Promise.all([
            Order.countDocuments(matchByMechanic),
            Order.aggregate([
                { $match: matchByMechanic },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Order.countDocuments({ ...matchByMechanic, createdAt: { $gte: startOfDay, $lte: endOfDay } }),
            Order.countDocuments({ ...matchByMechanic, status: { $in: ['In Progress', 'Mechanic Assigned', 'Mechanic Arrived'] } }),
            Order.countDocuments({ ...matchByMechanic, status: { $in: ['Completed', 'Invoice Generated', 'Work Completed'] } }),
            Order.countDocuments({ ...matchByMechanic, preferredDate: { $gte: startOfDay, $lte: next7 } }),
            Order.find(matchByMechanic).sort({ updatedAt: -1 }).limit(10).lean(),
        ]);

        const countsByStatus = {};
        (statusAgg || []).forEach((it) => { countsByStatus[it._id] = it.count; });

        return res.status(200).json({
            success: true,
            data: {
                totalAssigned,
                countsByStatus,
                todayAssigned,
                inProgressCount,
                completedCount,
                upcomingSchedules,
                recentOrders,
            },
        });
    } catch (err) {
        console.error('Mechanic dashboard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export default { getMechanicDashboard };
