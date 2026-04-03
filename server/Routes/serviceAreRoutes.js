import express from "express";
import {
    createServiceArea,
    checkServiceAvailability,
    getAllServiceAreas,
    toggleServiceArea,
    updateServiceArea
} from "../Controllers/serviceAreaController.js";

const router = express.Router();

// Admin
router.post("/create", createServiceArea);
router.get("/all", getAllServiceAreas);
router.put("/update/:id", updateServiceArea);
router.patch("/toggle/:id", toggleServiceArea);

// User
router.post("/check", checkServiceAvailability);

export default router;