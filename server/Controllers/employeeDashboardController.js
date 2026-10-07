// Controllers/employeeDashboardController.js
//
// GET /api/employee/dashboard/overview
// One role-aware payload for the signed-in employee's own dashboard (mechanic, delivery,
// manager, operational manager, …): orders, attendance, distance, rating and a 7-day strip.
// All the maths lives in Utils/employeeStats.js so every dashboard uses the same definitions.
import { buildEmployeeDashboard } from '../Utils/employeeStats.js';

export const getEmployeeOverview = async (req, res) => {
    try {
        const employee = req.employee;
        if (!employee) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const data = await buildEmployeeDashboard(employee);
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Employee dashboard error:', err);
        return res.status(500).json({ success: false, message: 'Could not load the dashboard.' });
    }
};

export default { getEmployeeOverview };
