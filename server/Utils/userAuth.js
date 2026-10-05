// Utils/userAuth.js — token + response shape shared by every customer login method
// (email/password, WhatsApp OTP, Firebase phone). Keeps the app's login response identical.
import jwt from "jsonwebtoken";

export const signUserToken = (user) =>
    jwt.sign({ id: user._id, email: user.email }, process.env.USER_JWT_SECRET, { expiresIn: "7d" });

export const userAuthPayload = (user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    referralCode: user.referralCode,
    accountType: user.accountType,
    phone: user.phone,
    profileImage: user.profileImage,
    address: user.address,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    businessName: user.businessName,
    businessType: user.businessType,
    referredBy: user.referredBy,
    referralType: user.referralType,
    status: user.status,
});
