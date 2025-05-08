import express from "express";
import { createUser, getAllUser, getAllUserByReferralCode, getUserById, updateUser, usrSignIn } from "../Controllers/userController.js";
import { userUpload } from "../Middleware/userMulter.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);
router.post("/auth/user-sign-in", usrSignIn);
router.get("/getalluser", getAllUser);


router.get("/getalluser/:referalcode", getAllUserByReferralCode);
router.put('/update-profile/:userId', userUpload.single('profileImage'), updateUser)
router.get('/get-user-by-id/:userId', getUserById)

export default router;