import mongoose from "mongoose";
import { storePhone } from "../Utils/phone.js";

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
    // Unique per vendor (see the partial index below). Stored as the clean 10-digit number.
    phone: {
        type: String,
        trim: true,
        set: storePhone,
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
    googleLocation: {
        type: String,
    },
    ratings: [
        {
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            reviewer: {
                type: mongoose.Schema.Types.ObjectId, // optional
                ref: "User", // or "Customer" if you have that model
            },
            comment: String,
            date: {
                type: Date,
                default: Date.now,
            }
        }
    ],
    averageRating: {
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
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    role: {
        type: String,
        default: "vendor"
    },
    expoPushToken: {
        type: String,
        default: null,
        trim: true,
    }
}, {
    timestamps: true
})

// Phone must be unique like email. Partial: vendors without a phone don't collide with each other.
vendorSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $gt: "" } } });

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;