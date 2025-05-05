import express from "express";
import { createUser, getAllUser, getAllUserByReferralCode, usrSignIn } from "../Controllers/userController.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);
router.post("/auth/user-sign-in", usrSignIn);
router.get("/getalluser", getAllUser);


router.get("/getalluser/:referalcode", getAllUserByReferralCode);


export default router;