import express from "express";

import {
    createLead,
    updateLead,
    getLead,
    getAllLeads,
    deleteLead,
    getLeadOverview,
} from "../Controllers/leadController.js";

import authAdmin from "../Middleware/authAdmin.js";
import requireAdminRole from "../Middleware/requireAdminRole.js";

const router = express.Router();

// Create lead
router.post(
    "/new",
    authAdmin,
    createLead
);

// Admin overview: per-telecaller lead counts + status breakdown.
// Must stay above "/:id" or "overview" would be treated as an id.
router.get(
    "/overview",
    authAdmin,
    requireAdminRole,
    getLeadOverview
);

// Get all leads
router.get(
    "/",
    authAdmin,
    getAllLeads
);

// Get single lead
router.get(
    "/:id",
    authAdmin,
    getLead
);

// Update lead
router.put(
    "/:id",
    authAdmin,
    updateLead
);

// Delete lead
router.delete(
    "/:id",
    authAdmin,
    deleteLead
);

export default router;