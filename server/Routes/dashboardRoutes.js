import express from 'express';
import { getAdminDashboard } from '../Controllers/dashboardController.js';
import authAdmin from '../Middleware/authAdmin.js';
// import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/dashboard?period=today|week|month|year
router.get('/', authAdmin, getAdminDashboard);

export default router;