import express from 'express';
import { getVendorOrderByOrderId, getVendorOrderByVendorId } from '../Controllers/vendorOrderController.js';

const router = express.Router();

router.get("/getvendororder/:vendorId", getVendorOrderByVendorId);
router.get("/getvendororder/orderid/:orderId", getVendorOrderByOrderId);

// /api/vendor/vendororder/getvendorOrder/:orderId
export default router;