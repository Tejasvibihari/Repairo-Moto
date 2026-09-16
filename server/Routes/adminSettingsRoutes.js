import express from "express";
import { getAdminSettings, updateAdminSettings } from "../Controllers/adminSettingsController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

router.get("/", getAdminSettings);              // GET /api/admin-settings (public — invoice screens read company/payment info)
router.put("/", authAdmin, updateAdminSettings); // PUT /api/admin-settings (admin — edit from Console settings screen)

export default router;