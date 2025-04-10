import express from "express";
import { addVendor, getAllVendor } from "../Controllers/vendorController.js";
import { vendorUpload } from "../Middleware/vendorMulter.js";


const router = express.Router();

router.post("/addvendor", vendorUpload.single('profileImage'), addVendor);
router.get("/getallvendor", getAllVendor);

export default router;