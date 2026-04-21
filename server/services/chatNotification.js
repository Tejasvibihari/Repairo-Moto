import { sendPushToRecipients } from "./pushService.js";
import Order from "../Models/orderModel.js";
import Admin from "../Models/adminModel.js";
import Employee from "../Models/employeeModel.js";
import User from "../Models/userModel.js";

/**
 * Helper to check if a specific type of user is actively connected to the chat room.
 * @param {Object} chatNamespace - the socket.io /chat namespace
 * @param {String} orderId - the room ID
 * @param {String} targetType - the user type to check ("user" or "admin_employee")
 * @returns {Boolean}
 */
const isTargetInRoom = async (chatNamespace, orderId, targetType) => {
    try {
        const room = chatNamespace.adapter.rooms.get(orderId.toString());
        if (!room) return false;

        for (const socketId of room) {
            const socket = chatNamespace.sockets.get(socketId);
            if (socket?.user) {
                if (targetType === "user" && socket.user.type === "user") {
                    return true;
                }
                if (targetType === "admin_employee" && ["admin", "employee"].includes(socket.user.type)) {
                    return true;
                }
            }
        }
        return false;
    } catch (err) {
        console.error("Error checking room occupants:", err);
        return false;
    }
};

/**
 * Dispatch chat push notifications intelligently based on room presence.
 * @param {Object} io - the global socket.io instance
 * @param {Object} chatMessage - the newly saved ChatMessage document
 */
export const handleChatPushNotification = async (io, chatMessage) => {
    try {
        const chatNamespace = io.of("/chat");
        const orderIdStr = chatMessage.orderId.toString();

        const senderType = chatMessage.senderType; // "user", "admin", "employee"
        const brief = chatMessage.message.length > 50 ? chatMessage.message.substring(0, 50) + "..." : chatMessage.message;
        
        const order = await Order.findById(chatMessage.orderId);
        if (!order) return;

        if (senderType === "user") {
            const senderInfo = await User.findById(chatMessage.senderId).select("firstName lastName");
            const senderName = senderInfo ? `${senderInfo.firstName || ""} ${senderInfo.lastName || ""}`.trim() : "Customer";
            const title = `New message from ${senderName || "Customer"}`;
            
            // Check if admin or employee is in room
            const adminInRoom = await isTargetInRoom(chatNamespace, orderIdStr, "admin_employee");
            if (!adminInRoom) {
                // Find target admins and specific employees
                const admins = await Admin.find({}, "_id").lean();
                const employees = await Employee.find({ position: { $in: ["manager", "operational manager", "telecaller"] } }, "_id").lean();
                
                const recipients = [
                    ...admins.map(a => ({ userId: a._id, userModel: 'Admin' })),
                    ...employees.map(e => ({ userId: e._id, userModel: 'Employee' }))
                ];
                
                await sendPushToRecipients(recipients, { title, body: brief, data: { orderId: orderIdStr, type: "chat" } });
            }
        } else {
            // Sender is admin or employee
            let senderName = "Repairo Support";
            if (senderType === "admin") {
                const admin = await Admin.findById(chatMessage.senderId).select("name");
                if (admin?.name) senderName = admin.name;
            } else {
                const emp = await Employee.findById(chatMessage.senderId).select("firstName lastName");
                if (emp) senderName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Repairo Support";
            }

            const title = `Support update: ${senderName}`;
            
            // Check if user is in room
            const userInRoom = await isTargetInRoom(chatNamespace, orderIdStr, "user");
            if (!userInRoom) {
                const recipients = [{ userId: order.userId, userModel: 'User' }];
                await sendPushToRecipients(recipients, { title, body: brief, data: { orderId: orderIdStr, type: "chat" } });
            }
        }
    } catch (err) {
        console.error("Error in handleChatPushNotification:", err);
    }
};
