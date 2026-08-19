import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import { appContentUpload } from "../Middleware/appContentMulter.js";
import {
    createAppContent,
    deleteAppContent,
    getActiveAppContent,
    getAllAppContent,
    updateAppContent,
} from "../Controllers/appContentController.js";

const router = express.Router();

router.get("/active", getActiveAppContent);
router.get("/", authAdmin, getAllAppContent);
router.post("/", authAdmin, appContentUpload.single("image"), createAppContent);
router.patch("/:id", authAdmin, appContentUpload.single("image"), updateAppContent);
router.delete("/:id", authAdmin, deleteAppContent);

export default router;
