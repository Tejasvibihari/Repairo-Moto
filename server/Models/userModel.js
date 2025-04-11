import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    referralCode: {
        type: String,
        unique: true
    },
    referredBy: {
        type: String,
        default: null // store referralCode of the referrer
    },
    referralType: {
        type: String
    },
    accountType: {
        type: String,
        enum: ['personal', 'business'],
        required: true
    },
    businessName: {
        type: String,
        default: null
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
    businessType: {
        type: String,
        default: null
    },
    profileImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
