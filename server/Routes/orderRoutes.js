import express from "express";
import {
    createManualOrder,
    getAllBookings,
    getOrderByUserId,
    getAllBookingsByEmployee,
    getAllBookingsByVendor,
    getOrderById,
    updateDelivery,
    updateMechanic,
    updateOrderStatus,
    updatePartsPrice,
    updateVendor,
    updateOrderandGenerateInvoice,
    userOrder,
    cancelOrder,
    getOrdersByPosition,
    completedOrders,
    completeRevenue,
    updateItems,
    confirmMechanicArrival,
    requestWorkStart,
    verifyWorkStart,
    markWorkComplete,
    confirmWorkCompletion,
    resendWorkStartOtp,
    resendCompletionOtp,
    getInvoice,
    markPaidCod,
} from "../Controllers/orderController.js";
import authAdmin from "../Middleware/authAdmin.js";
import authUser from "../Middleware/authUser.js";
import { uploadSingle } from "../Middleware/photoUpload.js";

const router = express.Router();

// -------------------------------------------------------------------
// ORDER CREATION
// -------------------------------------------------------------------
router.post("/manualorder", createManualOrder);
router.post("/userorder", authUser, userOrder);

// -------------------------------------------------------------------
// ORDER RETRIEVAL
// -------------------------------------------------------------------
router.get("/getallorder", getAllBookings);
router.get("/getorderbyid/:id", getOrderById);
router.get('/all', authUser, getOrderByUserId);

// -------------------------------------------------------------------
// MECHANIC FLOW
// -------------------------------------------------------------------

/**
 * @route   PUT /:id/mechanic-arrived
 * @desc    Mechanic confirms arrival. Status: Mechanic Assigned → Mechanic Arrived
 */
router.put('/:id/mechanic-arrived', confirmMechanicArrival);

/**
 * @route   POST /:id/request-work-start
 * @desc    Mechanic uploads before-photo (stored as temp) + triggers OTP to customer.
 *          Photo is only committed to beforePhotos[] after OTP is verified.
 *          If called again (retry/app restart), any old temp photo is deleted first.
 * @files   beforePhoto (multipart, image)
 */
router.post('/:id/request-work-start', uploadSingle('beforePhoto'), requestWorkStart);

/**
 * @route   POST /:id/verify-work-start
 * @desc    Mechanic submits customer OTP. On success temp photo → beforePhotos[].
 *          Status: Mechanic Arrived → In Progress
 * @body    { otp: string }
 */
router.post('/:id/verify-work-start', verifyWorkStart);

/**
 * @route   POST /:id/complete-work
 * @desc    Mechanic uploads after-photo (stored as temp) + triggers completion OTP.
 *          Photo is only committed to afterPhotos[] after confirmWorkCompletion.
 *          If called again (retry), old temp after-photo is deleted first.
 *          Status: In Progress → Work Completed
 * @files   afterPhoto (multipart, image)
 */
router.post('/:id/complete-work', uploadSingle('afterPhoto'), markWorkComplete);

/**
 * @route   POST /:id/confirm-completion
 * @desc    Customer submits completion OTP. On success temp photo → afterPhotos[].
 *          Status: Work Completed → Completed
 * @body    { otp: string }
 * @access  Private (authUser)
 */
router.post('/:id/confirm-completion', confirmWorkCompletion);

/**
 * @route   POST /:id/resend-work-start-otp
 * @desc    Regenerates work-start OTP. Existing temp before-photo is preserved.
 *          Returns 400 if no pending photo exists (mechanic must re-initiate flow).
 */
router.post('/:id/resend-work-start-otp', resendWorkStartOtp);

/**
 * @route   POST /:id/resend-completion-otp
 * @desc    Regenerates completion OTP. Existing temp after-photo is preserved.
 *          Returns 400 if no pending photo exists (mechanic must re-initiate flow).
 */
router.post('/:id/resend-completion-otp', resendCompletionOtp);

// -------------------------------------------------------------------
// COD PAYMENT
// -------------------------------------------------------------------
router.post('/:id/mark-paid-cod', markPaidCod);

// -------------------------------------------------------------------
// ADMIN ASSIGNMENT & STATUS
// -------------------------------------------------------------------
router.put("/update/updateMechanic/:id", authAdmin, updateMechanic);
router.put("/updateDelivery/:id", updateDelivery);
router.put("/updateVendor/:id", updateVendor);
router.put("/updateStatus/:id", updateOrderStatus);

// -------------------------------------------------------------------
// EMPLOYEE / VENDOR
// -------------------------------------------------------------------
router.get("/getorder/:employeeId", getAllBookingsByEmployee);
router.get("/vendor/:vendorId", getAllBookingsByVendor);
router.get("/employee/getorderbyid/:id", getOrderById);

// -------------------------------------------------------------------
// PARTS & INVOICE
// -------------------------------------------------------------------
router.put('/bookings/:id/update-parts', updateItems);
router.put('/bookings/:id/update-parts-price', updatePartsPrice);
router.put('/:id/update-order/generate-invoice', updateOrderandGenerateInvoice);
router.get('/:id/invoice', getInvoice);

// -------------------------------------------------------------------
// CANCELLATION
// -------------------------------------------------------------------
router.put('/cancel/:id', cancelOrder);

// -------------------------------------------------------------------
// ROLE-BASED ORDER FETCH
// -------------------------------------------------------------------
router.get('/by-position', getOrdersByPosition);

// -------------------------------------------------------------------
// ANALYTICS
// -------------------------------------------------------------------
router.get('/orderstatus/completed-orders', completedOrders);
router.get('/orderstatus/revenue', completeRevenue);

export default router;