import mongoose from 'mongoose';

const vendorOrderSchema = new mongoose.Schema({
    partsUsed: [
        {
            partName: { type: String, required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            discountPrice: { type: Number, default: 0, min: 0 }, // New field for discount price
        }
    ],
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Vendor model
        ref: 'Vendor',
        required: true,
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Delivery Boy model
        ref: 'Employee',
        default: null,
    },
    deliveryBoyName: {
        type: String, // Name of the delivery boy assigned
        default: '',
        trim: true,
    },
    orderDate: {
        type: Date, // Date when the order was created
        default: Date.now,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const VendorOrder = mongoose.model('VendorOrder', vendorOrderSchema);
export default VendorOrder;