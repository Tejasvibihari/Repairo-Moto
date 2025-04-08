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
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
