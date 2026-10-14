import ChatMessage from "../Models/chatModel.js";
import Order from "../Models/orderModel.js";
import { generateReplySuggestions, trailingAgentCount, GeminiError } from "../services/geminiService.js";
import { handleChatPushNotification, markChatNotificationsRead } from "../services/chatNotification.js";

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

        // Customer opened the conversation → their "reply" notifications are seen
        if (page === 1) markChatNotificationsRead(order._id, userId);

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
        io.of("/chat").to("admin-global").emit("admin-list-refresh", chatMessage.orderId.toString());

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
        const limit = parseInt(req.query.limit) || 500; // staff view: default must not hide the newest messages in long chats
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

        // Staff opened the conversation → their "new message" notifications are seen
        if (page === 1) markChatNotificationsRead(order._id, req.user._id);

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
        io.of("/chat").to("admin-global").emit("admin-list-refresh", chatMessage.orderId.toString());

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

// AI quick-reply suggestions (3) for the agent, based on the order + recent chat.
// Gemini is called from here so the API key never reaches the browser.
export const getReplySuggestions = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Last 12 messages from BOTH sides (customer + agent) so the AI sees the whole recent conversation
        const recent = await ChatMessage.find({ orderId }).sort({ createdAt: -1 }).limit(12);
        const messages = recent.reverse();
        if (!messages.length) return res.json({ suggestions: [], language: null });
        // Agent already sent 3 messages in a row after the customer: stop suggesting more follow-ups
        if (trailingAgentCount(messages) >= 3) return res.json({ suggestions: [], language: null });

        const { suggestions, language } = await generateReplySuggestions({ order, messages });
        res.json({ suggestions, language });
    } catch (error) {
        if (error instanceof GeminiError) return res.status(error.status).json({ message: error.message });
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
