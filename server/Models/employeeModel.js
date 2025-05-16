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
    profileImage: {
        type: String,
    },
    role: {
        type: String,
        default: 'employee'
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