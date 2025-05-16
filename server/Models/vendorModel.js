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
    role: {
        type: String,
        default: "vendor"
    }
}, {
    timestamps: true
})

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;