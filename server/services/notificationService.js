import Notification from '../Models/notificationModel.js';
import Employee from '../Models/employeeModel.js';
import Admin from '../Models/adminModel.js';
import { sendPushToRecipients } from './pushService.js';
import User from '../Models/userModel.js';
/**
 * Create a notification in DB and fire push notifications.
 *
 * @param {object} opts
 * @param {'new_order'|'order_assigned'|'order_update'|'order_cancelled'|'invoice_generated'|'delivery_update'|'general'} opts.type
 * @param {string} opts.title
 * @param {string} opts.body
 * @param {Array<{userId, userModel, role}>} opts.recipients  — build with helpers below
 * @param {string|null} opts.orderId
 * @param {object} opts.data                                  — extra data for frontend nav
 * @param {{userId, userModel}|null} opts.triggeredBy
 */
export async function createNotification({
    type,
    title,
    body,
    recipients,
    orderId = null,
    data = {},
    triggeredBy = null,
}) {
    if (!recipients?.length) return null;

    // 1. Save to DB
    const notification = await Notification.create({
        recipients: recipients.map(r => ({
            userId: r.userId,
            userModel: r.userModel,
            role: r.role,
            isRead: false,
        })),
        title,
        body,
        type,
        orderId,
        data,
        triggeredBy,
    });

    // 2. Fire push (non-blocking — don't await so order creation stays fast)
    // Include the MongoDB notification ID in the push data so client can use it to mark as read
    sendPushToRecipients(recipients, {
        title,
        body,
        data: {
            ...data,
            type,
            orderId,
            notificationId: notification._id.toString()  // ← Include MongoDB ID for client
        }
    })
        .catch(err => console.error('Push send failed:', err));

    return notification;
}

// ─── Recipient builder helpers ─────────────────────────────────────────────────

/** Get all admins as recipients */
export async function getAdminRecipients() {
    const admins = await Admin.find({}, '_id').lean();
    return admins.map(a => ({ userId: a._id, userModel: 'Admin', role: 'admin' }));
}

/** Get all mechanics as recipients */
export async function getMechanicRecipients() {
    const mechanics = await Employee.find({ position: 'mechanic' }, '_id').lean();
    return mechanics.map(m => ({ userId: m._id, userModel: 'Employee', role: 'mechanic' }));
}

/** Get a single user as recipient */
export function getUserRecipient(userId) {
    return [{ userId, userModel: 'User', role: 'user' }];
}

/** Get a single employee as recipient */
export function getEmployeeRecipient(userId, role = 'employee') {
    return [{ userId, userModel: 'Employee', role }];
}