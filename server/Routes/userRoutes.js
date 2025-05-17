import express from "express";
import { createUser, editUser, getAllUser, getAllUserByReferralCode, getUserById, userSignIn } from "../Controllers/userController.js";
import { userUpload } from "../Middleware/userMulter.js";
import authUser from "../Middleware/authUser.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);
router.post("/auth/user-sign-in", userSignIn);
router.get("/getalluser", getAllUser);


router.get("/getalluser/:referalcode", authUser, getAllUserByReferralCode);
router.put('/update-profile/:userId', userUpload.single('profileImage'), editUser)
router.get('/get-user-by-id/:userId', authUser, getUserById)

export default router;