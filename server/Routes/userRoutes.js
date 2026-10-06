import express from "express";
import { createUser, editUser, rateEmployee, getRatingStatus, getAllUser, getAllUserByReferralCode, getUserById, getWithdraHistory, updateUserStatus, updateWithdrawalStatus, userSignIn, withdrawRequest, findUserByEmail, accountAction, adminUpdateReferral, adminGetReferral, adminSearchReferralUsers } from "../Controllers/userController.js";
import { userUpload } from "../Middleware/userMulter.js";
import authUser from "../Middleware/authUser.js";
import authAdmin from "../Middleware/authAdmin.js";
import { sendPhoneOtp, verifyPhoneOtp, verifyFirebasePhone } from "../Controllers/phoneAuthController.js";
import { getOrderTracking } from "../Controllers/orderTrackingController.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);
router.post("/auth/user-sign-in", userSignIn);

// Phone login (creates the account on first use): 1) WhatsApp OTP  2) Firebase phone verification
router.post("/auth/phone/send-otp", sendPhoneOtp);
router.post("/auth/phone/verify-otp", verifyPhoneOtp);
router.post("/auth/phone/firebase", verifyFirebasePhone);
router.get("/getalluser", getAllUser);

// Account deletion / deactivation endpoints (public flow where user verifies with email+password)
router.post('/account/find', findUserByEmail);
router.post('/account/action', accountAction);


router.get("/getalluser/:referalcode", getAllUserByReferralCode);
router.put('/update-profile', authUser, userUpload.single('profileImage'), editUser)
router.get('/get-user-by-id/:userId', getUserById)

router.get('/withdrawal-history/:userId', authUser, getWithdraHistory);
router.post('/withdrawal-request/:userId', authUser, withdrawRequest);
router.put('/update/withdrawal-request/status/:userId', authAdmin, updateWithdrawalStatus);
router.put('/update-status/:userId', authAdmin, updateUserStatus);

// Admin: view / correct any customer's referral wallet (audited)
router.get('/admin/referral-users', authAdmin, adminSearchReferralUsers);
router.get('/admin/referral/:userId', authAdmin, adminGetReferral);
router.put('/admin/referral/:userId', authAdmin, adminUpdateReferral);

router.post("/rate-employee", authUser, rateEmployee);
router.get("/rating-status", authUser, getRatingStatus);

// Customer follows their mechanic / delivery partner (only while the order flow allows it)
router.get("/order-tracking/:orderId", authUser, getOrderTracking);

export default router;