import express from 'express';
import {
    createRazorpayOrder,
    verifyPaymentAndGenerateInvoice,
    getInvoiceByOrder,
} from '../Controllers/paymentController.js';
import authUser from '../Middleware/authUser.js';

const router = express.Router();

// -------------------------------------------------------------------
// RAZORPAY PAYMENT ROUTES
// -------------------------------------------------------------------

/**
 * @route   POST /api/orders/:id/create-razorpay-order
 * @desc    Create a Razorpay order for the given order ID.
 *          Optionally applies referral balance to reduce payable amount.
 *          If referral covers the full amount, invoice is generated immediately.
 *          Do NOT use this for Cash on Delivery — use /api/admin/order/:id/mark-paid-cod.
 * @access  Private (authUser)
 * @body    { useReferralBalance?: boolean }
 * @returns { success, razorpayOrderId, amount, currency, referralApplied }
 */
router.post('/:id/create-razorpay-order', authUser, createRazorpayOrder);

/**
 * @route   POST /api/orders/:id/verify-payment
 * @desc    Verify Razorpay payment signature, update order to paid,
 *          create Invoice document, schedule photo cleanup (7 days), send notifications.
 * @access  Private (authUser)
 * @body    { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns { success, message, orderId, paymentStatus, invoiceNumber, invoiceId }
 */
router.post('/:id/verify-payment', authUser, verifyPaymentAndGenerateInvoice);

/**
 * @route   GET /api/orders/:id/invoice
 * @desc    Fetch the Invoice document associated with a given order.
 *          Returns 404 if no invoice has been generated yet (payment not completed).
 * @access  Private (authUser)
 * @returns { success, invoice }
 */
router.get('/:id/invoice', authUser, getInvoiceByOrder);

export default router;