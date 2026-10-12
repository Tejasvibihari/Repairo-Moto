import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import requireAdminOrManager from "../Middleware/requireAdminOrManager.js";
import { getStaffDetail, getStaffOverview } from "../Controllers/staffOverviewController.js";

// Mounted at /api/admin/staff-overview — admins and managers can read pay-relevant numbers.
const router = express.Router();

router.get("/", authAdmin, requireAdminOrManager, getStaffOverview);
router.get("/:employeeId", authAdmin, requireAdminOrManager, getStaffDetail);

export default router;
