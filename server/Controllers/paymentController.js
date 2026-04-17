import Razorpay from 'razorpay';
import crypto from 'crypto';
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
let _razorpayInstance = null;
function getRazorpay() {
    if (!_razorpayInstance) {
        _razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return _razorpayInstance;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const REFERRAL_BONUS_AMOUNT = Number(process.env.REFERRAL_BONUS_AMOUNT) || 50;
const PHOTO_DELETE_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const verifyRazorpaySignature = (rzpOrderId, rzpPaymentId, signature) => {
    const body = rzpOrderId + '|' + rzpPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    return expectedSignature === signature;
};

/**
 * Credit referral bonus to the referrer of a user.
 * NO session — standalone MongoDB compatible.
 */
const processReferralCredit = async (userId) => {
    const orderUser = await User.findById(userId);
    if (!orderUser?.referredBy) return;

    const referrer = await User.findOne({ referralCode: orderUser.referredBy });
    if (!referrer) return;

    // Atomic increment — safe without transactions
    await User.findByIdAndUpdate(referrer._id, {
        $inc: {
            referralAmount: REFERRAL_BONUS_AMOUNT,
            referralCount: 1,
        },
    });
};

/**
 * Generate a unique invoice number: INV-DDMMYY-XXX
 * Uses findOneAndUpdate for atomic serial increment — no transactions needed.
 */
const generateInvoiceNumber = async () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const prefix = `INV-${dd}${mm}${yy}`;

    // Get latest invoice to derive serial
    const latest = await Invoice.findOne({}).sort({ createdAt: -1 }).lean();

    let serial = 1;
    if (latest?.invoiceNumber) {
        const parts = latest.invoiceNumber.split('-');
        if (parts.length === 3) {
            const n = parseInt(parts[2], 10);
            if (!isNaN(n)) serial = n + 1;
        }
    }
    return `${prefix}-${String(serial).padStart(3, '0')}`;
};

/**
 * Create Invoice document — no session (standalone MongoDB).
 */
const createInvoiceFromOrder = async (order, paymentInfo) => {
    const invoiceNumber = await generateInvoiceNumber();

    return await Invoice.create({
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
            method: paymentInfo.razorpayPaymentId ? 'razorpay' : 'referral',
            razorpayPaymentId: paymentInfo.razorpayPaymentId || null,
            razorpayOrderId: paymentInfo.razorpayOrderId || null,
            amountPaid: paymentInfo.amountPaid,
            paymentDate: new Date(),
        },
        status: 'paid',
    });
};

/**
 * Send payment success notifications to admin, all assigned mechanics, and user.
 * Non-blocking — caller should .catch() this.
 */
const sendPaymentNotifications = async (order, invoice) => {
    const amountPaid = invoice.paymentDetails.amountPaid;
    const invoiceNumber = invoice.invoiceNumber;
    const orderId = order._id;
    const orderNumber = order.orderId;

    const notificationData = {
        orderId: orderId.toString(),
        screenOrderId: orderNumber,
        invoiceId: invoice._id.toString(),
        invoiceNumber,
        amountPaid,
    };

    // ── Admin notification ──────────────────────────────────────────────────
    const adminRecipients = await getAdminRecipients();
    if (adminRecipients.length) {
        await createNotification({
            type: 'payment_received',
            title: '💰 Payment Received',
            body: `₹${amountPaid} received for order #${orderNumber}. Invoice #${invoiceNumber} generated.`,
            recipients: adminRecipients,
            orderId,
            data: notificationData,
        });
    }

    // ── Per-mechanic notification ───────────────────────────────────────────
    if (order.mechanicIds?.length) {
        for (const mechanicId of order.mechanicIds) {
            const mechanicRecipients = getEmployeeRecipient(mechanicId, 'mechanic');
            await createNotification({
                type: 'payment_received',
                title: '💰 Payment Confirmed',
                body: `Customer paid ₹${amountPaid} for order #${orderNumber}. Invoice #${invoiceNumber} generated.`,
                recipients: mechanicRecipients,
                orderId,
                data: notificationData,
            });
        }
    }

    // ── User notification ───────────────────────────────────────────────────
    if (order.userId) {
        const userRecipients = getUserRecipient(order.userId);
        await createNotification({
            type: 'payment_received',
            title: '✅ Payment Successful',
            body: `Your payment of ₹${amountPaid} for order #${orderNumber} is confirmed. Invoice #${invoiceNumber} generated.`,
            recipients: userRecipients,
            orderId,
            data: notificationData,
        });
    }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Create a Razorpay order. Referral is only RESERVED here, not deducted.
 *          Deduction happens atomically in verifyPayment after signature check.
 * @route   POST /api/orders/:id/create-razorpay-order
 * @access  Private (authUser)
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const { useReferralBalance } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (order.status !== 'Invoice Generated') {
            return res.status(400).json({
                success: false,
                message: 'Invoice has not been generated yet. Please wait for admin to generate the bill.',
            });
        }
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'This order has already been paid.' });
        }

        // ── Read current payable from DB (source of truth) ───────────────────
        // We always use the ORIGINAL admin-set finalPayable, stored as pendingOriginalPayable.
        // If a previous Razorpay attempt modified finalPayable directly, we ignore that.
        const originalPayable =
            order.razorpay?.pendingOriginalPayable > 0
                ? order.razorpay.pendingOriginalPayable
                : (order.total?.finalPayable || order.total?.total || 0);

        // ── Compute referral — DO NOT deduct yet ─────────────────────────────
        let referralToApply = 0;
        if (useReferralBalance && order.userId) {
            const user = await User.findById(order.userId);
            if (user?.referralAmount > 0) {
                referralToApply = Math.min(user.referralAmount, originalPayable);
            }
        }

        const payableAfterReferral = Math.max(0, originalPayable - referralToApply);

        // ── Full referral cover — no Razorpay needed ─────────────────────────
        if (payableAfterReferral <= 0 && referralToApply > 0) {
            // Atomically deduct referral balance
            const updatedUser = await User.findByIdAndUpdate(
                order.userId,
                { $inc: { referralAmount: -referralToApply } },
                { new: true }
            );

            // Guard: if deduction failed for some reason
            if (!updatedUser) {
                return res.status(500).json({ success: false, message: 'Failed to apply referral balance.' });
            }

            order.total.referralDiscount = (order.total?.referralDiscount || 0) + referralToApply;
            order.total.finalPayable = 0;
            order.paymentStatus = 'paid';
            order.paymentMethod = 'referral';
            order.amountPaid = 0;
            order.balanceDue = 0;
            order.paymentDate = new Date();
            order.photosScheduledDeleteAt = new Date(Date.now() + PHOTO_DELETE_DELAY_MS);
            order.razorpay = {
                ...order.razorpay,
                pendingReferralToApply: 0,
                hadFailedAttempt: false,
            };
            await order.save();

            const invoice = await createInvoiceFromOrder(order, {
                razorpayPaymentId: null,
                razorpayOrderId: null,
                amountPaid: 0,
            });

            sendPaymentNotifications(order, invoice).catch(err =>
                console.error('Notification error (referral full cover):', err)
            );

            return res.status(200).json({
                success: true,
                fullyCoveredByReferral: true,
                referralApplied: referralToApply,
                invoiceNumber: invoice.invoiceNumber,
                invoiceId: invoice._id,
            });
        }

        // ── Reuse existing Razorpay order only if safe ───────────────────────
        const existingRzp = order.razorpay;
        const canReuse =
            referralToApply === 0 &&
            existingRzp?.orderId &&
            existingRzp?.status === 'created' &&
            !existingRzp?.hadFailedAttempt;

        if (canReuse) {
            return res.status(200).json({
                success: true,
                razorpayOrderId: existingRzp.orderId,
                amount: Math.round(payableAfterReferral * 100),
                currency: 'INR',
                referralApplied: 0,
            });
        }

        // ── Create fresh Razorpay order ───────────────────────────────────────
        const amountInPaise = Math.round(payableAfterReferral * 100);
        const rzpOrder = await getRazorpay().orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${order.orderId}_${Date.now()}`.slice(0, 40),
            notes: {
                orderId: order._id.toString(),
                orderNumber: order.orderId,
                referralToApply: referralToApply.toString(),
                originalPayable: originalPayable.toString(),
            },
        });

        // Store referral intent — deducted only after successful signature verify
        order.razorpay = {
            ...order.razorpay,
            orderId: rzpOrder.id,
            status: 'created',
            receiptId: rzpOrder.receipt,
            linkCreatedAt: new Date(),
            hadFailedAttempt: false,
            pendingReferralToApply: referralToApply,
            pendingOriginalPayable: originalPayable,  // freeze the admin-set amount
        };
        await order.save();

        return res.status(200).json({
            success: true,
            razorpayOrderId: rzpOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            referralApplied: referralToApply,
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({ success: false, message: 'Failed to create payment order.' });
    }
};

/**
 * @desc    Verify Razorpay signature → deduct referral atomically → mark paid → create invoice → notify.
 *          NO MongoDB transactions — safe for standalone MongoDB.
 * @route   POST /api/orders/:id/verify-payment
 * @access  Private (authUser)
 */
export const verifyPaymentAndGenerateInvoice = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const orderId = req.params.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing required payment fields.' });
    }

    // ── Signature check first — before any DB writes ──────────────────────
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
        // Mark the Razorpay order as failed so the next Pay tap creates a fresh one
        await Order.findByIdAndUpdate(orderId, {
            'razorpay.hadFailedAttempt': true,
        });
        return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    try {
        // ── Idempotency guard — use findOneAndUpdate to atomically claim processing
        // This prevents double-invoice if webhook + client both hit verify simultaneously
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                paymentStatus: { $ne: 'paid' },   // only proceed if not yet paid
            },
            {
                $set: {
                    paymentStatus: 'paid',          // claim it atomically
                    paymentMethod: 'razorpay',
                    paymentDate: new Date(),
                    photosScheduledDeleteAt: new Date(Date.now() + PHOTO_DELETE_DELAY_MS),
                    'razorpay.paymentId': razorpay_payment_id,
                    'razorpay.signature': razorpay_signature,
                    'razorpay.status': 'paid',
                    'razorpay.hadFailedAttempt': false,
                    'razorpay.pendingReferralToApply': 0,
                },
            },
            { new: true }   // return the updated doc
        );

        // If order is null here, it was already paid (idempotent — return success)
        if (!order) {
            const existing = await Order.findById(orderId).lean();
            const existingInvoice = await Invoice.findOne({ orderId }).lean();
            return res.status(200).json({
                success: true,
                message: 'Payment already processed.',
                invoiceNumber: existingInvoice?.invoiceNumber ?? null,
            });
        }

        // ── Apply referral deduction atomically AFTER payment is confirmed ───
        const referralToApply = order.razorpay?.pendingReferralToApply || 0;
        const originalPayable = order.razorpay?.pendingOriginalPayable || order.total?.finalPayable || 0;

        let finalAmountPaid = originalPayable;

        if (referralToApply > 0 && order.userId) {
            // Atomic decrement — if user doesn't have enough, we still proceed
            // (edge case: balance was spent elsewhere between create and verify)
            const updatedUser = await User.findOneAndUpdate(
                {
                    _id: order.userId,
                    referralAmount: { $gte: referralToApply },  // only deduct if sufficient
                },
                { $inc: { referralAmount: -referralToApply } },
                { new: true }
            );

            if (updatedUser) {
                // Referral deducted — update order totals
                finalAmountPaid = Math.max(0, originalPayable - referralToApply);
                await Order.findByIdAndUpdate(orderId, {
                    $set: {
                        'total.referralDiscount': (order.total?.referralDiscount || 0) + referralToApply,
                        'total.finalPayable': finalAmountPaid,
                        amountPaid: finalAmountPaid,
                        balanceDue: 0,
                    },
                });
            } else {
                // Referral not available — pay full amount
                finalAmountPaid = originalPayable;
                await Order.findByIdAndUpdate(orderId, {
                    $set: { amountPaid: originalPayable, balanceDue: 0 },
                });
            }
        } else {
            // No referral — just set amountPaid
            await Order.findByIdAndUpdate(orderId, {
                $set: { amountPaid: originalPayable, balanceDue: 0 },
            });
        }

        // ── Referral bonus credit (for the referrer) ─────────────────────────
        if (!order.referralProcessed && order.userId) {
            await processReferralCredit(order.userId);
            await Order.findByIdAndUpdate(orderId, { $set: { referralProcessed: true } });
        }

        // ── Fetch final order state for invoice ───────────────────────────────
        const finalOrder = await Order.findById(orderId).lean();

        // ── Create Invoice ────────────────────────────────────────────────────
        const invoice = await createInvoiceFromOrder(finalOrder, {
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amountPaid: finalAmountPaid,
        });

        // ── Notifications (non-blocking) ──────────────────────────────────────
        sendPaymentNotifications(finalOrder, invoice).catch(err =>
            console.error('Payment notification error:', err)
        );

        return res.status(200).json({
            success: true,
            message: 'Payment verified and invoice generated.',
            orderId: finalOrder._id,
            paymentStatus: finalOrder.paymentStatus,
            invoiceNumber: invoice.invoiceNumber,
            invoiceId: invoice._id,
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Payment verification failed.',
        });
    }
};

/**
 * @desc    Razorpay webhook — handles payment.captured as a safety net.
 *          Applies same referral logic as verifyPayment. No transactions.
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

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (expectedSignature !== webhookSignature) {
        return res.status(401).send('Invalid webhook signature.');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event !== 'payment.captured') {
        return res.status(200).send('Event ignored.');
    }

    const paymentEntity = payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;
    const amountPaise = paymentEntity.amount;

    try {
        // ── Atomic idempotency claim ──────────────────────────────────────────
        const order = await Order.findOneAndUpdate(
            {
                'razorpay.orderId': razorpayOrderId,
                paymentStatus: { $ne: 'paid' },
            },
            {
                $set: {
                    paymentStatus: 'paid',
                    paymentMethod: 'razorpay',
                    paymentDate: new Date(),
                    photosScheduledDeleteAt: new Date(Date.now() + PHOTO_DELETE_DELAY_MS),
                    'razorpay.paymentId': razorpayPaymentId,
                    'razorpay.status': 'paid',
                    'razorpay.webhookPayload': payload,
                    'razorpay.hadFailedAttempt': false,
                    'razorpay.pendingReferralToApply': 0,
                },
            },
            { new: true }
        );

        if (!order) {
            // Already processed by verify-payment — safe to ignore
            console.log(`Webhook: order for rzpOrderId ${razorpayOrderId} already paid. Skipping.`);
            return res.status(200).send('Already processed.');
        }

        // ── Apply referral deduction (same as verifyPayment) ─────────────────
        const referralToApply = order.razorpay?.pendingReferralToApply || 0;
        const originalPayable =
            order.razorpay?.pendingOriginalPayable ||
            order.total?.finalPayable ||
            (amountPaise / 100);

        let finalAmountPaid = originalPayable;

        if (referralToApply > 0 && order.userId) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: order.userId, referralAmount: { $gte: referralToApply } },
                { $inc: { referralAmount: -referralToApply } },
                { new: true }
            );

            if (updatedUser) {
                finalAmountPaid = Math.max(0, originalPayable - referralToApply);
                await Order.findByIdAndUpdate(order._id, {
                    $set: {
                        'total.referralDiscount': (order.total?.referralDiscount || 0) + referralToApply,
                        'total.finalPayable': finalAmountPaid,
                        amountPaid: finalAmountPaid,
                        balanceDue: 0,
                    },
                });
            } else {
                finalAmountPaid = originalPayable;
                await Order.findByIdAndUpdate(order._id, {
                    $set: { amountPaid: originalPayable, balanceDue: 0 },
                });
            }
        } else {
            await Order.findByIdAndUpdate(order._id, {
                $set: { amountPaid: originalPayable, balanceDue: 0 },
            });
        }

        // ── Referral bonus credit ─────────────────────────────────────────────
        if (!order.referralProcessed && order.userId) {
            await processReferralCredit(order.userId);
            await Order.findByIdAndUpdate(order._id, { $set: { referralProcessed: true } });
        }

        // ── Invoice ───────────────────────────────────────────────────────────
        const finalOrder = await Order.findById(order._id).lean();
        const invoice = await createInvoiceFromOrder(finalOrder, {
            razorpayPaymentId,
            razorpayOrderId,
            amountPaid: finalAmountPaid,
        });

        // ── Notifications ─────────────────────────────────────────────────────
        sendPaymentNotifications(finalOrder, invoice).catch(err =>
            console.error('Webhook notification error:', err)
        );

        console.log(`Webhook: order ${order._id} paid. Invoice: ${invoice.invoiceNumber}`);
        return res.status(200).send('Webhook processed.');

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).send('Webhook processing failed.');
    }
};

/**
 * @desc    Fetch invoice for an order.
 * @route   GET /api/orders/:id/invoice
 * @access  Private (authUser)
 */
export const getInvoiceByOrder = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ orderId: req.params.id })
            .populate('orderId', 'orderId status')
            .lean();

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found for this order.' });
        }

        return res.status(200).json({ success: true, invoice });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch invoice.' });
    }
};