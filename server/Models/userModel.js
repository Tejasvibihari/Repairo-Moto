import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    amount: Number,
    requestDate: { type: Date, default: Date.now },
    upiId: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    adminNote: { type: String, default: null },
    processedDate: { type: Date, default: null },
    transactionId: { type: String, default: null }
});


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
    address: String,
    city: String,
    state: String,
    pincode: String,
    businessType: {
        type: String,
        default: null
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    profileImage: {
        type: String,
        default: null
    },
    expoPushToken: {
        type: String,
        default: null,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspended'],
        default: 'approved'
    },

    // 💰 Referral amounts
    pendingReferralAmount: {
        type: Number,
        default: 0 // Amount earned but not yet unlocked
    },
    referralAmount: {
        type: Number,
        default: 0 // Usable amount
    },
    referralCount: {
        type: Number,
        default: 0
    },

    totalWithdrawn: {
        type: Number,
        default: 0
    },

    withdrawalRequests: [withdrawalSchema], // history of withdrawal requests

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
