import express from "express";
import { createManualOrder, getAllBookings, getAllBookingsByEmployee, getAllBookingsByVendor, getOrderById, updateDelivery, updateMechanic, updateOrderStatus, updatePartsPrice, updatePartsUsed, updateVendor, updateOrderandGenerateInvoice, userOrder, getOrderByEmail, cancelOrder, getOrdersByPosition } from "../Controllers/orderController.js";
import authAdmin from "../Middleware/authAdmin.js";
import authUser from "../Middleware/authUser.js";



const router = express.Router();

router.post("/manualorder", createManualOrder);
router.post("/userorder", authUser, userOrder);
router.get("/getallorder", getAllBookings);
router.get("/getorderbyid/:id", getOrderById);
router.put("/update/updateMechanic/:id", updateMechanic);
router.put("/updateDelivery/:id", updateDelivery);
router.put("/updateVendor/:id", updateVendor);
router.put("/updateStatus/:id", updateOrderStatus);

router.get("/getorder/:employeeId", getAllBookingsByEmployee);
router.get("/getorder/:vendorId", getAllBookingsByVendor);

router.get("/employee/getorderbyid/:id", getOrderById);

router.put('/bookings/:id/update-parts', updatePartsUsed);
router.put('/bookings/:id/update-parts-price', updatePartsPrice);
router.put('/:id/update-order/generate-invoice', updateOrderandGenerateInvoice);

router.get('/by-email', authUser, getOrderByEmail);
router.put('/cancel/:id', cancelOrder);

router.get('/by-position', getOrdersByPosition);


export default router;