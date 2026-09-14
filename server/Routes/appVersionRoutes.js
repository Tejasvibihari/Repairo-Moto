import express from "express";
import { getAppVersion, upsertAppVersion } from "../Controllers/appVersionController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();
router.get("/", getAppVersion);                 // GET /api/app-version?platform=android
router.post("/", authAdmin, upsertAppVersion);   // admin updates when publishing

export default router;