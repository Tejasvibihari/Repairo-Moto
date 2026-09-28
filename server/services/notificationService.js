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
    console.log('Final recipients being saved:', JSON.stringify(recipients, null, 2));
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

/** Get a single vendor as recipient */
export function getVendorRecipient(userId) {
    return [{ userId, userModel: 'Vendor', role: 'vendor' }];
}

// ─── Order-level fan-out ───────────────────────────────────────────────────────

const idOf = (v) => (v && v._id ? v._id : v);
const sameId = (a, b) => a && b && String(idOf(a)) === String(idOf(b));

/** Managers / operational managers see every order event alongside admins. */
export async function getManagerRecipients() {
    const managers = await Employee.find(
        { position: { $in: ['manager', 'operational manager'] } },
        '_id position'
    ).lean();
    return managers.map(m => ({
        userId: m._id,
        userModel: 'Employee',
        role: m.position === 'manager' ? 'employee' : 'ops_manager',
    }));
}

/** Staff = admins + managers + everyone attached to this order. */
export async function getOrderStaffRecipients(order) {
    const list = [
        ...(await getAdminRecipients()),
        ...(await getManagerRecipients()),
        ...(order.mechanicIds || []).map(id => ({ userId: idOf(id), userModel: 'Employee', role: 'mechanic' })),
    ];
    if (order.deliveryId) list.push({ userId: idOf(order.deliveryId), userModel: 'Employee', role: 'delivery' });
    if (order.vendorId) list.push({ userId: idOf(order.vendorId), userModel: 'Vendor', role: 'vendor' });
    return list;
}

function dedupe(recipients, actor) {
    const seen = new Set();
    return recipients.filter(r => {
        const key = String(r.userId);
        if (seen.has(key)) return false;
        seen.add(key);
        // never notify the person who just performed the action
        return !(actor && sameId(r.userId, actor.userId));
    });
}

/**
 * One call = every party on the order hears about the event.
 *
 * @param {object} order                Mongoose order (userId may be populated)
 * @param {object} opts
 * @param {string} opts.type            Notification type (see notificationModel)
 * @param {{title,body}|null} opts.user   Message for the customer (null = skip customer)
 * @param {{title,body}|null} opts.staff  Message for admin/manager/mechanic/delivery/vendor (null = skip)
 * @param {{userId, userModel}|null} opts.actor  Who did it — excluded from recipients, saved as triggeredBy
 * @param {object} opts.data            Extra deep-link data (never put secrets like OTPs here — staff copies share it)
 * @param {string[]} opts.skipRoles     Recipient roles to leave out (e.g. ['mechanic'] when the mechanic did it)
 *
 * Never throws: a failed notification must not fail the order update that triggered it.
 */
export async function notifyOrderParties(order, { type, user = null, staff = null, actor = null, data = {}, skipRoles = [] }) {
    const payload = {
        orderId: String(order._id),
        screenOrderId: order.orderId,
        ...data,
    };
    const base = { type, orderId: order._id, data: payload, triggeredBy: actor };

    try {
        if (user && order.userId) {
            const recipients = dedupe(getUserRecipient(idOf(order.userId)), actor);
            if (recipients.length) await createNotification({ ...base, ...user, recipients });
        }
        if (staff) {
            const recipients = dedupe(await getOrderStaffRecipients(order), actor)
                .filter(r => !skipRoles.includes(r.role));
            if (recipients.length) await createNotification({ ...base, ...staff, recipients });
        }
    } catch (err) {
        console.error(`[notifyOrderParties:${type}] failed:`, err);
    }
}

/** Build the `actor` / `cancelledBy` info from whatever the auth middleware put on req.user. */
export function actorFromReq(req) {
    const u = req.user || {};
    const model = u.model || (u.position ? 'Employee' : 'User');
    const role = model === 'User' ? 'user' : model === 'Admin' ? 'admin' : 'employee';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.name || u.email || role;
    return { userId: u._id, userModel: model, role, name };
}
