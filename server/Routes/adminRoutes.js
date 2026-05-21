import express from "express";
import { adminSignIn, adminSignUp, forgotPassword, resetPassword, signOut } from "../Controllers/adminController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

// Admin Routes
router.post("/adminsignup", adminSignUp);
router.post("/adminsignin", adminSignIn);
router.post("/signout", signOut);
router.post("/forgotpassword", forgotPassword);
router.post("/reset-password/:userType/:token", resetPassword);
router.get("/me", authAdmin, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

export default router;