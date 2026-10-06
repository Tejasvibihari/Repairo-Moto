import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import { getLiveMechanics, getTrackableStaff } from "../Controllers/mechanicTrackingController.js";
import { getOrderTrips } from "../Controllers/tripController.js";

const router = express.Router();

// GET /api/admin/tracking/live
router.get("/live", authAdmin, getLiveMechanics);

// GET /api/admin/tracking/staff  (online + offline, with the reason)
router.get("/staff", authAdmin, getTrackableStaff);

// GET /api/admin/tracking/trips/order/:orderId  (distance + route of every trip of an order)
router.get("/trips/order/:orderId", authAdmin, getOrderTrips);

export default router;
