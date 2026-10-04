import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import { getLiveMechanics, getTrackableStaff } from "../Controllers/mechanicTrackingController.js";

const router = express.Router();

// GET /api/admin/tracking/live
router.get("/live", authAdmin, getLiveMechanics);

// GET /api/admin/tracking/staff  (online + offline, with the reason)
router.get("/staff", authAdmin, getTrackableStaff);

export default router;
