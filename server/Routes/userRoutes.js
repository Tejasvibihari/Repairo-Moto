import express from "express";
import { createUser, editUser, getAllUser, getAllUserByReferralCode, getUserById, updateUser, usrSignIn } from "../Controllers/userController.js";
import { userUpload } from "../Middleware/userMulter.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);
router.post("/auth/user-sign-in", usrSignIn);
router.get("/getalluser", getAllUser);


router.get("/getalluser/:referalcode", getAllUserByReferralCode);
router.put('/update-profile/:userId', userUpload.single('profileImage'), editUser)
router.get('/get-user-by-id/:userId', getUserById)

export default router;