import express from 'express';
import { getDeliveryDashboard } from '../Controllers/deliveryDashboardController.js';
import { authenticateEmployee } from '../Middleware/employeeAuth.js';

const router = express.Router();

router.get('/', authenticateEmployee, getDeliveryDashboard);

export default router;
