import express from 'express';
import { getAdminDashboard, getDashboardFilterOptions, getOrderCounts } from '../Controllers/dashboardController.js';
import authAdmin from '../Middleware/authAdmin.js';
import { authenticateEmployee } from '../Middleware/employeeAuth.js';
// import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/dashboard?period=today|yesterday|week|last7|last30|month|year|custom&from=&to=&city=&serviceType=&mechanicId=
router.get('/', authAdmin, getAdminDashboard);
// GET /api/admin/dashboard/filters  → cities, service types, mechanics for the filter sheet
router.get('/filters', authAdmin, getDashboardFilterOptions);
router.get('/order-counts', authenticateEmployee, getOrderCounts);
export default router;