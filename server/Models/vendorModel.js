import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
    firstName: {
        type: String,

    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: {
        type: String,
    },
    rating: {
        type: Number,
        default: 0,
    },
    referralCode: {
        type: String,
    },
    businessName: {
        type: String
    },
    gstNo: {
        type: String
    },
    profileImage: {
        type: String
    }
})

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;