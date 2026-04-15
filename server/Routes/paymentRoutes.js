import express from 'express';
import {
    createRazorpayOrder,
    verifyPaymentAndGenerateInvoice,
    razorpayWebhook,
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
 *          Returns the Razorpay order ID so the client can open the checkout.
 * @access  Private (requires authUser)
 * @param   id - Order _id
 * @returns { success, razorpayOrderId, amount, currency }
 */
router.post('/:id/create-razorpay-order', authUser, createRazorpayOrder);

/**
 * @route   POST /api/orders/:id/verify-payment
 * @desc    Verify Razorpay payment signature, update order payment status to 'paid',
 *          create an Invoice document, and send notifications to admin + mechanic.
 * @access  Private (requires authUser)
 * @param   id - Order _id
 * @body    { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns { success, message, orderId, paymentStatus, invoiceNumber, invoiceId }
 */
router.post('/:id/verify-payment', authUser, verifyPaymentAndGenerateInvoice);

/**
 * @route   GET /api/orders/:id/invoice
 * @desc    Fetch the invoice associated with a given order.
 * @access  Private (requires authUser)
 * @param   id - Order _id
 * @returns { success, invoice }
 */
router.get('/:id/invoice', authUser, getInvoiceByOrder);

export default router;
