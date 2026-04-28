import mongoose from 'mongoose';

const manualInvoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
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

        businessDetails: {
            gstin: { type: String, trim: true, uppercase: true },
            businessName: { type: String, trim: true },
            businessAddress: { type: String, trim: true },
            businessCity: { type: String, trim: true },
            businessState: { type: String, trim: true },
            businessPincode: { type: String, trim: true },
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
                effectivePrice: { type: Number, default: 0, min: 0 },
            },
        ],

        serviceProvided: [
            {
                serviceName: { type: String },
                quantity: { type: Number, min: 1 },
                price: { type: Number, min: 0 },
                discountPrice: { type: Number, default: 0, min: 0 },
                effectivePrice: { type: Number, default: 0, min: 0 },
            },
        ],

        // ─── Financial Totals ─────────────────────────────────────────────────
        total: {
            subTotal: { type: Number, default: 0 },
            discount: { type: Number, default: 0 },
            discountType: { type: String },
            referralDiscount: { type: Number, default: 0 },
            walletAmountUsed: { type: Number, default: 0 },
            sgst: { type: Number, default: 0 },
            cgst: { type: Number, default: 0 },
            sgstRate: { type: Number, default: 0 },
            cgstRate: { type: Number, default: 0 },
            baseAmount: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            finalPayable: { type: Number, default: 0 },
            totalAmountPaid: { type: Number, default: 0 },
        },

        // ─── Payment Details ──────────────────────────────────────────────────
        paymentDetails: {
            method: {
                type: String,
                enum: ['razorpay', 'upi', 'card', 'bank_transfer', 'referral', 'cash'],
                default: 'razorpay',
            },
            razorpayPaymentId: { type: String, trim: true, default: null },
            razorpayOrderId: { type: String, trim: true, default: null },
            amountPaid: { type: Number, default: 0, min: 0 },
            walletAmountUsed: { type: Number, default: 0, min: 0 },
            totalSettled: { type: Number, default: 0, min: 0 },
            paymentDate: { type: Date, default: null },
        },

        // ─── Invoice Status ───────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['draft', 'paid', 'cancelled'],
            default: 'paid',
        },
    },
    {
        timestamps: true,
    }
);

const ManualInvoice = mongoose.model('ManualInvoice', manualInvoiceSchema);
export default ManualInvoice;