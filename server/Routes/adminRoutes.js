import express from "express";
import { signUp } from "../Controllers/adminController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();
console.log("Admin Routes Loaded");
// Admin Routes
router.post("/signup", signUp);

export default router;