import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import { getLiveMechanics } from "../Controllers/mechanicTrackingController.js";

const router = express.Router();

// GET /api/admin/tracking/live
router.get("/live", authAdmin, getLiveMechanics);

export default router;
