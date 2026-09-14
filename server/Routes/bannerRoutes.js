import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import { bannerUpload } from "../Middleware/bannerMulter.js";
import {
    createBanner,
    getAllBanners,
    getActiveBanners,
    updateBanner,
    reorderBanners,
    deleteBanner,
} from "../Controllers/bannerController.js";

const router = express.Router();

// Public — used by the mobile app to fetch the banners to display (max 5, admin order)
router.get("/active", getActiveBanners);

// Admin — manage banners
router.get("/", authAdmin, getAllBanners);
router.post("/", authAdmin, bannerUpload.single("image"), createBanner);
router.patch("/reorder", authAdmin, reorderBanners);
router.patch("/:id", authAdmin, bannerUpload.single("image"), updateBanner);
router.delete("/:id", authAdmin, deleteBanner);

export default router;