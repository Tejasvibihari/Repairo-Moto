import express from "express";
import { addBrand, addModel, deleteBrand, deleteModel, getBrands, getModels } from "../Controllers/brandController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

router.post("/addbrand", addBrand);
router.get("/getbrands", getBrands);
router.post("/addmodel", addModel);
router.get("/getmodels", getModels); // Assuming you want to get models under a brand


// /api/admin / brands / delete/${brandId}
router.delete('/delete/:brandId', deleteBrand);

// /api/admin/brands/delete/${brandId}/models/${modelId}
router.delete('/delete/:brandId/models/:modelId', deleteModel);
export default router