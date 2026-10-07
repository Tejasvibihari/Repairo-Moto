import express from 'express';
import { getEmployeeOverview } from '../Controllers/employeeDashboardController.js';
import { authenticateEmployee } from '../Middleware/employeeAuth.js';

const router = express.Router();

// GET /api/employee/dashboard/overview
router.get('/', authenticateEmployee, getEmployeeOverview);

export default router;
