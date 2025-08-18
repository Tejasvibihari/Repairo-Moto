// referralMiddleware.js
import { generateReferralCode } from "../Utils/generateReferralCode.js";

export const attachReferralCode = (req, res, next) => {
    const { firstName, phone } = req.body;
    if (!firstName || !phone) {
        return res.status(400).json({ message: "First name and phone are required for referral code" });
    }
    req.referralCodeForUpload = generateReferralCode(firstName, phone);
    next();
};
