import Order from "../Models/orderModel.js";
import Admin from "../Models/adminModel.js";
import Employee from "../Models/employeeModel.js";
import Notification from "../Models/notificationModel.js";
import { createNotification } from "./notificationService.js";

// Staff who work the support chat (must match Middleware/authAdmin.js allowedPositions).
const CHAT_STAFF_POSITIONS = ["manager", "operational manager", "telecaller"];

// Notification.recipients.role values (see Models/notificationModel.js)
const ROLE_FOR_POSITION = {
    telecaller: "telecaller",
    "operational manager": "ops_manager",
    manager: "employee",
};

const fullName = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();

const briefOf = (text = "") => (text.length > 80 ? `${text.slice(0, 80)}...` : text);

/**
 * Is this socket looking at the chat for `orderId` right now?
 *
 *  - Clients that report visibility (event "chat-visibility") are trusted: only the
 *    chat screen in the foreground counts. This is what stops the admin *list* screen
 *    (which joins rooms only to get live previews) or a backgrounded app from being
 *    mistaken for "someone is reading this chat" and silencing the push.
 *  - Older app builds never report. Customers only join a room from the chat screen, so
 *    for them room membership is a fair proxy. Staff on old builds are treated as
 *    not viewing, so they still get the push (worst case: a banner while chat is open).
 */
const isViewing = (socket, orderId) => {
    if (!socket?.user) return false;
    if (socket.viewingOrderId !== undefined) return socket.viewingOrderId === orderId;
    return socket.user.type === "user";
};

/** Set of user ids (as strings) that are actively viewing this order's chat. */
const getViewerIds = (io, orderId) => {
    const viewers = new Set();
    try {
        const ns = io.of("/chat");
        const room = ns.adapter.rooms.get(orderId);
        if (!room) return viewers;
        for (const socketId of room) {
            const socket = ns.sockets.get(socketId);
            if (isViewing(socket, orderId)) viewers.add(String(socket.user.id));
        }
    } catch (err) {
        console.error("Error checking chat viewers:", err);
    }
    return viewers;
};

/** Every admin + every manager / operational manager / telecaller. */
const getChatStaffRecipients = async () => {
    const [admins, employees] = await Promise.all([
        Admin.find({}, "_id").lean(),
        Employee.find({ position: { $in: CHAT_STAFF_POSITIONS } }, "_id position").lean(),
    ]);
    return [
        ...admins.map((a) => ({ userId: a._id, userModel: "Admin", role: "admin" })),
        ...employees.map((e) => ({
            userId: e._id,
            userModel: "Employee",
            role: ROLE_FOR_POSITION[e.position] || "employee",
        })),
    ];
};

const getSenderName = async (chatMessage) => {
    try {
        if (chatMessage.senderType === "admin") {
            const admin = await Admin.findById(chatMessage.senderId).select("firstName lastName").lean();
            return fullName(admin);
        }
        const emp = await Employee.findById(chatMessage.senderId).select("firstName lastName").lean();
        return fullName(emp);
    } catch {
        return "";
    }
};

/**
 * Notify the other side of a support chat message (push + in-app notification list).
 *
 *  customer → every admin and telecaller/manager (except anyone already viewing this chat)
 *  admin/telecaller → the customer who owns the order (unless they are viewing this chat)
 *
 * Never throws: a failed notification must not fail the message that triggered it.
 *
 * @param {Object} io          global socket.io instance
 * @param {Object} chatMessage the freshly saved ChatMessage document
 */
export const handleChatPushNotification = async (io, chatMessage) => {
    try {
        const orderIdStr = chatMessage.orderId.toString();
        const order = await Order.findById(chatMessage.orderId).select("orderId name userId").lean();
        if (!order) return;

        const brief = briefOf(chatMessage.message);
        const viewers = getViewerIds(io, orderIdStr);
        const baseData = {
            orderId: orderIdStr,
            screenOrderId: order.orderId,
            customerName: order.name,
            messageId: chatMessage._id.toString(),
            senderType: chatMessage.senderType,
        };

        if (chatMessage.senderType === "user") {
            const recipients = (await getChatStaffRecipients()).filter(
                (r) => !viewers.has(String(r.userId))
            );
            if (!recipients.length) return;

            await createNotification({
                type: "chat",
                title: `New message from ${order.name || "Customer"}`,
                body: `Order #${order.orderId}: ${brief}`,
                recipients,
                orderId: order._id,
                data: baseData,
                triggeredBy: { userId: chatMessage.senderId, userModel: "User" },
            });
            return;
        }

        // Sender is admin / employee → tell the customer
        if (!order.userId || viewers.has(String(order.userId))) return;

        const senderName = (await getSenderName(chatMessage)) || "Repairo Support";
        await createNotification({
            type: "chat",
            title: `Reply on order #${order.orderId}`,
            body: `${senderName}: ${brief}`,
            recipients: [{ userId: order.userId, userModel: "User", role: "user" }],
            orderId: order._id,
            data: baseData,
            triggeredBy: {
                userId: chatMessage.senderId,
                userModel: chatMessage.senderType === "admin" ? "Admin" : "Employee",
            },
        });
    } catch (err) {
        console.error("Error in handleChatPushNotification:", err);
    }
};

/**
 * Mark this person's unread chat notifications for an order as read
 * (called when they open the conversation) so the bell badge stays accurate.
 */
export const markChatNotificationsRead = async (orderId, userId) => {
    try {
        await Notification.updateMany(
            { type: "chat", orderId, recipients: { $elemMatch: { userId, isRead: false } } },
            { $set: { "recipients.$[r].isRead": true, "recipients.$[r].readAt": new Date() } },
            { arrayFilters: [{ "r.userId": userId, "r.isRead": false }] }
        );
    } catch (err) {
        console.error("Error marking chat notifications read:", err);
    }
};
