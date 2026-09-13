import mongoose from 'mongoose';
import Coupon from '../Models/couponModel.js';
import Order from '../Models/orderModel.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute the discount amount a coupon grants against a given order amount.
 * Always clamps to [0, orderAmount] so a coupon can never make a total negative.
 */
export const computeCouponDiscount = (coupon, orderAmount) => {
    const amount = Number(orderAmount) || 0;
    if (amount <= 0) return 0;

    let discount = 0;
    if (coupon.discountType === 'percentage') {
        discount = (amount * Number(coupon.discountValue || 0)) / 100;
        if (coupon.maxDiscountAmount != null && coupon.maxDiscountAmount > 0) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
        }
    } else {
        // flat
        discount = Number(coupon.discountValue || 0);
    }

    discount = Math.min(discount, amount);
    return Math.round(discount * 100) / 100;
};

/**
 * Validate a coupon document against usage rules.
 * `orderAmount` is optional (e.g. not yet known at booking time) — when omitted,
 * the minOrderAmount check is skipped.
 * Returns { valid: boolean, message?: string }
 */
export const validateCoupon = (coupon, { orderAmount = null, userId = null, serviceType = null } = {}) => {
    if (!coupon) {
        return { valid: false, message: 'Invalid coupon code.' };
    }
    if (!coupon.isActive) {
        return { valid: false, message: 'This coupon is no longer active.' };
    }

    const now = new Date();
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
        return { valid: false, message: 'This coupon is not active yet.' };
    }
    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
        return { valid: false, message: 'This coupon has expired.' };
    }

    if (
        serviceType &&
        Array.isArray(coupon.applicableServiceTypes) &&
        coupon.applicableServiceTypes.length > 0 &&
        !coupon.applicableServiceTypes.includes(serviceType)
    ) {
        return { valid: false, message: `This coupon is not valid for ${serviceType}.` };
    }

    if (orderAmount != null && coupon.minOrderAmount > 0 && Number(orderAmount) < coupon.minOrderAmount) {
        return {
            valid: false,
            message: `This coupon requires a minimum order amount of ₹${coupon.minOrderAmount}.`,
        };
    }

    if (coupon.usageLimitTotal != null && coupon.usageLimitTotal > 0 && coupon.usedCount >= coupon.usageLimitTotal) {
        return { valid: false, message: 'This coupon has reached its usage limit.' };
    }

    if (userId && coupon.usageLimitPerUser != null && coupon.usageLimitPerUser > 0) {
        const timesUsedByUser = (coupon.usedBy || []).filter(
            (u) => u.userId && u.userId.toString() === userId.toString()
        ).length;
        if (timesUsedByUser >= coupon.usageLimitPerUser) {
            return { valid: false, message: 'You have already used this coupon the maximum number of times.' };
        }
    }

    return { valid: true };
};

const serializeCoupon = (coupon) => ({
    _id: coupon._id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    minOrderAmount: coupon.minOrderAmount,
    usageLimitTotal: coupon.usageLimitTotal,
    usageLimitPerUser: coupon.usageLimitPerUser,
    usedCount: coupon.usedCount,
    applicableServiceTypes: coupon.applicableServiceTypes,
    validFrom: coupon.validFrom,
    validUntil: coupon.validUntil,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
});

// ─── Admin: Create ────────────────────────────────────────────────────────────

export const createCoupon = async (req, res) => {
    try {
        const {
            code, description, discountType, discountValue, maxDiscountAmount,
            minOrderAmount, usageLimitTotal, usageLimitPerUser,
            applicableServiceTypes, validFrom, validUntil, isActive,
        } = req.body;

        if (!code || !discountType || discountValue == null) {
            return res.status(400).json({
                success: false,
                message: 'code, discountType and discountValue are required.',
            });
        }

        if (!['percentage', 'flat'].includes(discountType)) {
            return res.status(400).json({
                success: false,
                message: `discountType must be either "percentage" or "flat".`,
            });
        }

        if (discountType === 'percentage' && Number(discountValue) > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount cannot exceed 100.',
            });
        }

        const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
        }

        const coupon = await Coupon.create({
            code: code.trim().toUpperCase(),
            description: description || '',
            discountType,
            discountValue: Number(discountValue),
            maxDiscountAmount: maxDiscountAmount != null ? Number(maxDiscountAmount) : null,
            minOrderAmount: minOrderAmount != null ? Number(minOrderAmount) : 0,
            usageLimitTotal: usageLimitTotal != null ? Number(usageLimitTotal) : null,
            usageLimitPerUser: usageLimitPerUser != null ? Number(usageLimitPerUser) : 1,
            applicableServiceTypes: applicableServiceTypes || [],
            validFrom: validFrom ? new Date(validFrom) : new Date(),
            validUntil: validUntil ? new Date(validUntil) : null,
            isActive: isActive ?? true,
            createdBy: req.user
                ? { id: req.user._id, model: req.user.model || 'Admin', name: req.user.leadBy || req.user.email }
                : undefined,
        });

        return res.status(201).json({
            success: true,
            message: 'Coupon created successfully.',
            coupon: serializeCoupon(coupon),
        });
    } catch (error) {
        console.error('Error creating coupon:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
        }
        return res.status(500).json({ success: false, message: 'Server error while creating coupon.' });
    }
};

// ─── Admin: Get All (paginated + filterable) ─────────────────────────────────

export const getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 20, isActive, search, sort = 'createdAt:desc' } = req.query;

        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) filter.code = { $regex: search.trim(), $options: 'i' };

        const [sortField, sortDir] = sort.split(':');
        const sortObj = { [sortField || 'createdAt']: sortDir === 'asc' ? 1 : -1 };

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

        const [coupons, total] = await Promise.all([
            Coupon.find(filter)
                .sort(sortObj)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Coupon.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            coupons,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching coupons.' });
    }
};

// ─── Admin: Get One ───────────────────────────────────────────────────────────

export const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon id.' });
        }
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }
        return res.status(200).json({ success: true, coupon });
    } catch (error) {
        console.error('Error fetching coupon:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching coupon.' });
    }
};

// ─── Admin: Update ────────────────────────────────────────────────────────────

export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon id.' });
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }

        const {
            code, description, discountType, discountValue, maxDiscountAmount,
            minOrderAmount, usageLimitTotal, usageLimitPerUser,
            applicableServiceTypes, validFrom, validUntil, isActive,
        } = req.body;

        if (discountType && !['percentage', 'flat'].includes(discountType)) {
            return res.status(400).json({
                success: false,
                message: 'discountType must be either "percentage" or "flat".',
            });
        }

        if (code && code.trim().toUpperCase() !== coupon.code) {
            const clash = await Coupon.findOne({ code: code.trim().toUpperCase(), _id: { $ne: id } });
            if (clash) {
                return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
            }
            coupon.code = code.trim().toUpperCase();
        }

        if (description !== undefined) coupon.description = description;
        if (discountType !== undefined) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
        if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount === null ? null : Number(maxDiscountAmount);
        if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
        if (usageLimitTotal !== undefined) coupon.usageLimitTotal = usageLimitTotal === null ? null : Number(usageLimitTotal);
        if (usageLimitPerUser !== undefined) coupon.usageLimitPerUser = usageLimitPerUser === null ? null : Number(usageLimitPerUser);
        if (applicableServiceTypes !== undefined) coupon.applicableServiceTypes = applicableServiceTypes;
        if (validFrom !== undefined) coupon.validFrom = validFrom ? new Date(validFrom) : new Date();
        if (validUntil !== undefined) coupon.validUntil = validUntil ? new Date(validUntil) : null;
        if (isActive !== undefined) coupon.isActive = isActive;

        if (coupon.discountType === 'percentage' && coupon.discountValue > 100) {
            return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100.' });
        }

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: 'Coupon updated successfully.',
            coupon: serializeCoupon(coupon),
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
        }
        return res.status(500).json({ success: false, message: 'Server error while updating coupon.' });
    }
};

// ─── Admin: Delete ────────────────────────────────────────────────────────────

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon id.' });
        }
        const deleted = await Coupon.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }
        return res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting coupon.' });
    }
};

// ─── Admin: Toggle active/inactive ────────────────────────────────────────────

export const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon id.' });
        }
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        return res.status(200).json({
            success: true,
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.`,
            coupon: serializeCoupon(coupon),
        });
    } catch (error) {
        console.error('Error toggling coupon status:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating coupon.' });
    }
};

// ─── Admin: Usage report for one coupon ──────────────────────────────────────
// Returns redemption history with order/user context for dashboards.

export const getCouponUsageReport = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon id.' });
        }

        const coupon = await Coupon.findById(id)
            .populate('usedBy.userId', 'name email contactNo')
            .populate('usedBy.orderId', 'orderId total status createdAt')
            .lean();

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }

        const totalDiscountGiven = (coupon.usedBy || []).reduce(
            (sum, u) => sum + (Number(u.discountAmount) || 0),
            0
        );

        return res.status(200).json({
            success: true,
            coupon: serializeCoupon(coupon),
            usage: {
                totalRedemptions: coupon.usedCount,
                totalDiscountGiven,
                history: (coupon.usedBy || []).sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt)),
            },
        });
    } catch (error) {
        console.error('Error fetching coupon usage report:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching usage report.' });
    }
};

// ─── User: Verify (preview only, no side-effects) ────────────────────────────

export const verifyCoupon = async (req, res) => {
    try {
        const { code, orderAmount, serviceType } = req.body;
        const userId = req.user?._id || null;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Coupon code is required.' });
        }

        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
        const { valid, message } = validateCoupon(coupon, {
            orderAmount: orderAmount != null ? Number(orderAmount) : null,
            userId,
            serviceType,
        });

        if (!valid) {
            return res.status(400).json({ success: false, valid: false, message });
        }

        const discountAmount = orderAmount != null ? computeCouponDiscount(coupon, orderAmount) : 0;

        return res.status(200).json({
            success: true,
            valid: true,
            message: 'Coupon is valid.',
            coupon: serializeCoupon(coupon),
            discountAmount,
            payableAmount: orderAmount != null ? Math.max(0, Number(orderAmount) - discountAmount) : null,
        });
    } catch (error) {
        console.error('Error verifying coupon:', error);
        return res.status(500).json({ success: false, message: 'Server error while verifying coupon.' });
    }
};

// ─── User: Apply to an order (stores intent; discount is finalized at invoice-gen) ─

export const applyCouponToOrder = async (req, res) => {
    try {
        const { orderId, code } = req.body;
        const userId = req.user?._id || null;

        if (!orderId || !code) {
            return res.status(400).json({ success: false, message: 'orderId and code are required.' });
        }
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid orderId.' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (userId && order.userId && order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You cannot modify this order.' });
        }
        if (['Invoice Generated', 'Completed', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Coupons cannot be applied once the order is in "${order.status}" status.`,
            });
        }

        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
        const { valid, message } = validateCoupon(coupon, { userId, serviceType: order.serviceType });
        if (!valid) {
            return res.status(400).json({ success: false, valid: false, message });
        }

        order.coupon = {
            code: coupon.code,
            couponId: coupon._id,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: 0, // resolved once the real bill amount exists (invoice generation)
            appliedAt: new Date(),
            finalized: false,
        };
        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Coupon applied. The discount will be reflected on your invoice.',
            coupon: order.coupon,
        });
    } catch (error) {
        console.error('Error applying coupon to order:', error);
        return res.status(500).json({ success: false, message: 'Server error while applying coupon.' });
    }
};

// ─── User: Remove a not-yet-finalized coupon from an order ───────────────────

export const removeCouponFromOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user?._id || null;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'Valid orderId is required.' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (userId && order.userId && order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You cannot modify this order.' });
        }
        if (order.coupon?.finalized) {
            return res.status(400).json({
                success: false,
                message: 'This coupon has already been finalized on the invoice and cannot be removed.',
            });
        }

        order.coupon = undefined;
        await order.save();

        return res.status(200).json({ success: true, message: 'Coupon removed from order.' });
    } catch (error) {
        console.error('Error removing coupon from order:', error);
        return res.status(500).json({ success: false, message: 'Server error while removing coupon.' });
    }
};

// ─── Internal: finalize usage at invoice-generation time ─────────────────────
// Atomically records that a coupon was used, guarding against the usage limit
// being exceeded by concurrent requests.
export const finalizeCouponUsage = async ({ couponId, userId, orderId, discountAmount }) => {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return null;

    const filter = { _id: couponId };
    if (coupon.usageLimitTotal != null && coupon.usageLimitTotal > 0) {
        filter.usedCount = { $lt: coupon.usageLimitTotal };
    }

    const updated = await Coupon.findOneAndUpdate(
        filter,
        {
            $inc: { usedCount: 1 },
            $push: { usedBy: { userId, orderId, discountAmount, usedAt: new Date() } },
        },
        { new: true }
    );

    return updated; // null if the usage limit filter failed to match (race lost)
};