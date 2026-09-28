import ChatMessage from "../Models/chatModel.js";
import Order from "../Models/orderModel.js";
import User from "../Models/userModel.js";
import Admin from "../Models/adminModel.js";
import Employee from "../Models/employeeModel.js";
import jwt from "jsonwebtoken";
import { handleChatPushNotification } from "../services/chatNotification.js";

// Helper: authenticate socket connection using JWT.
// Each secret is tried on its own — a token signed with the admin/employee secret
// throws on the user secret, and that used to abort the whole lookup (returning null).
const verifyWith = (token, secret) => {
    if (!secret) return null;
    try {
        return jwt.verify(token, secret);
    } catch {
        return null;
    }
};

const authenticateSocket = async (token) => {
    try {
        const userDecoded = verifyWith(token, process.env.USER_JWT_SECRET);
        if (userDecoded?.id) {
            const user = await User.findById(userDecoded.id).select("-password");
            if (user) return { id: user._id, type: "user", model: user };
        }

        for (const secret of [process.env.ADMIN_JWT_SECRET, process.env.EMPLOYEE_JWT_SECRET]) {
            const decoded = verifyWith(token, secret);
            if (!decoded?.id) continue;
            const admin = await Admin.findById(decoded.id).select("-password");
            if (admin) return { id: admin._id, type: "admin", model: admin };
            const employee = await Employee.findById(decoded.id).select("-password");
            if (employee) return { id: employee._id, type: "employee", model: employee };
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const setupChatSockets = (io) => {
    const chatNamespace = io.of("/chat");

    // Authentication middleware for namespace
    chatNamespace.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication required"));
        const user = await authenticateSocket(token);
        if (!user) return next(new Error("Invalid token"));
        socket.user = user;
        next();
    });

    chatNamespace.on("connection", (socket) => {
        console.log(`✅ ${socket.user.type} ${socket.user.id} connected`);

        // Auto join global channel for live list updates
        if (socket.user.type === "admin" || socket.user.type === "employee") {
            socket.join("admin-global");
        }

        // Join a specific order room
        socket.on("join-order", async (orderId, callback) => {
            try {
                // Verify access
                let hasAccess = false;
                if (socket.user.type === "user") {
                    const order = await Order.findOne({ _id: orderId, userId: socket.user.id });
                    if (order) hasAccess = true;
                } else {
                    // Admin or employee can join any order
                    const order = await Order.findById(orderId);
                    if (order) hasAccess = true;
                }

                if (!hasAccess) {
                    if (callback) callback({ error: "Access denied to this order" });
                    return;
                }

                // Leave previous rooms (except the default)
                const previousRooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
                previousRooms.forEach((room) => socket.leave(room));

                socket.join(orderId);
                socket.currentOrderId = orderId;
                // Moving to another room ends any "viewing" state for the old one
                if (socket.viewingOrderId && socket.viewingOrderId !== String(orderId)) {
                    socket.viewingOrderId = null;
                }

                if (callback) callback({ success: true, orderId });
                console.log(`${socket.user.type} joined room ${orderId}`);
            } catch (err) {
                console.error(err);
                if (callback) callback({ error: err.message });
            }
        });

        // Handle sending a message via WebSocket
        socket.on("send-message", async (data, callback) => {
            const { orderId, message, attachments = [] } = data;
            if (!orderId || !message?.trim()) {
                if (callback) callback({ error: "Message text required" });
                return;
            }

            // Ensure user is in the correct room
            if (!socket.rooms.has(orderId)) {
                if (callback) callback({ error: "You must join the order room first" });
                return;
            }

            // Determine sender type
            let senderType = socket.user.type;
            if (senderType === "user") senderType = "user";
            else if (senderType === "admin") senderType = "admin";
            else if (senderType === "employee") senderType = "employee";

            const chatMessage = new ChatMessage({
                orderId,
                senderType,
                senderId: socket.user.id,
                message: message.trim(),
                attachments,
            });
            await chatMessage.save();

            // Broadcast to everyone in the room (including sender)
            chatNamespace.to(orderId).emit("new-message", chatMessage);
            chatNamespace.to("admin-global").emit("admin-list-refresh", chatMessage.orderId.toString());

            // Handle Push Notification based on occupancy
            handleChatPushNotification(io, chatMessage);

            if (callback) callback({ success: true, message: chatMessage });
        });

        // The chat screen tells us when it is actually on screen (foreground) or not.
        // Push notifications are skipped only for people who are really looking at the chat.
        socket.on("chat-visibility", ({ orderId, visible } = {}, callback) => {
            if (orderId && socket.rooms.has(String(orderId))) {
                socket.viewingOrderId = visible ? String(orderId) : null;
                if (callback) callback({ success: true });
            } else if (callback) {
                callback({ error: "Join the order room first" });
            }
        });

        // Typing indicator (optional)
        socket.on("typing", ({ orderId, isTyping }) => {
            if (orderId && socket.rooms.has(orderId)) {
                socket.to(orderId).emit("user-typing", {
                    userId: socket.user.id,
                    userType: socket.user.type,
                    isTyping,
                });
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ ${socket.user.type} ${socket.user.id} disconnected`);
        });
    });
};