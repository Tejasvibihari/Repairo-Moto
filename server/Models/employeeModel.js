import mongoose from "mongoose";
import { storePhone } from "../Utils/phone.js";

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
    // Unique per employee (see the partial index below). Stored as the clean 10-digit number.
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
    // ─── Live duty status + tracking (mechanic on/off switch) ───────────────
    isOnline: { type: Boolean, default: false, index: true },
    lastOnlineAt: { type: Date, default: null },
    lastOfflineAt: { type: Date, default: null },
    lastSeenAt: { type: Date, default: null },   // last location ping, used to detect dead connections
    // Somebody (admin map / customer tracking screen) is watching until this time → phone streams fast.
    // Otherwise the phone only sends a low-power ping about once a minute. See services/trackingService.js
    trackingDemandUntil: { type: Date, default: null },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        speed: { type: Number },      // m/s
        heading: { type: Number },    // degrees
        accuracy: { type: Number },   // metres
        updatedAt: { type: Date },
    },
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

// Phone must be unique like email. Partial: employees without a phone don't collide with each other.
empleyeeSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $gt: "" } } });

const Employee = mongoose.model("Employee", empleyeeSchema);
export default Employee;