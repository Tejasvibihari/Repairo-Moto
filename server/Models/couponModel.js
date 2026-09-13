import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    description: { type: String, trim: true, default: '' },

    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    // Only meaningful when discountType === 'percentage'. Caps the discount
    // amount so a "50% off" coupon can't blow past a sane ceiling.
    maxDiscountAmount: { type: Number, default: null, min: 0 },

    // Minimum order subtotal required for the coupon to be usable.
    minOrderAmount: { type: Number, default: 0, min: 0 },

    // null/0 = unlimited
    usageLimitTotal: { type: Number, default: null, min: 0 },
    // How many times a single user may use this coupon. null/0 = unlimited.
    usageLimitPerUser: { type: Number, default: 1, min: 0 },

    usedCount: { type: Number, default: 0, min: 0 },
    usedBy: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
            discountAmount: { type: Number, default: 0 },
            usedAt: { type: Date, default: Date.now },
        },
    ],

    // Optional restriction to specific service types. Empty = applies to all.
    applicableServiceTypes: {
        type: [String],
        enum: ['Schedule Repair', 'Emergency Repair'],
        default: [],
    },

    validFrom: { type: Date, default: Date.now },
    // null = never expires
    validUntil: { type: Date, default: null },

    isActive: { type: Boolean, default: true },

    createdBy: {
        id: { type: mongoose.Schema.Types.ObjectId, refPath: 'createdBy.model' },
        model: { type: String, enum: ['Admin', 'Employee'] },
        name: { type: String, trim: true },
    },
}, {
    timestamps: true,
});

couponSchema.index({ isActive: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;