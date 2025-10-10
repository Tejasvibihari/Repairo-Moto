import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import Vendor from '../Models/vendorModel.js'
import VendorOrder from "../Models/vendorOrderModel.js";
import { sendBookingConfirmationEmail, sendRefereeEmail } from "../Utils/mailer.js";
import User from "../Models/userModel.js";
// @desc Create a new service booking
// @route POST /api/bookings
// @access Public


export const createManualOrder = async (req, res) => {
    try {
        const {
            name,
            contactNo,
            city,
            selectedBrand,
            selectedModel,
            modelName,
            cc,
            bs,
            services,
            otherService,
            preferredDate,
            preferredTime,
            // estimatedBudget,
            issues,
            coupon
        } = req.body;

        if (!name || !contactNo || !city || !selectedBrand || !selectedModel || !cc || !services.length || !preferredDate || !preferredTime) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }
        // Format today's date as DDMMYY
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const yy = String(now.getFullYear()).slice(-2);
        const todayFormatted = `${dd}${mm}${yy}`;

        // Get the latest order globally (not filtered by date)
        const latestOrder = await Order.findOne({})
            .sort({ createdAt: -1 })
            .lean();

        let serial = 1;
        if (latestOrder && latestOrder.orderId) {
            const parts = latestOrder.orderId.split('-');
            if (parts.length === 3) {
                const lastSerial = parseInt(parts[2], 10);
                if (!isNaN(lastSerial)) {
                    serial = lastSerial + 1;
                }
            }
        }

        const orderId = `ORD-${todayFormatted}-${String(serial).padStart(3, '0')}`;


        const newOrder = new Order({
            orderId,
            name,
            contactNo,
            city,
            selectedBrand,
            selectedModel,
            modelName,
            cc,
            bs,
            services,
            otherService,
            preferredDate,
            preferredTime,
            // estimatedBudget,
            issues,
            coupon
        });

        const savedOrder = await newOrder.save();

        return res.status(201).json({
            message: 'Order Confirmed!',
            data: savedOrder
        });

    } catch (error) {
        console.error("Error Creating Order:", error);
        return res.status(500).json({ message: 'Server error while creating Order' });
    }
};


// (Optional) @desc Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({ message: 'Server error while fetching bookings' });
    }
};

// (Optional) @desc Get single booking by ID
export const getOrderById = async (req, res) => {
    console.log(req.params.id)
    try {
        const order = await Order.findById(req.params.id)
            .populate("userId", "firstName lastName email phone referralAmount accountType");
        if (!order) return res.status(404).json({ message: 'Order not found' });
        console.log(order)
        return res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return res.status(500).json({ message: 'Server error while fetching order' });
    }
};

export const updateMechanic = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from the request parameters
        const { mechanicId } = req.body; // Extract mechanic ID from the request body

        // Validate input
        if (!mechanicId) {
            return res.status(400).json({ message: "Mechanic ID is required" });
        }

        // Find the mechanic by ID in the Employee collection
        const mechanic = await Employee.findById(mechanicId);
        if (!mechanic) {
            return res.status(404).json({ message: "Mechanic not found" });
        }

        // Find the order and also get user info (populate to reduce extra query)
        const order = await Order.findById(id).populate("userId");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update the order with mechanic details + status
        order.status = "Mechanic Assigned";
        order.assignedMechanic = `${mechanic.firstName} ${mechanic.lastName}`;
        order.mechanicId = mechanic._id;

        // Save updated order
        await order.save();

        return res.status(200).json({
            message: "Mechanic updated successfully & referral logic applied",
            data: order,
        });

    } catch (error) {
        console.error("Error updating mechanic:", error);
        return res.status(500).json({ message: "Server error while updating mechanic" });
    }
};

export const updateDelivery = async (req, res) => {
    try {
        const { id } = req.params; // Order ID
        const { deliveryId } = req.body; // Delivery person ID

        if (!deliveryId) {
            return res.status(400).json({ message: "Delivery person ID is required" });
        }

        const deliveryPerson = await Employee.findById(deliveryId);
        if (!deliveryPerson) {
            return res.status(404).json({ message: "Delivery person not found" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                assignedDelivery: `${deliveryPerson.firstName} ${deliveryPerson.lastName}`, // Update assignedDelivery with the delivery person's name
                deliveryId: deliveryPerson._id, // Update deliveryId with the delivery person's ID
            },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Delivery person updated successfully", data: updatedOrder });
    } catch (error) {
        console.error("Error updating delivery person:", error);
        res.status(500).json({ message: "Server error while updating delivery person" });
    }
};

export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params; // Order ID
        const { vendorId } = req.body; // Vendor ID

        if (!vendorId) {
            return res.status(400).json({ message: "Vendor ID is required" });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                assignedVendor: `${vendor.firstName} ${vendor.lastName}`, // Update assignedVendor with the vendor's name
                vendorId: vendor._id, // Update vendorId with the vendor's ID
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Vendor updated successfully", data: updatedOrder });
    } catch (error) {
        console.error("Error updating vendor:", error);
        res.status(500).json({ message: "Server error while updating vendor" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from the request parameters
        const { status } = req.body; // Extract the updated status from the request body

        // Validate input
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        // Update the order status
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status }, // Update the status field
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Server error while updating order status" });
    }
};


export const getAllBookingsByEmployee = async (req, res) => {
    const { employeeId } = req.params;
    try {
        // Fetch all bookings assigned to the given employee ID (mechanicId, deliveryId, or vendorId)
        const orders = await Order.find({
            $or: [
                { mechanicId: employeeId },
                { deliveryId: employeeId },
                { vendorId: employeeId }
            ]
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No bookings found for this employee." });
        }

        res.status(200).json({ message: "Orders fetched successfully", data: orders });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllBookingsByVendor = async (req, res) => {
    const { vendorId } = req.params;
    try {
        // Fetch all bookings assigned to the given vendor ID
        const orders = await Order.find({ vendorId: vendorId });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No bookings found for this vendor." });
        }

        res.status(200).json({ message: "Bookings fetched successfully", data: orders });
    } catch (error) {
        console.error("Error fetching bookings by vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const updatePartsUsed = async (req, res) => {
    const { id } = req.params;
    const { partsUsed } = req.body;
    console.log(id)
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Replace the entire partsUsed array with new data
        order.partsUsed = partsUsed.map(part => ({
            partName: part.partName,
            quantity: part.quantity,
            price: 0, // Default price 0
            discountPrice: 0 // Optional: include if your schema allows it
        }));

        await order.save();

        res.status(200).json({ message: 'Parts updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating parts' });
    }
};
export const updatePartsPrice = async (req, res) => {
    const { id } = req.params; // Order ID
    const { partsUsed, pricing } = req.body; // Array of partsUsed and pricing object

    try {
        // 1. Find the order
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // 2. Update order's partsUsed (without discountPrice)
        order.partsUsed = partsUsed.map(part => ({
            partName: part.partName,
            quantity: part.quantity,
            price: part.price
        }));

        // 3. Save the updated order
        await order.save();

        // 4. Check if a VendorOrder with the given orderId already exists
        let vendorOrder = await VendorOrder.findOne({ orderId: order._id });

        if (vendorOrder) {
            // Update the existing VendorOrder
            vendorOrder.partsUsed = partsUsed.map(part => ({
                partName: part.partName,
                quantity: part.quantity,
                price: part.price,
                discountPrice: part.discountPrice // Save discountPrice only in VendorOrder
            }));
            vendorOrder.pricing = {
                subTotal: pricing.subTotal,
                discountType: pricing.discountType,
                discountAmount: pricing.discountAmount,
                total: pricing.total
            };
            vendorOrder.orderDate = new Date(); // Update the order date
            await vendorOrder.save();
        } else {
            // Create a new VendorOrder document
            vendorOrder = new VendorOrder({
                orderId: order._id,
                partsUsed: partsUsed.map(part => ({
                    partName: part.partName,
                    quantity: part.quantity,
                    price: part.price,
                    discountPrice: part.discountPrice // Save discountPrice only in VendorOrder
                })),
                pricing: {
                    subTotal: pricing.subTotal,
                    discountType: pricing.discountType,
                    discountAmount: pricing.discountAmount,
                    total: pricing.total
                },
                vendorId: order.vendorId,
                deliveryBoyId: order.deliveryId,
                deliveryBoyName: order.assignedDelivery,
                orderDate: new Date()
            });
            await vendorOrder.save();
        }

        // 5. Send response
        res.status(200).json({
            message: 'Parts pricing updated successfully',
            order,
            vendorOrder
        });

    } catch (error) {
        console.error('Error updating parts pricing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateOrderandGenerateInvoice = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    console.log("Update Order and Generate Invoice Data:", data);

    try {
        // Separate parts and services
        const partsUsed = data.partsAndServices
            .filter((item) => item.type === "part")
            .map((item) => ({
                partName: item.name,
                quantity: item.quantity,
                price: item.price,
                discountPrice: item.discountPrice,
                discountType: item.discountType,
            }));

        const serviceProvided = data.partsAndServices
            .filter((item) => item.type === "service")
            .map((item) => ({
                serviceName: item.name,
                quantity: item.quantity,
                price: item.price,
                discountPrice: item.discountPrice,
            }));

        // Build updated fields
        const updatedFields = {
            invoiceDate: data.invoiceDetails.invoiceDate,
            partsUsed,
            serviceProvided,
            status: "Invoice Generated",
            total: {
                subTotal: data.total.subtotal,
                discount: data.total.discount,
                discountType: data.total.discountType,
                referralDiscount: data.total.referralDiscount || 0,
                total: data.total.total,
            },
        };

        // Update order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ---- Referral Discount Subtraction (for personal account) ----
        if (data.total.referralDiscount && data.total.referralDiscount > 0) {
            const user = await User.findById(updatedOrder.userId);

            if (user && user.accountType === "personal") {
                if (user.referralAmount >= data.total.referralDiscount) {
                    user.referralAmount -= data.total.referralDiscount; // subtract discount
                    user.totalWithdrawn += data.total.referralDiscount; // add to total withdrawn
                } else {
                    // If discount > available balance, set to 0 (avoid negative)
                    user.referralAmount = 0;
                }

                await user.save();
                console.log(
                    `Referral discount of ${data.total.referralDiscount} applied for user ${user.firstName}`
                );
            }
        }

        // ---- Referral Earning Logic (referredBy flow) ----
        if (!updatedOrder.referralProcessed) {
            const user = await User.findById(updatedOrder.userId);
            if (user?.referredBy) {
                const referee = await User.findOne({ referralCode: user.referredBy });

                if (referee) {
                    const userOrderCount = await Order.countDocuments({
                        userId: user._id,
                    });

                    if (referee.accountType === "personal") {
                        if (userOrderCount === 1) {
                            referee.pendingReferralAmount = Math.max(
                                0,
                                referee.pendingReferralAmount - 50
                            );
                            referee.referralAmount = (referee.referralAmount || 0) + 50;
                        }
                    } else if (referee.accountType === "business") {
                        const orderTotal = updatedOrder.total.total || 0;
                        console.log(orderTotal)
                        if (orderTotal >= 5000) {
                            referee.referralAmount = (referee.referralAmount || 0) + 249;
                        } else if (orderTotal >= 3500) {
                            referee.referralAmount = (referee.referralAmount || 0) + 149;
                        } else if (orderTotal >= 2000) {
                            referee.referralAmount = (referee.referralAmount || 0) + 50;
                        }
                    }

                    await referee.save();

                    updatedOrder.referralProcessed = true;
                    await updatedOrder.save();
                }
                // ---- Send Booking Confirmation Email ----
                await sendRefereeEmail(referee);
            }
        }


        res.status(200).json({
            message:
                "Order updated, invoice generated, referral discount applied (if any), and referral logic executed",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};



export const userOrder = async (req, res) => {
    try {
        const {
            userId,
            name,
            contactNo,
            email,
            city,
            selectedBrand,
            selectedModel,
            modelName,
            cc,
            bs, // corrected spelling
            services,
            otherService,
            preferredDate,
            preferredTime,

            issues
        } = req.body;
        const { latitude, longitude } = req.body.location;
        console.log(req.body);
        console.log(latitude, longitude);

        if (!name || !contactNo || !city || !selectedBrand || !selectedModel || !cc || !services.length || !preferredDate || !preferredTime) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format today's date as DDMMYY
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const todayFormatted = `${dd}${mm}${yy}`;

        // Get the latest order globally
        const latestOrder = await Order.findOne({})
            .sort({ createdAt: -1 })
            .lean();

        let serial = 1;
        if (latestOrder && latestOrder.orderId) {
            const parts = latestOrder.orderId.split('-');
            if (parts.length === 3) {
                const lastSerial = parseInt(parts[2], 10);
                if (!isNaN(lastSerial)) {
                    serial = lastSerial + 1;
                }
            }
        }

        const orderId = `ORD-${todayFormatted}-${String(serial).padStart(3, '0')}`;

        const newOrder = new Order({
            orderId,
            userId,
            name,
            contactNo,
            email,
            city,
            location: {
                latitude,
                longitude
            },
            selectedBrand,
            selectedModel,
            modelName,
            cc,
            bs,
            services,
            otherService,
            preferredDate,
            preferredTime,

            issues
        });

        const savedOrder = await newOrder.save();
        await sendBookingConfirmationEmail(newOrder, user.email);

        return res.status(201).json({
            message: 'Order Confirmed!',
            data: savedOrder
        });

    } catch (error) {
        console.error("Error Creating Order:", error);
        return res.status(500).json({ message: 'Server error while creating Order' });
    }
};



export const getOrderByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const orders = await Order.find({ email });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found' });
        }

        return res.status(200).json({
            message: 'Orders fetched successfully',
            orders: orders
        });

    } catch (error) {
        console.error("Error Fetching Orders:", error);
        return res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

export const cancelOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'Cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        order.status = 'Cancelled';
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Server error while cancelling order' });
    }
};

export const getOrdersByPosition = async (req, res) => {
    const { position, employeeId } = req.query; // or from req.params if using route params

    if (!position || !employeeId) {
        return res.status(400).json({ message: 'Position and employeeId are required.' });
    }

    try {
        let filter = {};

        switch (position.toLowerCase()) {
            case 'delivery':
                filter = { deliveryId: employeeId };
                break;
            case 'mechanic':
                filter = { mechanicId: employeeId };
                break;
            default:
                return res.status(400).json({ message: 'Invalid position provided.' });
        }

        const orders = await Order.find(filter);
        res.status(200).json(orders);

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Completed Orders 
export const completedOrders = async (req, res) => {
    const { timeFrame } = req.query;

    try {
        let matchStage = { status: 'Invoice Generated' };
        let groupBy, format;

        const now = new Date();

        if (timeFrame === 'month') {
            // Group by day of current month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            matchStage.createdAt = {
                $gte: startOfMonth,
                $lte: endOfMonth,
            };

            groupBy = { $dayOfMonth: '$createdAt' };
            format = d => ({ label: `Date ${d._id}`, count: d.count });

        } else {
            // Default: Group by month in current year
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

            matchStage.createdAt = {
                $gte: startOfYear,
                $lte: endOfYear,
            };

            groupBy = { $month: '$createdAt' };
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            format = d => ({ label: monthNames[d._id - 1], count: d.count });
        }

        const result = await Order.aggregate([
            { $match: matchStage },
            { $group: { _id: groupBy, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const formatted = result.map(format);
        res.status(200).json(formatted);
    } catch (error) {
        console.error('Error in completedOrders:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}
// /api/admin/order/orderstatus/completed-orders

export const completeRevenue = async (req, res) => {
    const { timeFrame } = req.query;
    const now = new Date();
    let matchStage = { status: 'Invoice Generated' };
    let groupStage = {};
    let formatFn;

    if (timeFrame === 'month') {
        // Current month - daily revenue
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        matchStage.createdAt = { $gte: start, $lte: end };
        groupStage = {
            _id: { $dayOfMonth: "$createdAt" },
            revenue: { $sum: "$total.total" }
        };
        formatFn = d => ({ label: `Date ${d._id}`, revenue: d.revenue });
    } else if (timeFrame === 'last6') {
        // Last 6 months
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        matchStage.createdAt = { $gte: sixMonthsAgo, $lte: now };
        groupStage = {
            _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
            },
            revenue: { $sum: "$total.total" }
        };
        formatFn = d => {
            const date = new Date(d._id.year, d._id.month - 1);
            return { label: date.toLocaleString('default', { month: 'long' }), revenue: d.revenue };
        };
    } else {
        // Full current year - monthly
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        matchStage.createdAt = { $gte: start, $lte: end };
        groupStage = {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$total.total" }
        };
        formatFn = d => {
            const monthName = new Date(now.getFullYear(), d._id - 1).toLocaleString('default', { month: 'long' });
            return { label: monthName, revenue: d.revenue };
        };
    }

    try {
        const result = await Order.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: { "_id": 1 } }
        ]);

        const formatted = result.map(formatFn);
        res.status(200).json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}
