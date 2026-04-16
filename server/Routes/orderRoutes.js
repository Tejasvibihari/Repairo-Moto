import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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
    // ── New flow ──
    confirmMechanicArrival,
    requestWorkStart,
    verifyWorkStart,
    markWorkComplete,
    confirmWorkCompletion,
    resendWorkStartOtp,
    resendCompletionOtp,
    markPaidCod,
} from "../Controllers/orderController.js";
import authAdmin from "../Middleware/authAdmin.js";
import authUser from "../Middleware/authUser.js";

// ─── Multer: photo upload config ──────────────────────────────────────────────
// Photos are stored under  /uploads/orders/<orderId>/  at the server level.
// The orderId is embedded in the form field "orderId" that the client must send
// alongside the file so the storage engine can build the folder path.
// After 7 days (tracked via Order.photosScheduledDeleteAt) a cron job removes them.

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // req.params.id is the order _id; we create a per-order subdirectory
        const dir = path.join('uploads', 'orders', req.params.id);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname; // "beforePhoto" or "afterPhoto"
        cb(null, `${prefix}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed.'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per photo
});

const router = express.Router();

// -------------------------------------------------------------------
// ORDER CREATION ROUTES
// -------------------------------------------------------------------

/**
 * @route   POST /manualorder
 * @desc    Create a new service booking manually (by admin/staff).
 * @access  Public / Admin
 */
router.post("/manualorder", createManualOrder);

/**
 * @route   POST /userorder
 * @desc    Create a new booking for an authenticated user.
 * @access  Private (authUser)
 */
router.post("/userorder", authUser, userOrder);

// -------------------------------------------------------------------
// ORDER RETRIEVAL ROUTES
// -------------------------------------------------------------------

/**
 * @route   GET /getallorder
 * @desc    Fetch all orders with filtering, searching, sorting & pagination.
 */
router.get("/getallorder", getAllBookings);

/**
 * @route   GET /getorderbyid/:id
 * @desc    Get a single order by its MongoDB _id.
 */
router.get("/getorderbyid/:id", getOrderById);

/**
 * @route   GET /all
 * @desc    Get all orders for the authenticated user.
 * @access  Private (authUser)
 */
router.get('/all', authUser, getOrderByUserId);

// -------------------------------------------------------------------
// MECHANIC FLOW ROUTES  (new)
// -------------------------------------------------------------------

/**
 * @route   PUT /:id/mechanic-arrived
 * @desc    Mechanic confirms arrival at the customer's location.
 *          Status: Mechanic Assigned → Mechanic Arrived
 * @access  Employee (mechanic)
 */
router.put('/:id/mechanic-arrived', confirmMechanicArrival);

/**
 * @route   POST /:id/request-work-start
 * @desc    Mechanic requests to start work. Sends a 4-digit OTP to the customer
 *          via push notification. Status must be "Mechanic Arrived".
 * @access  Employee (mechanic)
 */
router.post('/:id/request-work-start', requestWorkStart);

/**
 * @route   POST /:id/verify-work-start
 * @desc    Mechanic submits the customer-provided OTP + uploads a before-repair photo.
 *          On success: status → In Progress.
 * @access  Employee (mechanic)
 * @body    { otp: string }
 * @files   beforePhoto (multipart, image)
 */
router.post('/:id/verify-work-start', upload.single('beforePhoto'), verifyWorkStart);

/**
 * @route   POST /:id/complete-work
 * @desc    Mechanic marks the job as done and uploads an after-repair photo.
 *          A completion OTP is sent to the customer.
 *          Status: In Progress → Work Completed
 * @access  Employee (mechanic)
 * @files   afterPhoto (multipart, image)
 */
router.post('/:id/complete-work', upload.single('afterPhoto'), markWorkComplete);

/**
 * @route   POST /:id/confirm-completion
 * @desc    Customer confirms work completion by submitting the OTP received.
 *          Status: Work Completed → Completed
 * @access  Private (authUser)
 * @body    { otp: string }
 */
router.post('/:id/confirm-completion', authUser, confirmWorkCompletion);

/**
 * @route   POST /:id/resend-work-start-otp
 * @desc    Resend (regenerate) the work-start OTP if it expired or wasn't received.
 * @access  Employee (mechanic)
 */
router.post('/:id/resend-work-start-otp', resendWorkStartOtp);

/**
 * @route   POST /:id/resend-completion-otp
 * @desc    Resend (regenerate) the completion OTP if it expired or wasn't received.
 * @access  Employee (mechanic)
 */
router.post('/:id/resend-completion-otp', resendCompletionOtp);

// -------------------------------------------------------------------
// COD PAYMENT ROUTE  (new)
// -------------------------------------------------------------------

/**
 * @route   POST /:id/mark-paid-cod
 * @desc    Mark an order as paid via Cash on Delivery.
 *          - Clears coupon and referral discount (COD cannot use either).
 *          - Creates a real Invoice document (status: paid).
 *          - Schedules photo deletion 7 days from now.
 * @access  Admin / Employee (mechanic)
 * @body    { amountCollected: number }
 */
router.post('/:id/mark-paid-cod', markPaidCod);

// -------------------------------------------------------------------
// ORDER ASSIGNMENT & STATUS UPDATE ROUTES (ADMIN ACTIONS)
// -------------------------------------------------------------------

/**
 * @route   PUT /update/updateMechanic/:id
 * @desc    Assign mechanic(s) to an order.
 * @access  Admin
 */
router.put("/update/updateMechanic/:id", authAdmin, updateMechanic);

/**
 * @route   PUT /updateDelivery/:id
 * @desc    Assign a delivery person to an order.
 */
router.put("/updateDelivery/:id", updateDelivery);

/**
 * @route   PUT /updateVendor/:id
 * @desc    Assign a vendor (parts supplier) to an order.
 */
router.put("/updateVendor/:id", updateVendor);

/**
 * @route   PUT /updateStatus/:id
 * @desc    Directly update order status (limited — restricted statuses blocked).
 */
router.put("/updateStatus/:id", updateOrderStatus);

// -------------------------------------------------------------------
// EMPLOYEE / VENDOR SPECIFIC ORDER ROUTES
// -------------------------------------------------------------------

router.get("/getorder/:employeeId", getAllBookingsByEmployee);
router.get("/vendor/:vendorId", getAllBookingsByVendor);
router.get("/employee/getorderbyid/:id", getOrderById);

// -------------------------------------------------------------------
// ORDER PARTS & INVOICE ROUTES
// -------------------------------------------------------------------

/**
 * @route   PUT /bookings/:id/update-parts
 * @desc    Update parts & services on an order (no pricing).
 */
router.put('/bookings/:id/update-parts', updateItems);

/**
 * @route   PUT /bookings/:id/update-parts-price
 * @desc    Update parts pricing and create/update a VendorOrder document.
 */
router.put('/bookings/:id/update-parts-price', updatePartsPrice);

/**
 * @route   PUT /:id/update-order/generate-invoice
 * @desc    Finalise parts & services, calculate totals, set status to "Invoice Generated".
 *          Order must be in "Completed" status.
 *          This is the "show the bill" step — payment is NOT taken here.
 */
router.put('/:id/update-order/generate-invoice', updateOrderandGenerateInvoice);

// -------------------------------------------------------------------
// CANCELLATION
// -------------------------------------------------------------------

/**
 * @route   PUT /cancel/:id
 * @desc    Cancel an order. Not allowed once work is in progress or beyond.
 */
router.put('/cancel/:id', cancelOrder);

// -------------------------------------------------------------------
// ROLE-BASED ORDER FETCH (employee app)
// -------------------------------------------------------------------

/**
 * @route   GET /by-position
 * @desc    Fetch orders by employee position (mechanic | delivery).
 * @query   position, employeeId
 */
router.get('/by-position', getOrdersByPosition);

// -------------------------------------------------------------------
// ANALYTICS / DASHBOARD ROUTES
// -------------------------------------------------------------------

router.get('/orderstatus/completed-orders', completedOrders);
router.get('/orderstatus/revenue', completeRevenue);

export default router;