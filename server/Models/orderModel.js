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
    distanceFromCenter: { type: Number }, // in meters

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

    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'In Progress', 'Mechanic Assigned', 'Completed', 'Invoice Generated', 'Cancelled'],
    },

    assignedMechanic: { type: String, default: null, trim: true },
    mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
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
        total: { type: Number },                  // GST-inclusive total (before referral discount)
        discount: { type: Number },               // overall discount amount
        referralDiscount: { type: Number, default: 0 },
        discountType: { type: String },           // 'Flat' or 'Percentage'
        // GST fields (inclusive — prices already contain tax)
        sgst: { type: Number, default: 0 },       // SGST amount
        cgst: { type: Number, default: 0 },       // CGST amount
        sgstRate: { type: Number, default: 0 },   // SGST percentage
        cgstRate: { type: Number, default: 0 },   // CGST percentage
        baseAmount: { type: Number, default: 0 }, // base after removing GST from total
        finalPayable: { type: Number, default: 0 }, // total - referralDiscount (actual payable)
    },

    coupon: { type: String },

    // ─── Payment Fields ────────────────────────────────────────────────────────
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid',
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'card', 'razorpay', 'bank_transfer'],
        default: null,
    },
    // Amount actually received (useful for partial payments)
    amountPaid: {
        type: Number,
        default: 0,
        min: 0,
    },
    // Balance remaining (computed but stored for quick querying)
    balanceDue: {
        type: Number,
        default: 0,
        min: 0,
    },
    // Timestamp when payment was completed / last updated
    paymentDate: {
        type: Date,
        default: null,
    },

    // ─── Razorpay Integration Fields ──────────────────────────────────────────
    razorpay: {
        // Razorpay Order ID (created via Razorpay API, e.g. order_xxxxxxxxxx)
        orderId: {
            type: String,
            default: null,
            trim: true,
        },
        // Razorpay Payment ID returned after successful payment
        paymentId: {
            type: String,
            default: null,
            trim: true,
        },
        // Razorpay Payment Link ID (if using payment links)
        paymentLinkId: {
            type: String,
            default: null,
            trim: true,
        },
        // Short URL sent to customer
        paymentLinkUrl: {
            type: String,
            default: null,
            trim: true,
        },
        // Razorpay signature for webhook verification
        signature: {
            type: String,
            default: null,
        },
        // Status as returned by Razorpay: created | sent | paid | cancelled | expired
        status: {
            type: String,
            enum: ['created', 'sent', 'paid', 'cancelled', 'expired', null],
            default: null,
        },
        // Timestamp when Razorpay payment link was created
        linkCreatedAt: {
            type: Date,
            default: null,
        },
        // Razorpay receipt ID (for reconciliation)
        receiptId: {
            type: String,
            default: null,
            trim: true,
        },
        // Raw webhook payload snapshot (for audit)
        webhookPayload: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },

    // ─── Cancellation Fields ──────────────────────────────────────────────────
    cancellationReason: { type: String, default: null, trim: true },
    cancelledAt: { type: Date, default: null },
}, {
    timestamps: true,
});

orderSchema.index({ userLocation: '2dsphere' });

// ─── Pre-save hook: auto-calculate balanceDue ─────────────────────────────────
orderSchema.pre('save', function (next) {
    if (this.total?.total != null) {
        // Use finalPayable (total minus referral discount) as the amount to compare against
        const payableAmount = this.total.finalPayable || this.total.total || 0;
        const paid = this.amountPaid || 0;
        this.balanceDue = Math.max(0, payableAmount - paid);

        // Auto-update paymentStatus based on amounts
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