import express from "express";
import { signIn, signOut, signUp } from "../Controllers/adminController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();
console.log("Admin Routes Loaded");
// Admin Routes
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);


export default router;