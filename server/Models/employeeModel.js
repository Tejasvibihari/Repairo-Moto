import mongoose from "mongoose";

const empleyeeSchema = new mongoose.Schema({
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
    pinCode: {
        type: Number,
    },
    ratings: [
        {
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            reviewer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                required: true,
            },
            comment: String,
            date: {
                type: Date,
                default: Date.now,
            }
        }
    ],
    aadhar: {
        type: Number,
        required: true
    },
    dl: {
        type: String
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    referralCode: {
        type: String,
    },
    aadharImages: {
        front: { type: String },
        back: { type: String }
    },
    dlImage: { type: String },
    profileImage: { type: String },
    expoPushToken: {
        type: String,
        default: null,
        trim: true,
    },
    role: {
        type: String,
        default: 'employee'
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    position: {
        type: String,
        enum: ["admin", "employee", "mechanic", "manager", "operational manager", "telecaller", "delivery"],
    }
}, {
    timestamps: true
})

const Employee = mongoose.model("Employee", empleyeeSchema);
export default Employee;