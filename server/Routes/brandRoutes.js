import express from "express";
import { addBrand, addModel, getBrands, getModels } from "../Controllers/brandController.js";

const router = express.Router();

router.post("/addbrand", addBrand);
router.get("/getbrands", getBrands);
router.post("/addmodel", addModel);
router.get("/getmodels", getModels); // Assuming you want to get models under a brand
export default router