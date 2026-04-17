import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: { type: String, required: true, trim: true },
    email: { type: String },
    contactNo: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, uppercase: true },
    address: { type: String, required: true, trim: true },
    userLocation: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] }, // [lng, lat]
    },
    mechanicLocation: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
        lastUpdated: Date,
    },
    isWithinServiceArea: { type: Boolean, default: false },
    distanceFromCenter: { type: Number },

    selectedBrand: { type: String, required: true, trim: true },
    selectedModel: { type: String, required: true, trim: true },
    modelName: { type: String, default: '', trim: true },
    cc: { type: String, required: true, trim: true },
    bs: { type: String, trim: true },

    services: { type: [String], required: true, default: [] },
    serviceType: {
        type: String,
        enum: ['Schedule Repair', 'Emergency Repair'],
        default: 'Schedule Repair',
    },
    otherService: { type: String, default: '', trim: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    estimatedBudget: { type: String, trim: true },
    issues: { type: String, default: '', trim: true },

    // ─── Status Flow ──────────────────────────────────────────────────────────
    status: {
        type: String,
        default: 'Pending',
        enum: [
            'Pending',
            'Mechanic Assigned',
            'Mechanic Arrived',
            'In Progress',
            'Work Completed',
            'Invoice Generated',
            'Completed',
            'Cancelled',
        ],
    },

    arrivedAt: { type: Date, default: null },

    // ─── Work Start OTP ───────────────────────────────────────────────────────
    // pendingPhotoPath: temporary before-photo path stored here until OTP is
    // verified. On success it is moved to beforePhotos[]. On failure/expiry it
    // is deleted from disk and this field is cleared.
    workStartOtp: {
        code: { type: String, default: null },
        expiresAt: { type: Date, default: null },
        verified: { type: Boolean, default: false },
        attempts: { type: Number, default: 0 },
        pendingPhotoPath: { type: String, default: null },
    },

    // ─── Work Completion OTP ──────────────────────────────────────────────────
    // Same pattern: pendingPhotoPath holds the temp after-photo until the
    // customer's OTP confirms the work. On success it moves to afterPhotos[].
    workCompleteOtp: {
        code: { type: String, default: null },
        expiresAt: { type: Date, default: null },
        verified: { type: Boolean, default: false },
        attempts: { type: Number, default: 0 },
        pendingPhotoPath: { type: String, default: null },
    },

    workStartedAt: { type: Date, default: null },
    workCompletedAt: { type: Date, default: null },

    // ─── Confirmed Repair Photos ──────────────────────────────────────────────
    // Only populated after successful OTP verification.
    beforePhoto: { type: String, default: null },
    afterPhoto: { type: String, default: null },
    // ─── Photo Cleanup Tracking ───────────────────────────────────────────────
    photosScheduledDeleteAt: { type: Date, default: null },
    photosDeleted: { type: Boolean, default: false },

    // ─── Assignments ──────────────────────────────────────────────────────────
    assignedMechanics: [{ type: String, trim: true }],
    mechanicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    assignedVendor: { type: String, default: null, trim: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
    assignedDelivery: { type: String, default: null, trim: true },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },

    referralProcessed: { type: Boolean, default: false },

    partsUsed: [
        {
            partName: { type: String, required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 },
            discountType: { type: String },
        },
    ],
    serviceProvided: [
        {
            serviceName: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 },
        },
    ],

    invoiceDate: { type: Date },

    total: {
        subTotal: { type: Number },
        total: { type: Number },
        discount: { type: Number },
        referralDiscount: { type: Number, default: 0 },
        discountType: { type: String },
        sgst: { type: Number, default: 0 },
        cgst: { type: Number, default: 0 },
        sgstRate: { type: Number, default: 0 },
        cgstRate: { type: Number, default: 0 },
        baseAmount: { type: Number, default: 0 },
        finalPayable: { type: Number, default: 0 },
    },

    coupon: { type: String },

    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid',
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'card', 'razorpay', 'bank_transfer', 'referral', null],
        default: null,
    },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    paymentDate: { type: Date, default: null },

    razorpay: {
        orderId: { type: String, default: null, trim: true },
        paymentId: { type: String, default: null, trim: true },
        paymentLinkId: { type: String, default: null, trim: true },
        paymentLinkUrl: { type: String, default: null, trim: true },
        signature: { type: String, default: null },
        status: {
            type: String,
            enum: ['created', 'sent', 'paid', 'cancelled', 'expired', null],
            default: null,
        },
        linkCreatedAt: { type: Date, default: null },
        receiptId: { type: String, default: null, trim: true },
        webhookPayload: { type: mongoose.Schema.Types.Mixed, default: null },
        hadFailedAttempt: { type: Boolean, default: false },
        pendingReferralToApply: { type: Number, default: 0 },
        pendingOriginalPayable: { type: Number, default: 0 },
    },

    cancellationReason: { type: String, default: null, trim: true },
    cancelledAt: { type: Date, default: null },
}, {
    timestamps: true,
});

orderSchema.index({ userLocation: '2dsphere' });

orderSchema.pre('save', function (next) {
    if (this.total?.total != null) {
        const payableAmount = this.total.finalPayable || this.total.total || 0;
        const paid = this.amountPaid || 0;
        this.balanceDue = Math.max(0, payableAmount - paid);

        if (paid <= 0) {
            this.paymentStatus = 'unpaid';
        } else if (paid >= payableAmount) {
            this.paymentStatus = 'paid';
            this.balanceDue = 0;
        } else {
            this.paymentStatus = 'partial';
        }
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;