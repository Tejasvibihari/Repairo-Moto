import ChatMessage from "../Models/chatModel.js";
import Order from "../Models/orderModel.js";
import User from "../Models/userModel.js";
import Admin from "../Models/adminModel.js";
import Employee from "../Models/employeeModel.js";
import jwt from "jsonwebtoken";

// Helper: authenticate socket connection using JWT
const authenticateSocket = async (token) => {
    try {
        // Try user token first
        let decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
        let user = await User.findById(decoded.id).select("-password");
        if (user) return { id: user._id, type: "user", model: user };

        // Then admin/employee tokens
        const secrets = [process.env.ADMIN_JWT_SECRET, process.env.EMPLOYEE_JWT_SECRET];
        for (const secret of secrets) {
            try {
                decoded = jwt.verify(token, secret);
                let admin = await Admin.findById(decoded.id).select("-password");
                if (admin) return { id: admin._id, type: "admin", model: admin };
                let employee = await Employee.findById(decoded.id).select("-password");
                if (employee) return { id: employee._id, type: "employee", model: employee };
            } catch (err) { }
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

            if (callback) callback({ success: true, message: chatMessage });
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