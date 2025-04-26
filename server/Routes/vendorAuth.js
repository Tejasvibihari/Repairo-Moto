import express from "express";
import { vendorSignIn } from "../Controllers/vendorController.js";


const router = express.Router();

router.post("/vendor-sign-in", vendorSignIn);

export default router;