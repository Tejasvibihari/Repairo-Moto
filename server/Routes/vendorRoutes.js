import express from "express";
import { addVendor, deleteVendor, getAllVendor } from "../Controllers/vendorController.js";
import { vendorUpload } from "../Middleware/vendorMulter.js";


const router = express.Router();

router.post("/addvendor", vendorUpload.single('profileImage'), addVendor);
router.get("/getallvendor", getAllVendor);
router.delete("/deletevendor/:id", deleteVendor);
export default router;