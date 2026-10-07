import { buildEmployeeDashboard } from '../Utils/employeeStats.js';

// GET /api/employee/dashboard/mechanic
// Same payload as /overview, plus the keys older app builds used to read.
export const getMechanicDashboard = async (req, res) => {
    try {
        const employee = req.employee;
        if (!employee) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (employee.position !== 'mechanic') {
            return res.status(403).json({ success: false, message: 'This dashboard is only for mechanics.' });
        }

        const d = await buildEmployeeDashboard(employee);

        return res.status(200).json({
            success: true,
            data: {
                ...d,
                // ── legacy keys ──
                totalAssigned: d.orders.total,
                countsByStatus: d.orders.countsByStatus,
                todayAssigned: d.orders.scheduledToday,      // jobs booked for today (was: created today)
                inProgressCount: d.orders.open,
                completedCount: d.orders.completed,
                upcomingSchedules: d.upcoming.length,
                recentOrders: d.recent,
            },
        });
    } catch (err) {
        console.error('Mechanic dashboard error:', err);
        return res.status(500).json({ success: false, message: 'Could not load the dashboard.' });
    }
};

export default { getMechanicDashboard };
