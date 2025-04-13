import mongoose from 'mongoose';

const vendorOrderSchema = new mongoose.Schema({
    spareParts: {
        type: [String], // List of spare parts required
        required: true,
        default: [],
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Vendor model
        ref: 'Vendor',
        required: true,
    },
    vendorName: {
        type: String, // Name of the vendor
        required: true,
        trim: true,
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
    status: {
        type: String, // Status of the vendor order
        default: 'Pending',
        enum: ['Pending', 'Picked', 'Delivered', 'Cancelled'],
    },
    orderDate: {
        type: Date, // Date when the order was created
        default: Date.now,
    },
    assignedDate: {
        type: Date, // Date when the delivery boy was assigned
        default: null,
    },
    deliveredTime: {
        type: Date, // Date and time when the item was delivered
        default: null,
    },
    notes: {
        type: String, // Additional notes or instructions
        default: '',
        trim: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const VendorOrder = mongoose.model('VendorOrder', vendorOrderSchema);
export default VendorOrder;