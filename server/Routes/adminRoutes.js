import express from "express";
import { adminSignIn, adminSignUp, signOut } from "../Controllers/adminController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();
console.log("Admin Routes Loaded");
// Admin Routes
router.post("/adminsignup", adminSignUp);
router.post("/adminsignin", adminSignIn);
router.post("/signout", signOut);


export default router;