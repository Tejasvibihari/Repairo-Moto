import express from "express";
import { addVendor, deleteVendor, getAllVendor, updateVendorById } from "../Controllers/vendorController.js";
import { vendorUpload } from "../Middleware/vendorMulter.js";
import authAdmin from "../Middleware/authAdmin.js";


const router = express.Router();

router.post("/addvendor", vendorUpload.single('profileImage'), addVendor);
router.get("/getallvendor", getAllVendor);
router.delete("/deletevendor/:id", deleteVendor);
router.put("/updatevendor/:id", vendorUpload.single('profileImage'), updateVendorById);

export default router;