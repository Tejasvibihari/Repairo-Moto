import express from "express";
import { getAdminSettings, updateAdminSettings, getShopStatus, updateShopStatus } from "../Controllers/adminSettingsController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

router.get("/", getAdminSettings);              // GET /api/admin-settings (public — invoice screens read company/payment info)
router.put("/", authAdmin, updateAdminSettings); // PUT /api/admin-settings (admin — edit from Console settings screen)

router.get("/shop-status", getShopStatus);                  // GET /api/admin-settings/shop-status (public — customer app polls this)
router.put("/shop-status", authAdmin, updateShopStatus);    // PUT /api/admin-settings/shop-status (admin — Console "Shop Status" screen)

export default router;