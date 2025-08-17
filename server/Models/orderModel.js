import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String
    },
    contactNo: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    selectedBrand: {
        type: String,
        required: true,
        trim: true,
    },
    selectedModel: {
        type: String,
        required: true,
        trim: true,
    },
    modelName: {
        type: String,
        default: '',
        trim: true,
    },
    cc: {
        type: String,
        required: true,
        trim: true,
    },
    bs: {
        type: String,
        trim: true,
    },
    location: {
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        }
    },
    services: {
        type: [String],
        required: true,
        default: [],
    },
    otherService: {
        type: String,
        default: '',
        trim: true,
    },
    preferredDate: {
        type: Date,
        required: true,
    },
    preferredTime: {
        type: String,
        required: true,
    },
    estimatedBudget: {
        type: String,
        required: true,
        trim: true,
    },
    issues: {
        type: String,
        default: '',
        trim: true,
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'In Progress', "Mechanic Assigned", 'Completed', "Invoice Generated", 'Cancelled'],
    },
    assignedMechanic: {
        type: String,
        default: null,
        trim: true,
    },
    mechanicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mechanic',
        default: null,
    },
    referralProcessed: { type: Boolean, default: false },
    partsUsed: [
        {
            partName: { type: String, required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 },
            discountType: { type: String }
        }
    ],
    serviceProvided: [
        {
            serviceName: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 },
        }
    ],
    invoiceDate: {
        type: Date
    },
    assignedVendor: {
        type: String,
        default: null,
        trim: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null,
    },
    assignedDelivery: {
        type: String,
        default: null,
        trim: true,
    },
    deliveryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
    },
    total: {
        subTotal: { type: Number },
        total: { type: Number },
        discount: { type: Number },
        referralDiscount: { type: Number, default: 0 },
        discountType: { type: String }
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
