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
    updateItems
} from "../Controllers/orderController.js";
import authAdmin from "../Middleware/authAdmin.js";
import authUser from "../Middleware/authUser.js";

const router = express.Router();

// -------------------------------------------------------------------
// ORDER CREATION ROUTES
// -------------------------------------------------------------------

/**
 * @route   POST /manualorder
 * @desc    Create a new service booking manually (by admin/staff) without requiring user authentication.
 *          Expects customer details, vehicle info, service selections, and preferred date/time.
 *          Generates a unique orderId (ORD-DDMMYY-XXX) and stores the order.
 * @access  Public (consider adding authAdmin if restricted)
 * @body    { name, contactNo, email?, city, selectedBrand, selectedModel, modelName?, cc, bs?,
 *            services[], serviceType?, otherService?, preferredDate, preferredTime, issues?, coupon?,
 *            userLocation?, isWithinServiceArea?, distanceFromCenter? }
 * @returns 201 with created order, or 400/500 on error
 */
router.post("/manualorder", createManualOrder);

/**
 * @route   POST /userorder
 * @desc    Create a new service booking for an authenticated user. Extracts userId from token.
 *          Sends booking confirmation email to the user and creates a notification for admins/mechanics.
 * @access  Private (requires valid user token)
 * @middleware authUser - attaches req.user
 * @body    Similar to manualorder, but userId is taken from token.
 * @returns 201 with created order
 */
router.post("/userorder", authUser, userOrder);

// -------------------------------------------------------------------
// ORDER RETRIEVAL ROUTES (ADMIN/GENERAL)
// -------------------------------------------------------------------

/**
 * @route   GET /getallorder
 * @desc    Fetch all orders with advanced filtering, searching, sorting, and pagination.
 *          Supports query params: page, limit, status, serviceType, assignedMechanic, mechanicId,
 *          assignedVendor, vendorId, assignedDelivery, deliveryId, isWithinServiceArea,
 *          referralProcessed, selectedBrand, selectedModel, city, fromDate, toDate, dateField,
 *          q (search term), sort (field:asc|desc).
 * @access  Public (should likely be restricted to admin)
 * @returns { success, data[], pagination }
 */
router.get("/getallorder", getAllBookings);

/**
 * @route   GET /getorderbyid/:id
 * @desc    Get a single order by its MongoDB _id. Populates userId and mechanicId details.
 * @access  Public/Private (adjust middleware as needed)
 * @param   id - Order _id
 * @returns Order object or 404
 */
router.get("/getorderbyid/:id", getOrderById);

// -------------------------------------------------------------------
// ORDER ASSIGNMENT & STATUS UPDATE ROUTES (ADMIN ACTIONS)
// -------------------------------------------------------------------

/**
 * @route   PUT /update/updateMechanic/:id
 * @desc    Assign a mechanic (employee) to an order. Updates order status to "Mechanic Assigned",
 *          stores mechanic name and ID. Also triggers referral logic if applicable.
 * @access  Admin only (should add authAdmin middleware)
 * @param   id - Order _id
 * @body    { mechanicId } - Employee ID of the mechanic
 */
router.put("/update/updateMechanic/:id", updateMechanic);

/**
 * @route   PUT /updateDelivery/:id
 * @desc    Assign a delivery person (employee) to an order.
 * @access  Admin only
 * @param   id - Order _id
 * @body    { deliveryId } - Employee ID of delivery person
 */
router.put("/updateDelivery/:id", updateDelivery);

/**
 * @route   PUT /updateVendor/:id
 * @desc    Assign a vendor (parts supplier) to an order.
 * @access  Admin only
 * @param   id - Order _id
 * @body    { vendorId } - Vendor ID
 */
router.put("/updateVendor/:id", updateVendor);

/**
 * @route   PUT /updateStatus/:id
 * @desc    Directly update the status field of an order (e.g., "In Progress", "Completed").
 * @access  Admin/Mechanic
 * @param   id - Order _id
 * @body    { status } - New status string
 */
router.put("/updateStatus/:id", updateOrderStatus);

// -------------------------------------------------------------------
// EMPLOYEE/VENDOR SPECIFIC ORDER ROUTES
// -------------------------------------------------------------------

/**
 * @route   GET /getorder/:employeeId
 * @desc    Fetch all orders assigned to a specific employee (as mechanic, delivery, or vendor).
 *          Note: This route conflicts with the vendor route below if not distinguished by path.
 *          Currently both use "/getorder/:id" - consider differentiating (e.g., "/employee/:employeeId").
 * @param   employeeId - Employee ID
 * @returns Array of orders
 */
router.get("/getorder/:employeeId", getAllBookingsByEmployee);

/**
 * @route   GET /getorder/:vendorId
 * @desc    Fetch all orders assigned to a specific vendor.
 *          WARNING: This route pattern is identical to the one above. The order of definition matters;
 *          Express will match the first one. Consider using distinct paths like "/vendor/:vendorId".
 * @param   vendorId - Vendor ID
 * @returns Array of orders
 */
router.get("/getorder/:vendorId", getAllBookingsByVendor);

/**
 * @route   GET /employee/getorderbyid/:id
 * @desc    Get a single order by ID - likely intended for employee portal view.
 *          (Functionally identical to /getorderbyid/:id, but may have different access control)
 * @param   id - Order _id
 */
router.get("/employee/getorderbyid/:id", getOrderById);

// -------------------------------------------------------------------
// ORDER PARTS & INVOICE ROUTES
// -------------------------------------------------------------------

/**
 * @route   PUT /bookings/:id/update-parts
 * @desc    Update/replace the list of parts used in an order (without pricing).
 *          Used when mechanic adds parts to the service.
 * @param   id - Order _id
 * @body    { partsUsed: [{ partName, quantity }] }
 */
router.put('/bookings/:id/update-parts', updateItems);

/**
 * @route   PUT /bookings/:id/update-parts-price
 * @desc    Update parts with pricing and create/update a VendorOrder document.
 *          Calculates subtotal, discount, and total for vendor billing.
 * @param   id - Order _id
 * @body    { partsUsed: [{ partName, quantity, price, discountPrice }], pricing: { subTotal, discountType, discountAmount, total } }
 */
router.put('/bookings/:id/update-parts-price', updatePartsPrice);

/**
 * @route   PUT /:id/update-order/generate-invoice
 * @desc    Finalize order: record parts & services, calculate totals, generate invoice,
 *          apply referral discounts (deduct from user's referral balance), process referral earnings for referee,
 *          and set status to "Invoice Generated".
 * @param   id - Order _id
 * @body    { partsAndServices, total, invoiceDetails }
 * @returns Updated order
 */
router.put('/:id/update-order/generate-invoice', updateOrderandGenerateInvoice);

// -------------------------------------------------------------------
// USER-SPECIFIC ROUTES
// -------------------------------------------------------------------

/**
 * @route   GET /all
 * @desc    Get all orders belonging to the currently authenticated user.
 * @access  Private (requires authUser)
 * @returns { message, orders[] }
 */
router.get('/all', authUser, getOrderByUserId);

/**
 * @route   PUT /cancel/:id
 * @desc    Cancel an order by ID. Only allowed if order is not already completed/invoiced/assigned.
 *          Stores cancellation reason and timestamp.
 * @param   id - Order _id
 * @body    { reason } - optional cancellation reason
 */
router.put('/cancel/:id', cancelOrder);

// -------------------------------------------------------------------
// ROLE-BASED ORDER FETCH (for employee app)
// -------------------------------------------------------------------

/**
 * @route   GET /by-position
 * @desc    Fetch orders assigned to an employee based on their position (mechanic or delivery).
 *          Expects query parameters: position (mechanic|delivery) and employeeId.
 * @access  Employee (should be protected)
 * @query   position, employeeId
 * @returns Array of orders
 */
router.get('/by-position', getOrdersByPosition);

// -------------------------------------------------------------------
// ANALYTICS / DASHBOARD ROUTES
// -------------------------------------------------------------------

/**
 * @route   GET /orderstatus/completed-orders
 * @desc    Get count of completed orders (status "Invoice Generated") grouped by day (if timeFrame=month)
 *          or by month (default, current year). Used for admin dashboard charts.
 * @query   timeFrame - "month" for daily breakdown of current month, otherwise monthly for current year
 * @returns [{ label, count }]
 */
router.get('/orderstatus/completed-orders', completedOrders);

/**
 * @route   GET /orderstatus/revenue
 * @desc    Get total revenue from completed orders grouped by day (timeFrame=month),
 *          by month for last 6 months (timeFrame=last6), or by month for current year (default).
 * @query   timeFrame - "month" | "last6" | otherwise (yearly)
 * @returns [{ label, revenue }]
 */
router.get('/orderstatus/revenue', completeRevenue);

export default router;