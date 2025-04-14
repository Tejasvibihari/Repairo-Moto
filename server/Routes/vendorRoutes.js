import express from "express";
import { addVendor, deleteVendor, getAllVendor, updateVendorById } from "../Controllers/vendorController.js";
import { vendorUpload } from "../Middleware/vendorMulter.js";
import authAdmin from "../Middleware/authAdmin.js";


const router = express.Router();

router.post("/addvendor", authAdmin, vendorUpload.single('profileImage'), addVendor);
router.get("/getallvendor", authAdmin, getAllVendor);
router.delete("/deletevendor/:id", authAdmin, deleteVendor);
router.put("/updatevendor/:id", authAdmin, vendorUpload.single('profileImage'), updateVendorById);
export default router;