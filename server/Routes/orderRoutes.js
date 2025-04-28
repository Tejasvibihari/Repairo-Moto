import express from "express";
import { createManualOrder, getAllBookings, getAllBookingsByEmployee, getAllBookingsByVendor, getOrderById, updateDelivery, updateMechanic, updateOrderStatus, updatePartsPrice, updatePartsUsed, updateVendor } from "../Controllers/orderController.js";
import authAdmin from "../Middleware/authAdmin.js";

const router = express.Router();

router.post("/manualorder", createManualOrder);
router.get("/getallorder", authAdmin, getAllBookings);
router.get("/getorderbyid/:id", authAdmin, getOrderById);
router.put("/update/updateMechanic/:id", authAdmin, updateMechanic);
router.put("/updateDelivery/:id", authAdmin, updateDelivery);
router.put("/updateVendor/:id", authAdmin, updateVendor);
router.put("/updateStatus/:id", authAdmin, updateOrderStatus);

router.get("/getorder/:employeeId", getAllBookingsByEmployee);
router.get("/getorder/:vendorId", getAllBookingsByVendor);


router.put('/bookings/:id/update-parts', updatePartsUsed);
router.put('/bookings/:id/update-parts-price', updatePartsPrice);

export default router;