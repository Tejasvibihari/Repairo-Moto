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
        type: String,
    },
    rating: {
        type: Number,
        default: 0,
    },
    referralCode: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    role: {
        type: String,
        enum: ["admin", "employee", "mechanic", "manager", "operational manager", "telecaller"],
    }
})

const Employee = mongoose.model("Employee", empleyeeSchema);
export default Employee;