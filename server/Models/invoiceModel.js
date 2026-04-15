import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    invoiceDate: {
        type: Date,
        default: Date.now,
    },

    // ─── Customer Details ─────────────────────────────────────────────────
    customerDetails: {
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        contactNo: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true, uppercase: true },
    },

    // ─── Vehicle Details ──────────────────────────────────────────────────
    vehicleDetails: {
        brand: { type: String, trim: true },
        model: { type: String, trim: true },
        modelName: { type: String, trim: true },
        cc: { type: String, trim: true },
        bs: { type: String, trim: true },
    },

    // ─── Service & Parts ──────────────────────────────────────────────────
    partsUsed: [
        {
            partName: { type: String, trim: true },
            quantity: { type: Number, min: 1 },
            price: { type: Number, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 },
            discountType: { type: String },
        },
    ],
    serviceProvided: [
        {
            serviceName: { type: String },
            quantity: { type: Number, min: 1 },
            price: { type: Number, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 },
        },
    ],

    // ─── Financial Totals ─────────────────────────────────────────────────
    total: {
        subTotal: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountType: { type: String },
        referralDiscount: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        cgst: { type: Number, default: 0 },
        sgstRate: { type: Number, default: 0 },
        cgstRate: { type: Number, default: 0 },
        baseAmount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        finalPayable: { type: Number, default: 0 },
    },

    // ─── Payment Details ──────────────────────────────────────────────────
    paymentDetails: {
        method: {
            type: String,
            enum: ['razorpay', 'upi', 'card', 'bank_transfer'],
            default: 'razorpay',
        },
        razorpayPaymentId: { type: String, trim: true, default: null },
        razorpayOrderId: { type: String, trim: true, default: null },
        amountPaid: { type: Number, default: 0, min: 0 },
        paymentDate: { type: Date, default: null },
    },

    // ─── Invoice Status ───────────────────────────────────────────────────
    status: {
        type: String,
        enum: ['draft', 'paid', 'cancelled'],
        default: 'paid',
    },
}, {
    timestamps: true,
});

// Index for quick lookup by order
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ userId: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
