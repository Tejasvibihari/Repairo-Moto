import express from "express";

import {
    createLead,
    updateLead,
    getLead,
    getAllLeads,
    deleteLead,
} from "../Controllers/leadController.js";

import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

// Create lead
router.post(
    "/",
    authAdmin,
    createLead
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