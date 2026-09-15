import express from "express";
import {
    getAppVersion,
    upsertAppVersion,
    listAppVersions,
    deleteAppVersion,
} from "../Controllers/appVersionController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

router.get("/", getAppVersion);                    // GET /api/app-version?app=mobile&platform=android (public, called on app launch)
router.get("/all", authAdmin, listAppVersions);     // GET /api/app-version/all (admin dashboard)
router.post("/", authAdmin, upsertAppVersion);      // POST /api/app-version (admin updates when publishing)
router.delete("/:id", authAdmin, deleteAppVersion); // DELETE /api/app-version/:id (admin)

export default router;
