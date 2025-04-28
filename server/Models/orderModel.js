import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
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
    partsUsed: [
        {
            partName: { type: String, required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 }, // New field for discount price
        }
    ],
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
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
