import express from "express";
import { createManualOrder, getAllBookings, getOrderById } from "../Controllers/orderController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

router.post("/manualorder", createManualOrder);
router.get("/getallorder", authAdmin, getAllBookings);
router.get("/getorderbyid/:id", authAdmin, getOrderById);

export default router;