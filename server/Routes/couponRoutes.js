import express from 'express';
import authAdmin from '../Middleware/authAdmin.js';
import authUser from '../Middleware/authUser.js';
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    getCouponUsageReport,
    verifyCoupon,
    applyCouponToOrder,
    removeCouponFromOrder,
    adminRemoveCouponFromOrder,
} from '../Controllers/couponController.js';

// ─── Admin router — mount at /api/admin/coupons ──────────────────────────────
export const adminCouponRouter = express.Router();

adminCouponRouter.post('/create', authAdmin, createCoupon);
adminCouponRouter.get('/all', authAdmin, getAllCoupons);
adminCouponRouter.get('/:id', authAdmin, getCouponById);
adminCouponRouter.put('/:id', authAdmin, updateCoupon);
adminCouponRouter.delete('/:id', authAdmin, deleteCoupon);
adminCouponRouter.patch('/:id/toggle', authAdmin, toggleCouponStatus);
adminCouponRouter.get('/:id/usage', authAdmin, getCouponUsageReport);
adminCouponRouter.delete('/order/:orderId', authAdmin, adminRemoveCouponFromOrder); // remove a coupon from any order (pre-invoice)

// ─── User-facing router — mount at /api/coupons ──────────────────────────────
export const userCouponRouter = express.Router();

userCouponRouter.post('/verify', authUser, verifyCoupon);
userCouponRouter.post('/apply', authUser, applyCouponToOrder);
userCouponRouter.post('/remove', authUser, removeCouponFromOrder);

export default adminCouponRouter;