import express from "express";
import { createUser, usrSignIn } from "../Controllers/userController.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);
router.post("/auth/user-sign-in", usrSignIn);

export default router;