import express from 'express';
import { getVendorOrderByVendorId } from '../Controllers/vendorOrderController.js';

const router = express.Router();

router.get("/getvendororder/:vendorId", getVendorOrderByVendorId);
// /api/vendor/vendororder/getvendorOrder/:orderId
export default router;