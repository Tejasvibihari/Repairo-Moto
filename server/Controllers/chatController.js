import ChatMessage from "../Models/chatModel.js";
import Order from "../Models/orderModel.js";
import { handleChatPushNotification } from "../services/chatNotification.js";

// ------------------- User Helpers -------------------
export const getUserMessages = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(403).json({ message: "Access denied to this order" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await ChatMessage.find({ orderId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);
        const total = await ChatMessage.countDocuments({ orderId });

        res.json({
            messages,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Send message as user (REST fallback – also emits via socket)
export const sendUserMessage = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { message, attachments } = req.body;
        const userId = req.user._id;

        if (!message?.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(403).json({ message: "Access denied to this order" });
        }

        const chatMessage = new ChatMessage({
            orderId,
            senderType: "user",
            senderId: userId,
            message: message.trim(),
            attachments: attachments || [],
        });
        await chatMessage.save();

        // Emit real-time event to all clients in the order room
        const io = req.app.get("io");
        io.of("/chat").to(orderId.toString()).emit("new-message", chatMessage);
        io.of("/chat").to("admin-global").emit("admin-list-refresh", chatMessage.orderId);

        handleChatPushNotification(io, chatMessage);

        res.status(201).json(chatMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ------------------- Admin/Employee Helpers -------------------
export const getChatOrdersList = async (req, res) => {
    try {
        const chatOrders = await ChatMessage.aggregate([
            { $group: { _id: "$orderId", lastMessageAt: { $max: "$createdAt" } } },
            { $sort: { lastMessageAt: -1 } },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "_id",
                    as: "orderDetails",
                },
            },
            { $unwind: "$orderDetails" },
            {
                $project: {
                    orderId: "$_id",
                    orderNumber: "$orderDetails.orderId",
                    customerName: "$orderDetails.name",
                    customerPhone: "$orderDetails.contactNo",
                    status: "$orderDetails.status",
                    lastMessageAt: 1,
                },
            },
        ]);
        res.json(chatOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAdminMessages = async (req, res) => {
    try {
        const { orderId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const messages = await ChatMessage.find({ orderId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);
        const total = await ChatMessage.countDocuments({ orderId });

        // Mark user messages as read
        await ChatMessage.updateMany(
            { orderId, senderType: "user", isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        res.json({
            messages,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const sendAdminMessage = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { message, attachments } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const senderType = req.user.role === "Admin" ? "admin" : "employee";
        const senderId = req.user._id;

        const chatMessage = new ChatMessage({
            orderId,
            senderType,
            senderId,
            message: message.trim(),
            attachments: attachments || [],
        });
        await chatMessage.save();

        // Emit real-time event
        const io = req.app.get("io");
        io.of("/chat").to(orderId.toString()).emit("new-message", chatMessage);
        io.of("/chat").to("admin-global").emit("admin-list-refresh", chatMessage.orderId);

        handleChatPushNotification(io, chatMessage);

        res.status(201).json(chatMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUnreadCounts = async (req, res) => {
    try {
        const unreadAgg = await ChatMessage.aggregate([
            { $match: { senderType: "user", isRead: false } },
            { $group: { _id: "$orderId", count: { $sum: 1 } } },
        ]);
        const result = {};
        unreadAgg.forEach((item) => (result[item._id] = item.count));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};