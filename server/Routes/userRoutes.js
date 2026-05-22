import express from "express";
import { createUser, editUser, rateEmployee, getRatingStatus, getAllUser, getAllUserByReferralCode, getUserById, getWithdraHistory, updateUserStatus, updateWithdrawalStatus, userSignIn, withdrawRequest, findUserByEmail, accountAction } from "../Controllers/userController.js";
import { userUpload } from "../Middleware/userMulter.js";
import authUser from "../Middleware/authUser.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);
router.post("/auth/user-sign-in", userSignIn);
router.get("/getalluser", getAllUser);

// Account deletion / deactivation endpoints (public flow where user verifies with email+password)
router.post('/account/find', findUserByEmail);
router.post('/account/action', accountAction);


router.get("/getalluser/:referalcode", getAllUserByReferralCode);
router.put('/update-profile', authUser, userUpload.single('profileImage'), editUser)
router.get('/get-user-by-id/:userId', getUserById)

router.get('/withdrawal-history/:userId', getWithdraHistory);
router.post('/withdrawal-request/:userId', withdrawRequest);
router.put('/update/withdrawal-request/status/:userId', updateWithdrawalStatus);
router.put('/update-status/:userId', updateUserStatus);

router.post("/rate-employee", authUser, rateEmployee);
router.get("/rating-status", authUser, getRatingStatus);

export default router;