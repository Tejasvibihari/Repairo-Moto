import express from "express";
import { addBrand, addModel, getBrands, getModels } from "../Controllers/brandController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

router.post("/addbrand", authAdmin, addBrand);
router.get("/getbrands", getBrands);
router.post("/addmodel", authAdmin, addModel);
router.get("/getmodels", getModels); // Assuming you want to get models under a brand
export default router