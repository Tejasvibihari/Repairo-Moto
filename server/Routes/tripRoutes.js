import express from "express";
import { authenticateEmployee } from "../Middleware/employeeAuth.js";
import {
    arriveMyTrip,
    getMyActiveTrip,
    getMyTripSummary,
    hubArrivedMyTrip,
    returnMyTrip,
    startMyTrip,
} from "../Controllers/tripController.js";

// Mounted at /api/employee/trips — mechanics + delivery partners
const router = express.Router();

router.get("/active", authenticateEmployee, getMyActiveTrip);
router.get("/my-summary", authenticateEmployee, getMyTripSummary);
router.post("/start", authenticateEmployee, startMyTrip);
router.post("/:id/arrive", authenticateEmployee, arriveMyTrip);
router.post("/:id/return", authenticateEmployee, returnMyTrip);
router.post("/:id/hub-arrived", authenticateEmployee, hubArrivedMyTrip);

export default router;
