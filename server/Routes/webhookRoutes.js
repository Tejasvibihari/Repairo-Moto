import express from 'express';
import { razorpayWebhook } from '../Controllers/paymentController.js';

const router = express.Router();

/**
 * @route   POST /api/webhooks/razorpay
 * @desc    Razorpay webhook endpoint for payment.captured events.
 *          Verifies signature, updates order, creates Invoice, sends notifications.
 * @access  Public (verified via Razorpay webhook signature)
 */
router.post('/razorpay', razorpayWebhook);

export default router;
