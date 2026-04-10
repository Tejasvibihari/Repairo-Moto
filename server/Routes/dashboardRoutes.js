import express from 'express';
import { getAdminDashboard, getOrderCounts } from '../Controllers/dashboardController.js';
import authAdmin from '../Middleware/authAdmin.js';
import { authenticateEmployee } from '../Middleware/employeeAuth.js';
// import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/dashboard?period=today|week|month|year
router.get('/', authAdmin, getAdminDashboard);
router.get('/order-counts', authenticateEmployee, getOrderCounts);
export default router;