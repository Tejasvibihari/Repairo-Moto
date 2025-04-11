import express from "express";
import { createUser } from "../Controllers/userController.js";


const router = express.Router();

router.post("/auth/user-sign-up", createUser);

export default router;