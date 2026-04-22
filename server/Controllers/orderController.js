import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import Vendor from '../Models/vendorModel.js';
import VendorOrder from "../Models/vendorOrderModel.js";
import { sendBookingConfirmationEmail } from "../Utils/mailer.js";
import User from "../Models/userModel.js";
import Invoice from "../Models/invoiceModel.js";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
    createNotification,
    getAdminRecipients,
    getEmployeeRecipient,
    getUserRecipient,
} from "../services/notificationService.js";
import mongoose from "mongoose";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const deleteUploadedFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) { }
    }
};

/**
 * Generate a cryptographically random 4-digit OTP string (0000–9999).
 */
const generateOtp = () => String(crypto.randomInt(1000, 9999));

/**
 * OTP is valid for 10 minutes.
 */
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a unique invoice number  INV-DDMMYY-XXX
 */
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
 * Build an Invoice document from an order.
 */
const buildInvoiceData = async (order, paymentInfo) => {
    const invoiceNumber = await generateInvoiceNumber();

    const {
        method,
        razorpayPaymentId = null,
        razorpayOrderId = null,
        amountPaid = 0,
        referralApplied = 0,
        isCod = false,
    } = paymentInfo;

    // --- Parts & Services with effective pricing ---
    const partsUsed = (order.partsUsed || []).map(p => {
        const effectivePrice = (p.discountPrice > 0 && p.discountPrice < p.price)
            ? p.discountPrice
            : p.price;
        return {
            partName: p.partName,
            quantity: p.quantity,
            price: p.price,
            discountPrice: p.discountPrice ?? 0,
            discountType: p.discountType ?? '',
            effectivePrice,
        };
    });

    const serviceProvided = (order.serviceProvided || []).map(s => {
        const effectivePrice = (s.discountPrice > 0 && s.discountPrice < s.price)
            ? s.discountPrice
            : s.price;
        return {
            serviceName: s.serviceName,
            quantity: s.quantity,
            price: s.price,
            discountPrice: s.discountPrice ?? 0,
            effectivePrice,
        };
    });

    // --- Business Details (GST Invoice) ---
    let businessDetails = null;
    if (order.gstInvoice?.requested) {
        const bd = order.gstInvoice.businessDetails || {};
        const requiredFields = ['gstin', 'businessName', 'businessAddress', 'businessCity', 'businessState', 'businessPincode'];
        const missing = requiredFields.filter(f => !bd[f]);
        if (missing.length > 0) {
            throw new Error(`GST invoice requested but missing business details: ${missing.join(', ')}`);
        }
        businessDetails = {
            gstin: bd.gstin.toUpperCase(),
            businessName: bd.businessName,
            businessAddress: bd.businessAddress,
            businessCity: bd.businessCity,
            businessState: bd.businessState,
            businessPincode: bd.businessPincode,
        };
    }

    // --- Financial totals ---
    const subTotal = order.total?.subTotal ?? 0;
    const discount = order.total?.discount ?? 0;
    const discountType = order.total?.discountType ?? '';
    const referralDiscount = isCod ? 0 : (order.total?.referralDiscount ?? 0);
    const sgst = order.total?.sgst ?? 0;
    const cgst = order.total?.cgst ?? 0;
    const sgstRate = order.total?.sgstRate ?? 0;
    const cgstRate = order.total?.cgstRate ?? 0;
    const baseAmount = order.total?.baseAmount ?? 0;

    // Pre‑wallet total (after admin discounts + taxes)
    const totalBeforeWallet = order.total?.total ?? 0;

    // Post‑wallet payable (what the customer owes after wallet deduction)
    const finalPayable = isCod
        ? totalBeforeWallet
        : (order.total?.finalPayable ?? totalBeforeWallet);

    // Wallet amount used (only for online payments, 0 for COD)
    const walletAmountUsed = isCod ? 0 : referralApplied;

    // Actual settled amount = gateway/cash + wallet
    const totalAmountPaid = amountPaid + walletAmountUsed;

    // Payment details
    const paymentDetails = {
        method,
        razorpayPaymentId,
        razorpayOrderId,
        amountPaid,
        walletAmountUsed,
        totalSettled: totalAmountPaid,
        paymentDate: new Date(),
    };

    return {
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

        businessDetails, // added

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
            subTotal,
            discount,
            discountType,
            referralDiscount,
            walletAmountUsed,
            sgst,
            cgst,
            sgstRate,
            cgstRate,
            baseAmount,
            total: totalBeforeWallet,
            finalPayable,
            totalAmountPaid,
        },

        paymentDetails,

        status: 'paid',
    };
};

// ─── Order Creation ───────────────────────────────────────────────────────────

export const createManualOrder = async (req, res) => {
    try {
        const {
            name, contactNo, email, city, selectedBrand, selectedModel,
            modelName, cc, bs, services, serviceType, otherService,
            preferredDate, preferredTime, issues, coupon, address,
            userLocation, isWithinServiceArea, distanceFromCenter,
            referralProcessed, status,
        } = req.body;

        if (!name || !contactNo || !city || !selectedBrand || !selectedModel || !cc || !services?.length || !preferredDate || !preferredTime) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const todayFormatted = `${dd}${mm}${yy}`;

        const latestOrder = await Order.findOne({}).sort({ createdAt: -1 }).lean();
        let serial = 1;
        if (latestOrder?.orderId) {
            const parts = latestOrder.orderId.split('-');
            if (parts.length === 3) {
                const lastSerial = parseInt(parts[2], 10);
                if (!isNaN(lastSerial)) serial = lastSerial + 1;
            }
        }
        const orderId = `ORD-${todayFormatted}-${String(serial).padStart(3, '0')}`;

        const orderData = {
            orderId, name, contactNo,
            email: email || '',
            city: city.toUpperCase(),
            address: address || '',
            selectedBrand, selectedModel,
            modelName: modelName || '',
            cc, bs: bs || '',
            services: services || [],
            serviceType: serviceType || 'Schedule Repair',
            otherService: otherService || '',
            preferredDate: new Date(preferredDate),
            preferredTime,
            issues: issues || '',
            coupon: coupon || '',
            referralProcessed: referralProcessed || false,
            status: status || 'Pending',
        };

        if (userLocation?.coordinates?.length === 2) {
            orderData.userLocation = userLocation;
            orderData.isWithinServiceArea = isWithinServiceArea ?? false;
            orderData.distanceFromCenter = distanceFromCenter || 0;
        }

        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();

        return res.status(201).json({ message: 'Order Confirmed!', data: savedOrder });
    } catch (error) {
        console.error("Error Creating Order:", error);
        return res.status(500).json({ message: 'Server error while creating Order' });
    }
};

export const userOrder = async (req, res) => {
    try {
        const {
            name, contactNo, email, city, address, selectedBrand, selectedModel,
            modelName, cc, bs, services, serviceType, otherService,
            preferredDate, preferredTime, issues,
            userLocation, isWithinServiceArea, distanceFromCenter,
            status, referralProcessed,
        } = req.body;

        const userId = req.user._id;

        if (!name || !contactNo || !city || !selectedBrand || !selectedModel || !cc || !services?.length || !preferredDate || !preferredTime) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const todayFormatted = `${dd}${mm}${yy}`;

        const latestOrder = await Order.findOne({}).sort({ createdAt: -1 }).lean();
        let serial = 1;
        if (latestOrder?.orderId) {
            const parts = latestOrder.orderId.split('-');
            if (parts.length === 3) {
                const lastSerial = parseInt(parts[2], 10);
                if (!isNaN(lastSerial)) serial = lastSerial + 1;
            }
        }
        const orderId = `ORD-${todayFormatted}-${String(serial).padStart(3, '0')}`;

        const newOrder = new Order({
            orderId, userId, name, contactNo,
            email: email || user.email,
            city: city.toUpperCase(),
            address,
            userLocation: (userLocation?.coordinates?.length === 2) ? userLocation : undefined,
            isWithinServiceArea: isWithinServiceArea ?? false,
            distanceFromCenter: distanceFromCenter || 0,
            selectedBrand, selectedModel, serviceType,
            modelName: modelName || '',
            cc, bs: bs || '',
            services: services || [],
            otherService: otherService || '',
            preferredDate: new Date(preferredDate),
            preferredTime,
            issues: issues || '',
            status: status || 'Pending',
            referralProcessed: referralProcessed ?? false,
        });

        const savedOrder = await newOrder.save();
        await sendBookingConfirmationEmail(savedOrder, user.email);

        const adminRecipients = await getAdminRecipients();
        await createNotification({
            type: 'new_order',
            title: '🛵 New Order Received',
            body: `#${savedOrder.orderId} · ${savedOrder.selectedBrand} ${savedOrder.selectedModel} · ${savedOrder.serviceType}`,
            recipients: adminRecipients,
            orderId: savedOrder._id,
            data: { orderId: savedOrder._id.toString(), screenOrderId: savedOrder.orderId },
            triggeredBy: { userId, userModel: 'User' },
        });

        return res.status(201).json({ message: 'Order Confirmed!', data: savedOrder });
    } catch (error) {
        console.error("Error Creating Order:", error);
        return res.status(500).json({ message: 'Server error while creating Order' });
    }
};

// ─── Order Retrieval ──────────────────────────────────────────────────────────

export const getAllBookings = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            status, serviceType, assignedMechanic, mechanicId,
            assignedVendor, vendorId, assignedDelivery, deliveryId,
            isWithinServiceArea, referralProcessed, selectedBrand, selectedModel, city,
            fromDate, toDate, dateField = 'createdAt',
            q, sort = 'createdAt:desc',
        } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (serviceType) filter.serviceType = serviceType;
        if (mechanicId) filter.mechanicIds = mechanicId;
        if (assignedMechanic) filter.assignedMechanics = assignedMechanic;
        if (assignedDelivery) filter.assignedDelivery = assignedDelivery;
        if (deliveryId) filter.deliveryId = deliveryId;
        if (assignedVendor) filter.assignedVendor = assignedVendor;
        if (vendorId) filter.vendorId = vendorId;
        if (isWithinServiceArea !== undefined) filter.isWithinServiceArea = isWithinServiceArea === 'true';
        if (referralProcessed !== undefined) filter.referralProcessed = referralProcessed === 'true';
        if (selectedBrand) filter.selectedBrand = selectedBrand;
        if (selectedModel) filter.selectedModel = selectedModel;
        if (city) filter.city = city.toUpperCase();
        if (fromDate || toDate) {
            filter[dateField] = {};
            if (fromDate) filter[dateField].$gte = new Date(fromDate);
            if (toDate) filter[dateField].$lte = new Date(toDate);
        }
        if (q) {
            filter.$or = [
                { orderId: { $regex: q, $options: 'i' } },
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { contactNo: { $regex: q, $options: 'i' } },
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        let sortCriteria = {};
        if (sort) {
            const [sortField, sortOrder] = sort.split(':');
            sortCriteria[sortField] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortCriteria = { createdAt: -1 };
        }

        const [orders, totalCount] = await Promise.all([
            Order.find(filter).sort(sortCriteria).skip(skip).limit(limitNum).lean(),
            Order.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
            },
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({ message: 'Server error while fetching bookings' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("userId", "firstName lastName email phone referralAmount accountType")
            .populate("mechanicIds", "firstName lastName phone profileImage");

        if (!order) return res.status(404).json({ message: 'Order not found' });
        return res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return res.status(500).json({ message: 'Server error while fetching order' });
    }
};

export const getOrderByUserId = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'User not authenticated' });

        const orders = await Order.find({ userId });
        if (!orders.length) return res.status(404).json({ message: 'No orders found' });

        return res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        console.error("Error Fetching Orders:", error);
        return res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

// ─── Assignment Controllers ───────────────────────────────────────────────────

export const updateMechanic = async (req, res) => {
    try {
        const { id } = req.params;
        const { mechanicIds } = req.body;

        if (!mechanicIds || !Array.isArray(mechanicIds) || mechanicIds.length === 0) {
            return res.status(400).json({ message: "mechanicIds array with at least one ID is required" });
        }

        const mechanics = await Employee.find({ _id: { $in: mechanicIds }, position: 'mechanic' });
        if (mechanics.length !== mechanicIds.length) {
            const foundIds = mechanics.map(m => m._id.toString());
            const missing = mechanicIds.filter(id => !foundIds.includes(id));
            return res.status(404).json({ message: `Mechanics not found: ${missing.join(', ')}` });
        }

        const order = await Order.findById(id).populate("userId");
        if (!order) return res.status(404).json({ message: "Order not found" });

        const forbiddenStatuses = ["Work Completed", "Invoice Generated", "Completed", "Cancelled"];
        if (forbiddenStatuses.includes(order.status)) {
            return res.status(400).json({
                message: `Cannot assign mechanics. Order is already ${order.status.toLowerCase()}.`,
            });
        }

        order.mechanicIds = mechanics.map(m => m._id);
        order.assignedMechanics = mechanics.map(m => `${m.firstName} ${m.lastName}`);
        order.status = "Mechanic Assigned";
        await order.save();

        for (const mechanic of mechanics) {
            const mechanicRecipients = getEmployeeRecipient(mechanic._id, 'mechanic');
            await createNotification({
                type: 'mechanic_assigned',
                title: '🛵 New Order Assigned',
                body: `#${order.orderId} · ${order.selectedBrand} ${order.selectedModel} · ${order.serviceType}`,
                recipients: mechanicRecipients,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId },
                triggeredBy: { userId: mechanic._id, userModel: 'Employee' },
            });
        }

        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            const mechanicNames = mechanics.map(m => `${m.firstName} ${m.lastName}`).join(', ');
            await createNotification({
                type: 'mechanic_assigned',
                title: '🛵 Mechanic(s) Assigned',
                body: `${mechanicNames} ${mechanics.length === 1 ? 'has' : 'have'} been assigned to your order #${order.orderId}.`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId },
                triggeredBy: { userId: order.userId._id, userModel: 'User' },
            });
        }

        return res.status(200).json({
            message: `${mechanics.length} mechanic(s) assigned successfully.`,
            data: order,
        });
    } catch (error) {
        console.error("Error updating mechanics:", error);
        return res.status(500).json({ message: "Server error while updating mechanics" });
    }
};

export const updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryId } = req.body;

        if (!deliveryId) return res.status(400).json({ message: "Delivery person ID is required" });

        const deliveryPerson = await Employee.findById(deliveryId);
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const forbiddenStatuses = ["Work Completed", "Invoice Generated", "Completed", "Cancelled"];
        if (forbiddenStatuses.includes(order.status)) {
            return res.status(400).json({
                message: `Cannot assign delivery person. Order is already ${order.status.toLowerCase()}.`,
            });
        }

        order.assignedDelivery = `${deliveryPerson.firstName} ${deliveryPerson.lastName}`;
        order.deliveryId = deliveryPerson._id;
        await order.save();

        const deliveryRecipients = getEmployeeRecipient(deliveryPerson._id, 'delivery');
        await createNotification({
            type: 'delivery_assigned',
            title: '🛵 New Order Assigned',
            body: `#${order.orderId} · ${order.selectedBrand} ${order.selectedModel} · ${order.serviceType}`,
            recipients: deliveryRecipients,
            orderId: order._id,
            data: { orderId: order._id.toString(), screenOrderId: order.orderId },
            triggeredBy: { userId: req.user?._id || deliveryPerson._id, userModel: 'Employee' },
        });

        res.status(200).json({ message: "Delivery person assigned successfully.", data: order });
    } catch (error) {
        console.error("Error updating delivery person:", error);
        res.status(500).json({ message: "Server error while updating delivery person" });
    }
};

export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendorId } = req.body;

        if (!vendorId) return res.status(400).json({ message: "Vendor ID is required" });

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { assignedVendor: `${vendor.firstName} ${vendor.lastName}`, vendorId: vendor._id },
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

        res.status(200).json({ message: "Vendor updated successfully", data: updatedOrder });
    } catch (error) {
        console.error("Error updating vendor:", error);
        res.status(500).json({ message: "Server error while updating vendor" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ message: "Status is required" });

        const restrictedStatuses = [
            "Mechanic Assigned", "Mechanic Arrived", "In Progress",
            "Work Completed", "Invoice Generated", "Completed",
        ];
        if (restrictedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status "${status}" cannot be set manually. Use the dedicated endpoint for this transition.`,
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id, { status }, { new: true, runValidators: true }
        );
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

        if (updatedOrder.userId) {
            const userRecipient = getUserRecipient(updatedOrder.userId);
            await createNotification({
                type: 'order_update',
                title: status === 'Cancelled' ? '❌ Order Cancelled' : '🛵 Order Status Updated',
                body: `Your order #${updatedOrder.orderId} status has changed to ${status}.`,
                recipients: userRecipient,
                orderId: updatedOrder._id,
                data: { orderId: updatedOrder._id.toString(), screenOrderId: updatedOrder.orderId },
            });
        }

        return res.status(200).json({ message: "Order status updated successfully", data: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Server error while updating order status" });
    }
};

// ─── Step 1 — Mechanic Confirms Arrival ──────────────────────────────────────

export const confirmMechanicArrival = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Mechanic Assigned') {
            return res.status(400).json({
                message: `Cannot confirm arrival. Current status is "${order.status}".`,
            });
        }

        order.status = 'Mechanic Arrived';
        order.arrivedAt = new Date();
        await order.save();

        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'mechanic_arrived',
                title: '📍 Mechanic Has Arrived',
                body: `Your mechanic has arrived for order #${order.orderId}. They will start work shortly.`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId },
            });
        }

        return res.status(200).json({ message: 'Arrival confirmed.', data: order });
    } catch (error) {
        console.error('Error confirming mechanic arrival:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Step 2 — Request Work Start: Upload temp before-photo + send OTP ────────
/**
 * @route   POST /api/admin/order/:id/request-work-start
 * @desc    Mechanic uploads before-photo (stored as TEMP) and triggers OTP to customer.
 *          Photo is saved to a temp path. It is only moved to beforePhotos[] on
 *          successful OTP verification in verifyWorkStart.
 *          If this endpoint is called again (retry/resend), any existing temp photo
 *          is deleted and replaced with the new one.
 * @files   beforePhoto (multipart, image)
 * @access  Employee (mechanic)
 */
export const requestWorkStart = async (req, res) => {
    let uploadedFilePath = req.file?.path || null;
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            deleteUploadedFile(uploadedFilePath);
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'Mechanic Arrived') {
            deleteUploadedFile(uploadedFilePath);
            return res.status(400).json({
                message: `Cannot request work start. Current status is "${order.status}".`,
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Before-repair photo is required.' });
        }

        // ── Delete old pending temp photo if one exists ───────────────────────
        // This handles the case where the mechanic retries or the app was killed
        // mid-flow (photo uploaded but OTP never verified).
        if (order.workStartOtp?.pendingPhotoPath) {
            deleteUploadedFile(order.workStartOtp.pendingPhotoPath);
        }
        // If a confirmed beforePhoto already exists, delete it (we're replacing)
        if (order.beforePhoto) {
            deleteUploadedFile(order.beforePhoto);
        }

        // Generate OTP
        const otp = generateOtp();

        // Store temp photo path alongside OTP — NOT in beforePhotos yet
        order.workStartOtp = {
            code: otp,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
            verified: false,
            attempts: 0,
            pendingPhotoPath: uploadedFilePath,   // ← temp storage
        };
        await order.save();

        // Send OTP to the user via push notification
        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'work_start_otp',
                title: '🔑 Confirm Work Start',
                body: `Your mechanic is ready to start work on order #${order.orderId}. Your OTP is: ${otp}`,
                recipients: userRecipient,
                orderId: order._id,
                data: {
                    orderId: order._id.toString(),
                    screenOrderId: order.orderId,
                    otp,
                },
            });
        }

        return res.status(200).json({
            message: 'Photo uploaded. OTP sent to customer for work start confirmation.',
        });
    } catch (error) {
        // Photo was uploaded but something failed — delete the temp file
        deleteUploadedFile(uploadedFilePath);
        console.error('Error requesting work start:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Step 2b — Resend Work Start OTP (reuses existing temp photo) ─────────────
/**
 * @route   POST /api/admin/order/:id/resend-work-start-otp
 * @desc    Regenerates OTP. The pendingPhotoPath from a prior requestWorkStart
 *          call is preserved — no new photo upload needed.
 * @access  Employee (mechanic)
 */
export const resendWorkStartOtp = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Mechanic Arrived') {
            return res.status(400).json({ message: `Cannot resend OTP at status "${order.status}".` });
        }

        // Must have a pending photo already (from a prior requestWorkStart call)
        if (!order.workStartOtp?.pendingPhotoPath) {
            return res.status(400).json({
                message: 'No pending photo found. Please restart the work start flow.',
            });
        }

        const otp = generateOtp();
        order.workStartOtp = {
            ...order.workStartOtp.toObject?.() || order.workStartOtp,
            code: otp,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
            verified: false,
            attempts: 0,
            // pendingPhotoPath is preserved — no new upload
        };
        await order.save();

        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'work_start_otp',
                title: '🔑 New OTP — Confirm Work Start',
                body: `New OTP for order #${order.orderId}: ${otp}`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId, otp },
            });
        }

        return res.status(200).json({ message: 'Work start OTP resent.' });
    } catch (error) {
        console.error('Error resending work start OTP:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Step 3 — Verify Work Start OTP ──────────────────────────────────────────
/**
 * @route   POST /api/admin/order/:id/verify-work-start
 * @desc    Mechanic submits customer OTP. On success the temp photo is moved
 *          to beforePhotos[] and status advances to "In Progress".
 *          On failure the temp photo stays until the mechanic retries or
 *          explicitly re-initiates the flow.
 * @body    { otp: string }
 * @access  Employee (mechanic)
 */
export const verifyWorkStart = async (req, res) => {
    try {
        const { id } = req.params;
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: 'OTP is required.' });

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Mechanic Arrived') {
            return res.status(400).json({
                message: `Cannot verify work start. Current status is "${order.status}".`,
            });
        }

        const workStartOtp = order.workStartOtp;

        if (!workStartOtp?.pendingPhotoPath) {
            return res.status(400).json({
                message: 'No pending photo found. Please initiate the work start flow again.',
            });
        }

        if ((workStartOtp.attempts || 0) >= MAX_OTP_ATTEMPTS) {
            // Clean up the pending photo since max attempts exhausted
            deleteUploadedFile(workStartOtp.pendingPhotoPath);
            order.workStartOtp.pendingPhotoPath = null;
            await order.save();
            return res.status(429).json({ message: 'Too many incorrect attempts. Please retake the photo and restart.' });
        }

        if (!workStartOtp.expiresAt || new Date() > workStartOtp.expiresAt) {
            // OTP expired — delete stale photo so mechanic must retake
            deleteUploadedFile(workStartOtp.pendingPhotoPath);
            order.workStartOtp.pendingPhotoPath = null;
            await order.save();
            return res.status(400).json({ message: 'OTP expired. Please retake the photo and restart.' });
        }

        if (workStartOtp.code !== String(otp)) {
            order.workStartOtp.attempts = (workStartOtp.attempts || 0) + 1;
            await order.save();
            return res.status(400).json({
                message: 'Incorrect OTP.',
                attemptsLeft: MAX_OTP_ATTEMPTS - order.workStartOtp.attempts,
            });
        }

        // ── OTP correct: commit the photo ────────────────────────────────────
        const confirmedPhotoPath = workStartOtp.pendingPhotoPath;

        order.workStartOtp = {
            code: null,
            expiresAt: null,
            verified: true,
            attempts: workStartOtp.attempts,
            pendingPhotoPath: null,   // cleared — photo now lives in beforePhotos
        };
        order.status = 'In Progress';
        order.workStartedAt = new Date();
        order.beforePhoto = confirmedPhotoPath;
        await order.save();
        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'work_started',
                title: '⚙️ Work In Progress',
                body: `Work has started on your order #${order.orderId}.`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId },
            });
        }

        return res.status(200).json({ message: 'Work started successfully.', data: order });
    } catch (error) {
        console.error('Error verifying work start OTP:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Step 4 — Mark Work Complete: Upload temp after-photo + send OTP ─────────
/**
 * @route   POST /api/admin/order/:id/complete-work
 * @desc    Mechanic uploads after-photo (stored as TEMP) and triggers completion
 *          OTP to the customer. Photo is only committed to afterPhotos[] on
 *          successful OTP verification in confirmWorkCompletion.
 *          If called again (retry), old temp photo is deleted and replaced.
 * @files   afterPhoto (multipart, image)
 * @access  Employee (mechanic)
 */
export const markWorkComplete = async (req, res) => {
    let uploadedFilePath = req.file?.path || null;
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            deleteUploadedFile(uploadedFilePath);
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.status !== 'In Progress') {
            deleteUploadedFile(uploadedFilePath);
            return res.status(400).json({ message: `Cannot mark work complete. Current status is "${order.status}".` });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'After-repair photo is required.' });
        }

        // ── Delete old pending temp after-photo if one exists ─────────────────
        if (order.workCompleteOtp?.pendingPhotoPath) {
            deleteUploadedFile(order.workCompleteOtp.pendingPhotoPath);
        }
        // Delete existing confirmed afterPhoto (we're replacing)
        if (order.afterPhoto) {
            deleteUploadedFile(order.afterPhoto);
        }

        const otp = generateOtp();

        // Status moves to Work Completed but photo is NOT committed yet
        order.status = 'Work Completed';
        order.workCompletedAt = new Date();
        order.workCompleteOtp = {
            code: otp,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
            verified: false,
            attempts: 0,
            pendingPhotoPath: uploadedFilePath,   // ← temp storage
        };
        await order.save();

        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'work_complete_otp',
                title: '✅ Work Completed — Confirm',
                body: `The mechanic has completed work on order #${order.orderId}. Your confirmation OTP is: ${otp}`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId, otp },
            });
        }

        return res.status(200).json({ message: 'Work marked as complete. OTP sent to customer.', data: order });
    } catch (error) {
        deleteUploadedFile(uploadedFilePath);
        console.error('Error marking work complete:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Step 4b — Resend Completion OTP (reuses existing temp photo) ─────────────
/**
 * @route   POST /api/admin/order/:id/resend-completion-otp
 * @desc    Regenerates completion OTP. The pendingPhotoPath is preserved.
 * @access  Employee (mechanic)
 */
export const resendCompletionOtp = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Work Completed') {
            return res.status(400).json({ message: `Cannot resend OTP at status "${order.status}".` });
        }

        if (!order.workCompleteOtp?.pendingPhotoPath) {
            return res.status(400).json({
                message: 'No pending photo found. Please restart the complete work flow.',
            });
        }

        const otp = generateOtp();
        order.workCompleteOtp = {
            ...order.workCompleteOtp.toObject?.() || order.workCompleteOtp,
            code: otp,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
            verified: false,
            attempts: 0,
            // pendingPhotoPath preserved
        };
        await order.save();

        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'work_complete_otp',
                title: '✅ New OTP — Confirm Completion',
                body: `New completion OTP for order #${order.orderId}: ${otp}`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId, otp },
            });
        }

        return res.status(200).json({ message: 'Completion OTP resent.' });
    } catch (error) {
        console.error('Error resending completion OTP:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Step 5 — User Confirms Work Completion via OTP ──────────────────────────
/**
 * @route   POST /api/admin/order/:id/confirm-completion
 * @desc    Customer submits the completion OTP. On success the temp after-photo
 *          is committed to afterPhotos[]. Status → Completed.
 * @body    { otp: string }
 * @access  Private (authUser)
 */
export const confirmWorkCompletion = async (req, res) => {
    try {
        const { id } = req.params;
        const { otp } = req.body;

        if (!otp) return res.status(400).json({ message: 'OTP is required.' });

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Work Completed') {
            return res.status(400).json({
                message: `Cannot confirm completion. Current status is "${order.status}".`,
            });
        }

        const { workCompleteOtp } = order;

        if ((workCompleteOtp.attempts || 0) >= MAX_OTP_ATTEMPTS) {
            deleteUploadedFile(workCompleteOtp.pendingPhotoPath);
            order.workCompleteOtp.pendingPhotoPath = null;
            await order.save();
            return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        if (!workCompleteOtp.expiresAt || new Date() > workCompleteOtp.expiresAt) {
            deleteUploadedFile(workCompleteOtp.pendingPhotoPath);
            order.workCompleteOtp.pendingPhotoPath = null;
            await order.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (workCompleteOtp.code !== String(otp)) {
            order.workCompleteOtp.attempts = (workCompleteOtp.attempts || 0) + 1;
            await order.save();
            return res.status(400).json({
                message: 'Incorrect OTP.',
                attemptsLeft: MAX_OTP_ATTEMPTS - order.workCompleteOtp.attempts,
            });
        }

        // ── OTP correct: commit the after-photo ──────────────────────────────
        const confirmedPhotoPath = workCompleteOtp.pendingPhotoPath;

        order.workCompleteOtp = {
            code: null,
            expiresAt: null,
            verified: true,
            attempts: workCompleteOtp.attempts,
            pendingPhotoPath: null,
        };
        order.status = 'Work Completed';
        order.afterPhoto = confirmedPhotoPath;
        await order.save();

        const adminRecipients = await getAdminRecipients();
        await createNotification({
            type: 'order_confirmed_complete',
            title: '✅ Customer Confirmed Completion',
            body: `Customer confirmed completion for order #${order.orderId}.`,
            recipients: adminRecipients,
            orderId: order._id,
            data: { orderId: order._id.toString(), screenOrderId: order.orderId },
        });

        return res.status(200).json({ message: 'Completion confirmed by customer.', data: order });
    } catch (error) {
        console.error('Error confirming work completion:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ─── Invoice Generation ───────────────────────────────────────────────────────
export const updateOrderandGenerateInvoice = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        // 1. Validate order existence
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: `Order with ID ${id} not found.`,
            });
        }

        // 2. Check if order is in the correct status for invoice generation
        if (order.status !== 'Work Completed') {
            return res.status(400).json({
                success: false,
                message: `Invoice cannot be generated. The order must be in "Work Completed" status. Current status: "${order.status}".`,
                currentStatus: order.status,
                requiredStatus: 'Work Completed',
            });
        }

        // 3. Validate required data structure
        if (!data || typeof data !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Expected an object with invoice details.',
            });
        }

        const { partsAndServices, total, invoiceDetails } = data;

        if (!Array.isArray(partsAndServices)) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid "partsAndServices" array.',
            });
        }

        if (!total || typeof total !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid "total" object containing financial details.',
            });
        }

        // 4. Validate required total fields
        const requiredTotalFields = ['subTotal', 'total', 'baseAmount'];
        const missingFields = requiredTotalFields.filter(field => total[field] === undefined || total[field] === null);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required total fields: ${missingFields.join(', ')}.`,
            });
        }

        // 5. Process parts and services
        const partsUsed = partsAndServices
            .filter(item => item.type === 'part')
            .map(item => {
                if (!item.name || item.quantity == null || item.price == null) {
                    throw new Error(`Invalid part entry: name, quantity, and price are required.`);
                }
                return {
                    partName: item.name.trim(),
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    discountPrice: Number(item.discountPrice) || 0,
                    discountType: item.discountType || undefined,
                };
            });

        const serviceProvided = partsAndServices
            .filter(item => item.type === 'service')
            .map(item => {
                if (!item.name || item.quantity == null || item.price == null) {
                    throw new Error(`Invalid service entry: name, quantity, and price are required.`);
                }
                return {
                    serviceName: item.name.trim(),
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    discountPrice: Number(item.discountPrice) || 0,
                };
            });

        // 6. Build update object
        const updatedFields = {
            invoiceDate: invoiceDetails?.invoiceDate ? new Date(invoiceDetails.invoiceDate) : new Date(),
            partsUsed,
            serviceProvided,
            status: 'Invoice Generated',
            total: {
                subTotal: Number(total.subTotal),
                discount: Number(total.discount) || 0,
                discountType: total.discountType || '',
                referralDiscount: 0, // referral discount not applicable at invoice stage
                sgst: Number(total.sgst) || 0,
                cgst: Number(total.cgst) || 0,
                sgstRate: Number(total.sgstRate) || 0,
                cgstRate: Number(total.cgstRate) || 0,
                baseAmount: Number(total.baseAmount),
                total: Number(total.total),
                finalPayable: Number(total.finalPayable) || Number(total.total),
            },
            paymentStatus: 'unpaid',
        };

        // 7. Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update the order. Please try again.',
            });
        }

        // 8. Send notification to customer
        if (updatedOrder.userId) {
            try {
                const userRecipient = getUserRecipient(updatedOrder.userId);
                await createNotification({
                    type: 'invoice_generated',
                    title: '🧾 Invoice Ready',
                    body: `Your invoice for order #${updatedOrder.orderId} is ready. Please review and pay.`,
                    recipients: userRecipient,
                    orderId: updatedOrder._id,
                    data: {
                        orderId: updatedOrder._id.toString(),
                        screenOrderId: updatedOrder.orderId,
                    },
                });
            } catch (notifError) {
                console.error('Notification failed:', notifError);
                // Non-critical – still return success
            }
        }

        // 9. Success response
        return res.status(200).json({
            success: true,
            message: 'Invoice generated successfully. The order is now awaiting payment.',
            order: updatedOrder,
        });

    } catch (error) {
        console.error('Error generating invoice:', error);

        // Handle known validation errors from processing parts/services
        if (error.message && error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed.',
                errors: messages,
            });
        }

        // Generic server error
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while generating the invoice. Please try again later.',
        });
    }
};
export const getInvoice = async (req, res) => {

    try {
        const { id: orderId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format',
            });
        }

        const invoice = await Invoice.findOne({ orderId }).lean();

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found for this order',
            });
        }

        res.status(200).json({
            success: true,
            invoice,
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching invoice',
        });
    }
};
// ─── COD Payment ──────────────────────────────────────────────────────────────
export const markPaidCod = async (req, res) => {
    try {
        const { id } = req.params;
        const { amountCollected } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // ── Guard: only allow COD when invoice has been generated ─────────────
        if (order.status !== 'Invoice Generated') {
            return res.status(400).json({
                message: `Order must be in "Invoice Generated" status to mark as paid. Current: "${order.status}".`,
            });
        }

        // ── Guard: prevent double-payment ────────────────────────────────────
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Order is already paid.' });
        }

        // ── Resolve amount ────────────────────────────────────────────────────
        // COD always uses order.total.total (the pre-referral, pre-wallet total).
        // No referral or online-wallet discount applies for cash payment.
        const codPayable = order.total?.total || 0;
        const collected = amountCollected != null ? Number(amountCollected) : codPayable;

        // ── Update order ──────────────────────────────────────────────────────
        order.status = 'Completed';
        order.total.referralDiscount = 0;       // no referral discount for COD
        order.total.finalPayable = codPayable;
        order.coupon = null;                    // coupons don't apply to COD
        order.paymentStatus = 'paid';
        order.paymentMethod = 'cash';
        order.amountPaid = collected;
        order.balanceDue = 0;
        order.paymentDate = new Date();
        // Schedule repair photos for deletion 7 days after payment
        order.photosScheduledDeleteAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        order.photosDeleted = false;
        await order.save();

        // ── Generate invoice ──────────────────────────────────────────────────
        const invoiceData = await buildInvoiceData(order, {
            method: 'cash',
            amountPaid: collected,
            isCod: true,
        });
        const invoice = await Invoice.create(invoiceData);

        // ── Notifications ─────────────────────────────────────────────────────
        const notificationData = {
            orderId: order._id.toString(),
            screenOrderId: order.orderId,
            invoiceId: invoice._id.toString(),
            invoiceNumber: invoice.invoiceNumber,
            amountPaid: collected,
        };

        // Notify customer
        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'payment_received',
                title: '✅ Payment Confirmed',
                body: `Your cash payment of ₹${collected} for order #${order.orderId} has been received. Invoice #${invoice.invoiceNumber} generated.`,
                recipients: userRecipient,
                orderId: order._id,
                data: notificationData,
            });
        }

        // Notify admins
        const adminRecipients = await getAdminRecipients();
        if (adminRecipients.length) {
            await createNotification({
                type: 'payment_received',
                title: '💰 Cash Payment Received',
                body: `₹${collected} cash collected for order #${order.orderId}. Invoice #${invoice.invoiceNumber} generated.`,
                recipients: adminRecipients,
                orderId: order._id,
                data: notificationData,
            });
        }

        // Notify assigned mechanic(s)
        if (order.mechanicIds?.length) {
            for (const mechanicId of order.mechanicIds) {
                const mechanicRecipients = getEmployeeRecipient(mechanicId, 'mechanic');
                await createNotification({
                    type: 'payment_received',
                    title: '💰 Cash Payment Confirmed',
                    body: `Cash ₹${collected} collected for order #${order.orderId}. Invoice #${invoice.invoiceNumber} generated.`,
                    recipients: mechanicRecipients,
                    orderId: order._id,
                    data: notificationData,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Cash payment recorded. Invoice generated.',
            order,
            invoice,
        });
    } catch (error) {
        console.error('Error marking COD payment:', error);
        return res.status(500).json({ message: 'Server error while recording payment.' });
    }
};


// ─── Parts & Items Update ─────────────────────────────────────────────────────

export const updateItems = async (req, res) => {
    const { id } = req.params;
    const { partsUsed, serviceProvided } = req.body;

    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status === 'Cancelled') {
            return res.status(400).json({ message: 'Cannot update items. Order is cancelled.' });
        }

        if (Array.isArray(partsUsed)) {
            order.partsUsed = partsUsed.map(part => ({
                partName: part.partName?.trim() || '',
                quantity: !isNaN(part.quantity) ? Number(part.quantity) : 1,
                price: !isNaN(part.price) ? Number(part.price) : 0,
                discountPrice: !isNaN(part.discountPrice) ? Number(part.discountPrice) : 0,
                discountType: part.discountType || undefined,
            }));
        }

        if (Array.isArray(serviceProvided)) {
            order.serviceProvided = serviceProvided.map(service => ({
                serviceName: service.serviceName?.trim() || '',
                quantity: !isNaN(service.quantity) ? Number(service.quantity) : 1,
                price: !isNaN(service.price) ? Number(service.price) : 0,
                discountPrice: !isNaN(service.discountPrice) ? Number(service.discountPrice) : 0,
            }));
        }

        await order.save();
        res.status(200).json({ message: 'Items updated successfully', order });
    } catch (error) {
        console.error('Error updating items:', error);
        res.status(500).json({ message: 'Server error while updating items' });
    }
};

export const updatePartsPrice = async (req, res) => {
    const { id } = req.params;
    const { partsUsed, pricing } = req.body;

    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.partsUsed = partsUsed.map(part => ({
            partName: part.partName,
            quantity: part.quantity,
            price: part.price,
        }));
        await order.save();

        let vendorOrder = await VendorOrder.findOne({ orderId: order._id });
        if (vendorOrder) {
            vendorOrder.partsUsed = partsUsed.map(part => ({
                partName: part.partName,
                quantity: part.quantity,
                price: part.price,
                discountPrice: part.discountPrice,
            }));
            vendorOrder.pricing = pricing;
            vendorOrder.orderDate = new Date();
            await vendorOrder.save();
        } else {
            vendorOrder = new VendorOrder({
                orderId: order._id,
                partsUsed: partsUsed.map(part => ({
                    partName: part.partName,
                    quantity: part.quantity,
                    price: part.price,
                    discountPrice: part.discountPrice,
                })),
                pricing,
                vendorId: order.vendorId,
                deliveryBoyId: order.deliveryId,
                deliveryBoyName: order.assignedDelivery,
                orderDate: new Date(),
            });
            await vendorOrder.save();
        }

        res.status(200).json({ message: 'Parts pricing updated successfully', order, vendorOrder });
    } catch (error) {
        console.error('Error updating parts pricing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── Employee / Vendor Booking Views ─────────────────────────────────────────

export const getAllBookingsByEmployee = async (req, res) => {
    const { employeeId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt:desc' } = req.query;

    try {
        const filter = {
            $or: [
                { mechanicIds: employeeId },
                { deliveryId: employeeId },
                { vendorId: employeeId },
            ],
        };

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        let sortCriteria = {};
        if (sort) {
            const [sortField, sortOrder] = sort.split(':');
            sortCriteria[sortField] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortCriteria = { createdAt: -1 };
        }

        const [orders, totalCount] = await Promise.all([
            Order.find(filter).sort(sortCriteria).skip(skip).limit(limitNum).lean(),
            Order.countDocuments(filter),
        ]);

        if (!orders?.length) return res.status(404).json({ message: 'No bookings found for this employee.' });

        res.status(200).json({
            message: 'Orders fetched successfully',
            data: orders,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
            },
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllBookingsByVendor = async (req, res) => {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt:desc' } = req.query;

    try {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        let sortCriteria = {};
        if (sort) {
            const [sortField, sortOrder] = sort.split(':');
            sortCriteria[sortField] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortCriteria = { createdAt: -1 };
        }

        const [orders, totalCount] = await Promise.all([
            Order.find({ vendorId })
                .sort(sortCriteria)
                .skip(skip)
                .limit(limitNum)
                .populate('mechanicIds', 'phone')
                .populate('deliveryId', 'phone')
                .lean(),
            Order.countDocuments({ vendorId }),
        ]);

        if (!orders?.length) return res.status(404).json({ message: 'No bookings found for this vendor.' });

        const transformedOrders = orders.map(order => ({
            ...order,
            mechanicPhone: order.mechanicIds?.[0]?.phone || null,
            deliveryPhone: order.deliveryId?.phone || null,
            deliveryId: order.deliveryId?._id || order.deliveryId,
        }));

        res.status(200).json({
            message: 'Bookings fetched successfully',
            data: transformedOrders,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
            },
        });
    } catch (error) {
        console.error('Error fetching bookings by vendor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOrdersByPosition = async (req, res) => {
    const { position, employeeId } = req.query;

    if (!position || !employeeId) {
        return res.status(400).json({ message: 'Position and employeeId are required.' });
    }

    try {
        let filter = {};
        switch (position.toLowerCase()) {
            case 'delivery': filter = { deliveryId: employeeId }; break;
            case 'mechanic': filter = { mechanicIds: employeeId }; break;
            default: return res.status(400).json({ message: 'Invalid position provided.' });
        }

        const orders = await Order.find(filter);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ─── Cancellation ─────────────────────────────────────────────────────────────

export const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status === 'Cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        const nonCancellable = ['In Progress', 'Work Completed', 'Invoice Generated', 'Completed', 'Mechanic Arrived'];
        if (nonCancellable.includes(order.status)) {
            return res.status(400).json({ message: `Cannot cancel order with status "${order.status}"` });
        }

        order.status = 'Cancelled';
        order.cancellationReason = reason || null;
        order.cancelledAt = new Date();
        await order.save();

        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'order_cancelled',
                title: '❌ Order Cancelled',
                body: `Your order #${order.orderId} has been cancelled.`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId },
            });
        }

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Server error while cancelling order' });
    }
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const completedOrders = async (req, res) => {
    const { timeFrame } = req.query;
    try {
        let matchStage = { status: { $in: ['Invoice Generated', 'Completed'] } };
        let groupBy, format;
        const now = new Date();

        if (timeFrame === 'month') {
            matchStage.createdAt = {
                $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
            };
            groupBy = { $dayOfMonth: '$createdAt' };
            format = d => ({ label: `Date ${d._id}`, count: d.count });
        } else {
            matchStage.createdAt = {
                $gte: new Date(now.getFullYear(), 0, 1),
                $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
            };
            groupBy = { $month: '$createdAt' };
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            format = d => ({ label: monthNames[d._id - 1], count: d.count });
        }

        const result = await Order.aggregate([
            { $match: matchStage },
            { $group: { _id: groupBy, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json(result.map(format));
    } catch (error) {
        console.error('Error in completedOrders:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const completeRevenue = async (req, res) => {
    const { timeFrame } = req.query;
    const now = new Date();
    let matchStage = { status: { $in: ['Invoice Generated', 'Completed'] } };
    let groupStage = {};
    let formatFn;

    if (timeFrame === 'month') {
        matchStage.createdAt = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
        groupStage = { _id: { $dayOfMonth: '$createdAt' }, revenue: { $sum: '$total.total' } };
        formatFn = d => ({ label: `Date ${d._id}`, revenue: d.revenue });
    } else if (timeFrame === 'last6') {
        matchStage.createdAt = {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            $lte: now,
        };
        groupStage = {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$total.total' },
        };
        formatFn = d => ({
            label: new Date(d._id.year, d._id.month - 1).toLocaleString('default', { month: 'long' }),
            revenue: d.revenue,
        });
    } else {
        matchStage.createdAt = {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lte: new Date(now.getFullYear(), 11, 31),
        };
        groupStage = { _id: { $month: '$createdAt' }, revenue: { $sum: '$total.total' } };
        formatFn = d => ({
            label: new Date(now.getFullYear(), d._id - 1).toLocaleString('default', { month: 'long' }),
            revenue: d.revenue,
        });
    }

    try {
        const result = await Order.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: { _id: 1 } },
        ]);
        res.status(200).json(result.map(formatFn));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


// ─── Admin Force Status Update (No Restrictions) ───────────────────────────
/**
 * @route   PUT /api/admin/order/force-update-status/:id
 * @desc    Admin can set any status without transition checks.
 * @access  Admin only
 */
export const forceUpdateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log(status)
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Optional: Notify the customer about the change
        if (order.userId) {
            const userRecipient = getUserRecipient(order.userId);
            await createNotification({
                type: 'order_update',
                title: '🛵 Order Status Updated',
                body: `Your order #${order.orderId} status has been updated to ${status}.`,
                recipients: userRecipient,
                orderId: order._id,
                data: { orderId: order._id.toString(), screenOrderId: order.orderId },
            });
        }

        return res.status(200).json({
            message: "Order status forcefully updated",
            data: order,
        });
    } catch (error) {
        console.error("Error force updating order status:", error);
        return res.status(500).json({ message: "Server error" });
    }
};