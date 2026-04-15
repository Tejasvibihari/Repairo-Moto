import mongoose from 'mongoose';

// Every role that can receive notifications
const RECIPIENT_ROLES = ['admin', 'employee', 'mechanic', 'delivery', 'telecaller', 'ops_manager', 'vendor', 'user'];

const notificationSchema = new mongoose.Schema({
    // ─── Who receives this notification ───────────────────────────────────────
    recipients: [{
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipients.userModel' },
        userModel: { type: String, required: true, enum: ['User', 'Employee', 'Admin', 'Vendor'] },
        role: { type: String, required: true, enum: RECIPIENT_ROLES },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
    }],

    // ─── Notification content ──────────────────────────────────────────────────
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },

    // ─── Type controls icon + navigation on the frontend ──────────────────────
    type: {
        type: String,
        enum: [
            'new_order',        // → admin, mechanic sees new booking
            'order_assigned',   // → mechanic gets assigned
            'mechanic_assigned',// → mechanic assigned specific
            'delivery_assigned',// → delivery agent assigned specific
            'order_update',     // → user: status changed
            'order_cancelled',  // → admin, mechanic, user
            'invoice_generated',// → user gets invoice
            'payment_received', // → admin, mechanic: payment received + invoice generated
            'delivery_update',  // → delivery agent
            'general',          // → any role, generic message
        ],
        default: 'general',
    },

    // ─── Deep-link data (used for navigation on tap) ──────────────────────────
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ─── Who triggered this (for audit trail) ─────────────────────────────────
    triggeredBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, default: null },
        userModel: { type: String, enum: ['User', 'Employee', 'Admin', 'Vendor', null], default: null },
    },

}, { timestamps: true });

// Fast per-user queries: "give me all notifications for userId X"
notificationSchema.index({ 'recipients.userId': 1, createdAt: -1 });
// Fast unread count queries
notificationSchema.index({ 'recipients.userId': 1, 'recipients.isRead': 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;