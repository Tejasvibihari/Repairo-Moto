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

const processReferralCredit = async (userId) => {
    const orderUser = await User.findById(userId);
    if (!orderUser?.referredBy) return;

    const referrer = await User.findOne({ referralCode: orderUser.referredBy });
    if (!referrer) return;

    await User.findByIdAndUpdate(referrer._id, {
        $inc: {
            referralAmount: REFERRAL_BONUS_AMOUNT,
            referralCount: 1,
        },
    });
};

const generateInvoiceNumber = async () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const prefix = `INV-${dd}${mm}${yy}`;

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
 * Build the invoice document from an order + resolved payment info.
 *
 * @param {Object} order            - Mongoose order document (lean or hydrated)
 * @param {Object} paymentInfo
 * @param {string|null} paymentInfo.razorpayPaymentId
 * @param {string|null} paymentInfo.razorpayOrderId
 * @param {number} paymentInfo.amountPaid        - actual INR collected via Razorpay
 * @param {number} paymentInfo.referralApplied   - wallet amount deducted this transaction
 */
const createInvoiceFromOrder = async (order, paymentInfo) => {
    const invoiceNumber = await generateInvoiceNumber();

    const {
        razorpayPaymentId = null,
        razorpayOrderId = null,
        amountPaid = 0,
        referralApplied = 0,
    } = paymentInfo;

    // ── Resolve per-item discounts ────────────────────────────────────────────
    // These are discounts the admin set per service / part at invoice-generation time.
    // We surface them verbatim from the order so the invoice reflects them faithfully.
    const partsUsed = (order.partsUsed || []).map(p => ({
        partName: p.partName,
        quantity: p.quantity,
        price: p.price,
        // discountPrice: price after per-item discount (0 = no discount)
        discountPrice: p.discountPrice ?? 0,
        discountType: p.discountType ?? '',
        // Effective line total for transparency
        effectivePrice: (p.discountPrice > 0 && p.discountPrice < p.price)
            ? p.discountPrice
            : p.price,
    }));

    const serviceProvided = (order.serviceProvided || []).map(s => ({
        serviceName: s.serviceName,
        quantity: s.quantity,
        price: s.price,
        discountPrice: s.discountPrice ?? 0,
        effectivePrice: (s.discountPrice > 0 && s.discountPrice < s.price)
            ? s.discountPrice
            : s.price,
    }));

    // ── Bill-level referral discount (applied by admin at invoice-gen time) ───
    // This already lives in order.total.referralDiscount after the admin generates
    // the invoice. It is separate from the wallet deduction below.
    const billReferralDiscount = order.total?.referralDiscount ?? 0;

    // ── Wallet deduction this transaction ─────────────────────────────────────
    // referralApplied is the amount deducted from the user's referralAmount wallet
    // during THIS payment flow. We store it distinctly so the invoice can show
    // both "admin referral discount on bill" and "wallet amount used at checkout".
    const walletAmountUsed = referralApplied;

    // ── Final payable after everything ────────────────────────────────────────
    // amountPaid = what Razorpay actually charged (already reduced by wallet).
    // totalAmountPaid = Razorpay charge + wallet used = full settled amount.
    const totalAmountPaid = amountPaid + walletAmountUsed;
    let businessDetails = null;
    if (order.gstInvoice?.requested) {
        const bd = order.gstInvoice.businessDetails || {};
        const requiredFields = ['gstin', 'businessName', 'businessAddress', 'businessCity', 'businessState', 'businessPincode'];
        const missing = requiredFields.filter(f => !bd[f]);
        if (missing.length > 0) {
            throw new Error(`GST invoice requested but missing business details: ${missing.join(', ')}`);
        }
        businessDetails = { ...bd };
    }
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
        businessDetails,
        vehicleDetails: {
            brand: order.selectedBrand,
            model: order.selectedModel,
            modelName: order.modelName,
            cc: order.cc,
            bs: order.bs,
        },

        partsUsed,
        serviceProvided,

        total: {
            subTotal: order.total?.subTotal ?? 0,

            // Admin-set bill discount (coupon / flat)
            discount: order.total?.discount ?? 0,
            discountType: order.total?.discountType ?? '',

            // Admin referral discount applied at invoice-generation time
            referralDiscount: billReferralDiscount,

            // Wallet balance used at checkout by the customer
            walletAmountUsed,

            sgst: order.total?.sgst ?? 0,
            cgst: order.total?.cgst ?? 0,
            sgstRate: order.total?.sgstRate ?? 0,
            cgstRate: order.total?.cgstRate ?? 0,
            baseAmount: order.total?.baseAmount ?? 0,

            // Pre-wallet total (after admin discounts + taxes)
            total: order.total?.total ?? 0,

            // Post-wallet payable (= total - walletAmountUsed)
            finalPayable: order.total?.finalPayable ?? 0,

            // Actual settled amount = amountPaid (Razorpay) + walletAmountUsed
            totalAmountPaid,
        },

        paymentDetails: {
            method: razorpayPaymentId ? 'razorpay' : 'referral',
            razorpayPaymentId,
            razorpayOrderId,
            // amountPaid = only the Razorpay portion (0 if fully wallet-covered)
            amountPaid,
            // walletAmountUsed = wallet portion
            walletAmountUsed,
            // totalSettled = sum of both
            totalSettled: totalAmountPaid,
            paymentDate: new Date(),
        },

        status: 'paid',
    });
};

const sendPaymentNotifications = async (order, invoice) => {
    const totalSettled = invoice.paymentDetails.totalSettled ?? invoice.paymentDetails.amountPaid;
    const invoiceNumber = invoice.invoiceNumber;
    const orderId = order._id;
    const orderNumber = order.orderId;

    const notificationData = {
        orderId: orderId.toString(),
        screenOrderId: orderNumber,
        invoiceId: invoice._id.toString(),
        invoiceNumber,
        amountPaid: totalSettled,
    };

    const adminRecipients = await getAdminRecipients();
    if (adminRecipients.length) {
        await createNotification({
            type: 'payment_received',
            title: '💰 Payment Received',
            body: `₹${totalSettled} received for order #${orderNumber}. Invoice #${invoiceNumber} generated.`,
            recipients: adminRecipients,
            orderId,
            data: notificationData,
        });
    }

    if (order.mechanicIds?.length) {
        for (const mechanicId of order.mechanicIds) {
            const mechanicRecipients = getEmployeeRecipient(mechanicId, 'mechanic');
            await createNotification({
                type: 'payment_received',
                title: '💰 Payment Confirmed',
                body: `Customer paid ₹${totalSettled} for order #${orderNumber}. Invoice #${invoiceNumber} generated.`,
                recipients: mechanicRecipients,
                orderId,
                data: notificationData,
            });
        }
    }

    if (order.userId) {
        const userRecipients = getUserRecipient(order.userId);
        await createNotification({
            type: 'payment_received',
            title: '✅ Payment Successful',
            body: `Your payment of ₹${totalSettled} for order #${orderNumber} is confirmed. Invoice #${invoiceNumber} generated.`,
            recipients: userRecipients,
            orderId,
            data: notificationData,
        });
    }
};

// ────────────────────────────────────────────────────────────────────────────────
// CREATE RAZORPAY ORDER – ALWAYS FRESH (NO REUSE)
// ────────────────────────────────────────────────────────────────────────────────
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
            return res.status(400).json({
                success: false,
                message: 'This order has already been paid.',
            });
        }

        const originalPayable =
            order.razorpay?.pendingOriginalPayable > 0
                ? order.razorpay.pendingOriginalPayable
                : (order.total?.finalPayable || order.total?.total || 0);

        let referralToApply = 0;
        if (useReferralBalance && order.userId) {
            const user = await User.findById(order.userId);
            if (user?.referralAmount > 0) {
                referralToApply = Math.min(user.referralAmount, originalPayable);
            }
        }

        const payableAfterReferral = Math.max(0, originalPayable - referralToApply);

        // ── Full referral cover (no card payment needed) ──────────────────────
        if (payableAfterReferral <= 0 && referralToApply > 0) {
            const updatedUser = await User.findByIdAndUpdate(
                order.userId,
                { $inc: { referralAmount: -referralToApply } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(500).json({ success: false, message: 'Failed to apply referral balance.' });
            }

            // Update order totals to reflect wallet deduction
            order.total.referralDiscount = (order.total?.referralDiscount || 0);
            order.total.walletAmountUsed = referralToApply;
            order.total.finalPayable = 0;
            order.paymentStatus = 'paid';
            order.status = 'Completed';
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
                referralApplied: referralToApply,
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

        // ── Partial or full Razorpay payment ─────────────────────────────────
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

        order.razorpay = {
            ...order.razorpay,
            orderId: rzpOrder.id,
            status: 'created',
            receiptId: rzpOrder.receipt,
            linkCreatedAt: new Date(),
            hadFailedAttempt: false,
            pendingReferralToApply: referralToApply,
            pendingOriginalPayable: originalPayable,
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

// ────────────────────────────────────────────────────────────────────────────────
// VERIFY PAYMENT + GENERATE INVOICE
// ────────────────────────────────────────────────────────────────────────────────
export const verifyPaymentAndGenerateInvoice = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const orderId = req.params.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing required payment fields.' });
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
        await Order.findByIdAndUpdate(orderId, { 'razorpay.hadFailedAttempt': true });
        return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                paymentStatus: { $ne: 'paid' },
            },
            {
                $set: {
                    status: 'Completed',
                    paymentStatus: 'paid',
                    paymentMethod: 'razorpay',
                    paymentDate: new Date(),
                    photosScheduledDeleteAt: new Date(Date.now() + PHOTO_DELETE_DELAY_MS),
                    'razorpay.paymentId': razorpay_payment_id,
                    'razorpay.signature': razorpay_signature,
                    'razorpay.status': 'paid',
                    'razorpay.hadFailedAttempt': false,
                },
            },
            { new: true }
        );

        // Already paid — return existing invoice
        if (!order) {
            const existingInvoice = await Invoice.findOne({ orderId }).lean();
            return res.status(200).json({
                success: true,
                message: 'Payment already processed.',
                invoiceNumber: existingInvoice?.invoiceNumber ?? null,
            });
        }

        // ── Resolve referral wallet deduction ─────────────────────────────────
        const referralToApply = order.razorpay?.pendingReferralToApply || 0;
        const originalPayable = order.razorpay?.pendingOriginalPayable || order.total?.finalPayable || 0;

        // amountPaid via Razorpay = originalPayable - referralToApply
        const razorpayAmountPaid = Math.max(0, originalPayable - referralToApply);

        let finalReferralApplied = 0;

        if (referralToApply > 0 && order.userId) {
            const updatedUser = await User.findOneAndUpdate(
                {
                    _id: order.userId,
                    referralAmount: { $gte: referralToApply },
                },
                { $inc: { referralAmount: -referralToApply } },
                { new: true }
            );

            if (updatedUser) {
                finalReferralApplied = referralToApply;
                // Update order to reflect wallet usage
                await Order.findByIdAndUpdate(orderId, {
                    $set: {
                        'total.walletAmountUsed': referralToApply,
                        'total.finalPayable': razorpayAmountPaid,
                        amountPaid: razorpayAmountPaid,
                        balanceDue: 0,
                        'razorpay.pendingReferralToApply': 0,
                    },
                });
            } else {
                // Referral balance was insufficient — charge full amount
                await Order.findByIdAndUpdate(orderId, {
                    $set: {
                        amountPaid: originalPayable,
                        balanceDue: 0,
                        'razorpay.pendingReferralToApply': 0,
                    },
                });
            }
        } else {
            await Order.findByIdAndUpdate(orderId, {
                $set: {
                    amountPaid: originalPayable,
                    balanceDue: 0,
                    'razorpay.pendingReferralToApply': 0,
                },
            });
        }

        // ── Referral credit for the order placer ──────────────────────────────
        if (!order.referralProcessed && order.userId) {
            await processReferralCredit(order.userId);
            await Order.findByIdAndUpdate(orderId, { $set: { referralProcessed: true } });
        }

        // ── Fetch final order state for invoice ───────────────────────────────
        const finalOrder = await Order.findById(orderId).lean();

        const invoice = await createInvoiceFromOrder(finalOrder, {
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amountPaid: razorpayAmountPaid,
            referralApplied: finalReferralApplied,
        });

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

// ────────────────────────────────────────────────────────────────────────────────
// WEBHOOK
// ────────────────────────────────────────────────────────────────────────────────
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
        const order = await Order.findOneAndUpdate(
            {
                'razorpay.orderId': razorpayOrderId,
                paymentStatus: { $ne: 'paid' },
            },
            {
                $set: {
                    status: 'Completed',
                    paymentStatus: 'paid',
                    paymentMethod: 'razorpay',
                    paymentDate: new Date(),
                    photosScheduledDeleteAt: new Date(Date.now() + PHOTO_DELETE_DELAY_MS),
                    'razorpay.paymentId': razorpayPaymentId,
                    'razorpay.status': 'paid',
                    'razorpay.webhookPayload': payload,
                    'razorpay.hadFailedAttempt': false,
                },
            },
            { new: true }
        );

        if (!order) {
            console.log(`Webhook: order for rzpOrderId ${razorpayOrderId} already paid. Skipping.`);
            return res.status(200).send('Already processed.');
        }

        const referralToApply = order.razorpay?.pendingReferralToApply || 0;
        const originalPayable =
            order.razorpay?.pendingOriginalPayable ||
            order.total?.finalPayable ||
            (amountPaise / 100);

        const razorpayAmountPaid = Math.max(0, originalPayable - referralToApply);
        let finalReferralApplied = 0;

        if (referralToApply > 0 && order.userId) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: order.userId, referralAmount: { $gte: referralToApply } },
                { $inc: { referralAmount: -referralToApply } },
                { new: true }
            );

            if (updatedUser) {
                finalReferralApplied = referralToApply;
                await Order.findByIdAndUpdate(order._id, {
                    $set: {
                        'total.walletAmountUsed': referralToApply,
                        'total.finalPayable': razorpayAmountPaid,
                        amountPaid: razorpayAmountPaid,
                        balanceDue: 0,
                        'razorpay.pendingReferralToApply': 0,
                    },
                });
            } else {
                await Order.findByIdAndUpdate(order._id, {
                    $set: {
                        amountPaid: originalPayable,
                        balanceDue: 0,
                        'razorpay.pendingReferralToApply': 0,
                    },
                });
            }
        } else {
            await Order.findByIdAndUpdate(order._id, {
                $set: {
                    amountPaid: originalPayable,
                    balanceDue: 0,
                    'razorpay.pendingReferralToApply': 0,
                },
            });
        }

        if (!order.referralProcessed && order.userId) {
            await processReferralCredit(order.userId);
            await Order.findByIdAndUpdate(order._id, { $set: { referralProcessed: true } });
        }

        const finalOrder = await Order.findById(order._id).lean();

        const invoice = await createInvoiceFromOrder(finalOrder, {
            razorpayPaymentId,
            razorpayOrderId,
            amountPaid: razorpayAmountPaid,
            referralApplied: finalReferralApplied,
        });

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

// ────────────────────────────────────────────────────────────────────────────────
// GET INVOICE
// ────────────────────────────────────────────────────────────────────────────────
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