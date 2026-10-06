import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import requireAdminRole from "../Middleware/requireAdminRole.js";
import { getStaffDetail, getStaffOverview } from "../Controllers/staffOverviewController.js";

// Mounted at /api/admin/staff-overview — admins only (it contains pay-relevant numbers)
const router = express.Router();

router.get("/", authAdmin, requireAdminRole, getStaffOverview);
router.get("/:employeeId", authAdmin, requireAdminRole, getStaffDetail);

export default router;
