import express from "express";
import { vendorSignIn } from "../Controllers/vendorController.js";
import { vendorSendOtp, vendorVerifyOtp } from "../Controllers/staffOtpController.js";


const router = express.Router();

router.post("/vendor-sign-in", vendorSignIn);
// WhatsApp OTP login
router.post("/send-otp", vendorSendOtp);
router.post("/verify-otp", vendorVerifyOtp);

export default router;