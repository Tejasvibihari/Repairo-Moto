import { buildEmployeeDashboard } from '../Utils/employeeStats.js';

// GET /api/employee/dashboard/delivery
// Same payload as /overview, plus the keys older app builds used to read.
export const getDeliveryDashboard = async (req, res) => {
    try {
        const employee = req.employee;
        if (!employee) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (employee.position !== 'delivery') {
            return res.status(403).json({ success: false, message: 'This dashboard is only for delivery partners.' });
        }

        const d = await buildEmployeeDashboard(employee);

        return res.status(200).json({
            success: true,
            data: {
                ...d,
                // ── legacy keys ──
                totalAssigned: d.orders.total,
                countsByStatus: d.orders.countsByStatus,
                todayDeliveries: d.orders.scheduledToday,
                pendingCount: d.orders.pending + d.orders.open,
                deliveredCount: d.orders.completed,
                upcomingDeliveries: d.upcoming.length,
                recentDeliveries: d.recent,
            },
        });
    } catch (err) {
        console.error('Delivery dashboard error:', err);
        return res.status(500).json({ success: false, message: 'Could not load the dashboard.' });
    }
};

export default { getDeliveryDashboard };
