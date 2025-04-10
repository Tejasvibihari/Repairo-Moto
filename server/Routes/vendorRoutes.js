import express from "express";
import { addVendor } from "../Controllers/vendorController.js";
import { vendorUpload } from "../Middleware/vendorMulter.js";


const router = express.Router();

router.post("/addvendor", vendorUpload.single('profileImage'), addVendor);

export default router;