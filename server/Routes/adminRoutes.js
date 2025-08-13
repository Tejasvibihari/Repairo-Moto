import express from "express";
import { adminSignIn, adminSignUp, forgotPassword, resetPassword, signOut } from "../Controllers/adminController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();
console.log("Admin Routes Loaded");
// Admin Routes
router.post("/adminsignup", adminSignUp);
router.post("/adminsignin", adminSignIn);
router.post("/signout", signOut);
router.post("/forgotpassword", forgotPassword);
router.post("/reset-password/:userType/:token", resetPassword);


export default router;