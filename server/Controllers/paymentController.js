import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../Models/orderModel.js';
import Invoice from '../Models/invoiceModel.js';
import User from '../Models/userModel.js';
import {
    createNotification,
    getAdminRecipients,
    getEmployeeRecipient,
    getUserRecipient,
} from '../services/notificationService.js';

// ─── Razorpay instance ────────────────────────────────────────────────────────
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REFERRAL_BONUS_AMOUNT = Number(process.env.REFERRAL_BONUS_AMOUNT) || 50;

/**
 * Verify Razorpay signature
 */
const verifyRazorpaySignature = (rzpOrderId, rzpPaymentId, signature) => {
    const body = rzpOrderId + '|' + rzpPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    return expectedSignature === signature;
};

/**
 * Process referral credit for the user who placed the order.
 */
const processReferralCredit = async (session, userId) => {
    const orderUser = await User.findById(userId).session(session);
    if (!orderUser || !orderUser.referredBy) return;

    const referrer = await User.findOne({ referralCode: orderUser.referredBy }).session(session);
    if (!referrer) return;

    referrer.referralAmount = (referrer.referralAmount || 0) + REFERRAL_BONUS_AMOUNT;
    referrer.referralCount = (referrer.referralCount || 0) + 1;
    await referrer.save({ session });
};

/**
 * Generate a unique invoice number in the format INV-DDMMYY-XXX
 */
const generateInvoiceNumber = async () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const todayFormatted = `${dd}${mm}${yy}`;

    // Find the latest invoice to get the next serial number
    const latestInvoice = await Invoice.findOne({}).sort({ createdAt: -1 }).lean();
    let serial = 1;
    if (latestInvoice?.invoiceNumber) {
        const parts = latestInvoice.invoiceNumber.split('-');
        if (parts.length === 3) {
            const lastSerial = parseInt(parts[2], 10);
            if (!isNaN(lastSerial)) serial = lastSerial + 1;
        }
    }
    return `INV-${todayFormatted}-${String(serial).padStart(3, '0')}`;
};

/**
 * Create an Invoice document from order data and payment info.
 */
const createInvoiceFromOrder = async (order, paymentInfo, session = null) => {
    const invoiceNumber = await generateInvoiceNumber();

    const invoiceData = {
        invoiceNumber,
        orderId: order._id,
        userId: order.userId || null,
        invoiceDate: new Date(),
        customerDetails: {
            name: order.name,
            email: order.email,
            contactNo: order.contactNo,
            address: order.address,
            city: order.city,
        },
        vehicleDetails: {
            brand: order.selectedBrand,
            model: order.selectedModel,
            modelName: order.modelName,
            cc: order.cc,
            bs: order.bs,
        },
        partsUsed: (order.partsUsed || []).map(p => ({
            partName: p.partName,
            quantity: p.quantity,
            price: p.price,
            discountPrice: p.discountPrice,
            discountType: p.discountType,
        })),
        serviceProvided: (order.serviceProvided || []).map(s => ({
            serviceName: s.serviceName,
            quantity: s.quantity,
            price: s.price,
            discountPrice: s.discountPrice,
        })),
        total: {
            subTotal: order.total?.subTotal || 0,
            discount: order.total?.discount || 0,
            discountType: order.total?.discountType || '',
            referralDiscount: order.total?.referralDiscount || 0,
            sgst: order.total?.sgst || 0,
            cgst: order.total?.cgst || 0,
            sgstRate: order.total?.sgstRate || 0,
            cgstRate: order.total?.cgstRate || 0,
            baseAmount: order.total?.baseAmount || 0,
            total: order.total?.total || 0,
            finalPayable: order.total?.finalPayable || 0,
        },
        paymentDetails: {
            method: 'razorpay',
            razorpayPaymentId: paymentInfo.razorpayPaymentId,
            razorpayOrderId: paymentInfo.razorpayOrderId,
            amountPaid: paymentInfo.amountPaid,
            paymentDate: new Date(),
        },
        status: 'paid',
    };

    if (session) {
        const [invoice] = await Invoice.create([invoiceData], { session });
        return invoice;
    }
    return await Invoice.create(invoiceData);
};

/**
 * Send payment success notifications to admin and assigned mechanic.
 */
const sendPaymentNotifications = async (order, invoice) => {
    // 1. Notify admins
    const adminRecipients = await getAdminRecipients();
    await createNotification({
        type: 'payment_received',
        title: '💰 Payment Received',
        body: `Payment of ₹${invoice.paymentDetails.amountPaid} received for order #${order.orderId}. Invoice #${invoice.invoiceNumber} generated.`,
        recipients: adminRecipients,
        orderId: order._id,
        data: {
            orderId: order._id.toString(),
            screenOrderId: order.orderId,
            invoiceId: invoice._id.toString(),
        },
    });

    // 2. Notify assigned mechanic (if any)
    if (order.mechanicId) {
        const mechanicRecipients = getEmployeeRecipient(order.mechanicId, 'mechanic');
        await createNotification({
            type: 'payment_received',
            title: '💰 Payment Received',
            body: `Customer paid ₹${invoice.paymentDetails.amountPaid} for order #${order.orderId}. Invoice generated.`,
            recipients: mechanicRecipients,
            orderId: order._id,
            data: {
                orderId: order._id.toString(),
                screenOrderId: order.orderId,
                invoiceId: invoice._id.toString(),
            },
            triggeredBy: order.userId
                ? { userId: order.userId, userModel: 'User' }
                : null,
        });
    }

    // 3. Notify the user
    if (order.userId) {
        const userRecipient = getUserRecipient(order.userId);
        await createNotification({
            type: 'payment_received',
            title: '✅ Payment Successful',
            body: `Your payment of ₹${invoice.paymentDetails.amountPaid} for order #${order.orderId} is confirmed. Invoice #${invoice.invoiceNumber} has been generated.`,
            recipients: userRecipient,
            orderId: order._id,
            data: {
                orderId: order._id.toString(),
                screenOrderId: order.orderId,
                invoiceId: invoice._id.toString(),
            },
        });
    }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Create a Razorpay order for client-side payment
 * @route   POST /api/orders/:id/create-razorpay-order
 * @access  Private (authUser)
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Only allow payment for orders that have a bill (Invoice Generated status)
        if (order.status !== 'Invoice Generated') {
            return res.status(400).json({
                success: false,
                message: 'Bill has not been generated yet. Please wait for the admin to generate the bill.',
            });
        }

        // Prevent double-pay
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'This order has already been paid.',
            });
        }

        // If a Razorpay order already exists, return it
        if (order.razorpay?.orderId && order.razorpay?.status !== 'expired') {
            return res.status(200).json({
                success: true,
                razorpayOrderId: order.razorpay.orderId,
                amount: Math.round((order.total?.finalPayable || order.total?.total || 0) * 100),
                currency: 'INR',
            });
        }

        const payableAmount = order.total?.finalPayable || order.total?.total || 0;
        if (payableAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No payable amount found for this order.',
            });
        }

        const amountInPaise = Math.round(payableAmount * 100);

        // Create Razorpay order
        const rzpOrder = await razorpayInstance.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${order.orderId}`,
            notes: {
                orderId: order._id.toString(),
                orderNumber: order.orderId,
            },
        });

        // Save Razorpay order ID on the order
        order.razorpay = {
            ...order.razorpay,
            orderId: rzpOrder.id,
            status: 'created',
            receiptId: rzpOrder.receipt,
            linkCreatedAt: new Date(),
        };
        await order.save();

        return res.status(200).json({
            success: true,
            razorpayOrderId: rzpOrder.id,
            amount: amountInPaise,
            currency: 'INR',
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create payment order.',
        });
    }
};

/**
 * @desc    Verify Razorpay payment, update order, create Invoice, send notifications
 * @route   POST /api/orders/:id/verify-payment
 * @access  Private (authUser)
 */
export const verifyPaymentAndGenerateInvoice = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const orderId = req.params.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing required payment fields.' });
    }

    // 1. Verify signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Find the order
        const order = await Order.findById(orderId).session(session);
        if (!order) {
            throw new Error('Order not found.');
        }

        // Prevent duplicate payment
        if (order.paymentStatus === 'paid') {
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({
                success: true,
                message: 'Payment already processed.',
                orderId: order._id,
            });
        }

        // 3. Update order payment fields
        const payableAmount = order.total?.finalPayable || order.total?.total || 0;
        order.paymentStatus = 'paid';
        order.paymentMethod = 'razorpay';
        order.amountPaid = payableAmount;
        order.balanceDue = 0;
        order.paymentDate = new Date();

        order.razorpay = {
            ...order.razorpay,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'paid',
        };

        // 4. Process referral if not already processed
        if (!order.referralProcessed && order.userId) {
            await processReferralCredit(session, order.userId);
            order.referralProcessed = true;
        }

        await order.save({ session });

        // 5. Create Invoice
        const invoice = await createInvoiceFromOrder(order, {
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amountPaid: payableAmount,
        }, session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // 6. Send notifications (non-blocking — outside transaction)
        sendPaymentNotifications(order, invoice).catch(err =>
            console.error('Failed to send payment notifications:', err)
        );

        return res.status(200).json({
            success: true,
            message: 'Payment verified, invoice generated successfully.',
            orderId: order._id,
            paymentStatus: order.paymentStatus,
            invoiceNumber: invoice.invoiceNumber,
            invoiceId: invoice._id,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Payment verification failed.',
        });
    }
};

/**
 * @desc    Razorpay webhook handler for payment.captured event
 * @route   POST /api/webhooks/razorpay
 * @access  Public (signature-verified)
 */
export const razorpayWebhook = async (req, res) => {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('RAZORPAY_WEBHOOK_SECRET not set');
        return res.status(500).send('Webhook secret not configured.');
    }

    // Verify webhook signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (expectedSignature !== webhookSignature) {
        return res.status(401).send('Invalid signature.');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Only handle payment.captured
    if (event !== 'payment.captured') {
        return res.status(200).send('Event ignored.');
    }

    const paymentEntity = payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;
    const amount = paymentEntity.amount; // in paise

    // Find order by razorpay.orderId
    const order = await Order.findOne({ 'razorpay.orderId': razorpayOrderId });
    if (!order) {
        console.error(`Order not found for Razorpay orderId: ${razorpayOrderId}`);
        return res.status(200).send('Order not found.'); // 200 to acknowledge receipt
    }

    // Prevent duplicate processing
    if (order.paymentStatus === 'paid') {
        return res.status(200).send('Already processed.');
    }

    // Transaction for consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payableAmount = order.total?.finalPayable || order.total?.total || 0;
        const amountInRupees = amount / 100;

        // Log amount mismatch for audit
        if (Math.abs(amountInRupees - payableAmount) > 0.01) {
            console.warn(`Amount mismatch: expected ${payableAmount}, received ${amountInRupees}`);
        }

        order.paymentStatus = 'paid';
        order.paymentMethod = 'razorpay';
        order.amountPaid = payableAmount;
        order.balanceDue = 0;
        order.paymentDate = new Date();

        order.razorpay = {
            ...order.razorpay,
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            status: 'paid',
            webhookPayload: payload,
        };

        if (!order.referralProcessed && order.userId) {
            await processReferralCredit(session, order.userId);
            order.referralProcessed = true;
        }

        await order.save({ session });

        // Create Invoice
        const invoice = await createInvoiceFromOrder(order, {
            razorpayPaymentId,
            razorpayOrderId,
            amountPaid: payableAmount,
        }, session);

        await session.commitTransaction();
        session.endSession();

        // Send notifications (non-blocking)
        sendPaymentNotifications(order, invoice).catch(err =>
            console.error('Webhook notification error:', err)
        );

        console.log(`Order ${order._id} payment confirmed via webhook. Invoice: ${invoice.invoiceNumber}`);
        return res.status(200).send('Webhook processed successfully.');
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Webhook processing error:', error);
        return res.status(500).send('Webhook processing failed.');
    }
};

/**
 * @desc    Get invoice for an order
 * @route   GET /api/orders/:id/invoice
 * @access  Private
 */
export const getInvoiceByOrder = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ orderId: req.params.id })
            .populate('orderId', 'orderId status')
            .lean();

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found for this order.',
            });
        }

        return res.status(200).json({
            success: true,
            invoice,
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice.',
        });
    }
};
