import express from 'express';
import { getTelecallerDashboard } from '../Controllers/telecallerDashboardController.js';
import { authenticateEmployee } from '../Middleware/employeeAuth.js';

const router = express.Router();

// GET /api/employee/dashboard
router.get('/', authenticateEmployee, getTelecallerDashboard);

export default router;
