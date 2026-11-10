import express from 'express';
import authUser from '../Middleware/authUser.js';
import { getServicePricing } from '../Controllers/serviceController.js';

// Mount at /api/services
// Customer-facing, read-only: the price list for one brand + model while booking.
// (Service management itself stays under /api/admin/services.)
const router = express.Router();

router.get('/pricing', authUser, getServicePricing);

export default router;
