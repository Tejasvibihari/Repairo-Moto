import express from 'express';
import { getMechanicDashboard } from '../Controllers/mechanicDashboardController.js';
import { authenticateEmployee } from '../Middleware/employeeAuth.js';

const router = express.Router();

router.get('/', authenticateEmployee, getMechanicDashboard);

export default router;
