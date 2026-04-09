import express from 'express';
import mongoose from 'mongoose';
import Notification from '../Models/notificationModel.js';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Admin from '../Models/adminModel.js';
import Vendor from '../Models/vendorModel.js';
import authGeneric from '../Middleware/authGeneric.js'; // works for all roles

const router = express.Router();

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// ── Register / update expo push token ─────────────────────────────────────────
// Works for any role — just updates the token on whichever model the user is in
router.post('/register-token', authGeneric, async (req, res) => {
    const { expoPushToken } = req.body;
    if (!expoPushToken) return res.status(400).json({ message: 'Token required' });

    try {
        // req.user should have { _id, role, model } — adjust to match your auth middleware
        const Model = req.user.model === 'Employee' ? Employee : req.user.model === 'Admin' ? Admin : req.user.model === 'Vendor' ? Vendor : User;

        await Model.findByIdAndUpdate(req.user._id, { expoPushToken });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Get notifications for current user ────────────────────────────────────────
router.get('/', authGeneric, async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find(
            { 'recipients.userId': userId },
            {
                title: 1, body: 1, type: 1, orderId: 1,
                data: 1, createdAt: 1,
                // Project only current user's recipient subdoc
                recipients: { $elemMatch: { userId } },
            }
        )
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const shaped = notifications.map(n => {
            const notificationId = n._id?.toString?.() || String(n._id);
            console.log('[GET /] Sending notification with id:', notificationId, 'type:', typeof notificationId);
            return {
                id: notificationId,
                title: n.title,
                body: n.body,
                type: n.type,
                orderId: n.orderId?.toString?.() || String(n.orderId),
                data: n.data,
                isRead: n.recipients?.[0]?.isRead ?? false,
                createdAt: n.createdAt,
            };
        });

        res.json({ notifications: shaped });
    } catch (err) {
        console.error('[Notifications GET /] Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Unread count only (for badge on app launch) ───────────────────────────────
router.get('/unread-count', authGeneric, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipients: { $elemMatch: { userId: req.user._id, isRead: false } },
        });
        res.json({ count });
    } catch (err) {
        console.error('[Notifications GET /unread-count] Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});


router.patch('/read-all', authGeneric, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipients: { $elemMatch: { userId: req.user._id, isRead: false } } },
            { $set: { 'recipients.$.isRead': true, 'recipients.$.readAt': new Date() } }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('[Notifications PATCH /read-all] Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Mark one as read ──────────────────────────────────────────────────────────
router.patch('/:id/read', authGeneric, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        console.log('[Notifications markRead] Marking notification as read:', {
            notificationId,
            userId: userId.toString()
        });

        // Validate notificationId is a valid MongoDB ObjectId
        if (!isValidObjectId(notificationId)) {
            console.warn('[Notifications markRead] Invalid notification ID format:', notificationId);
            return res.status(400).json({
                success: false,
                message: 'Invalid notification ID format',
                receivedId: notificationId
            });
        }

        // First check if notification exists
        const notification = await Notification.findOne({
            _id: notificationId,
            'recipients.userId': userId
        });

        if (!notification) {
            console.warn('[Notifications markRead] Notification not found for user:', {
                notificationId,
                userId: userId.toString()
            });
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Mark as read
        const result = await Notification.updateOne(
            { _id: notificationId, 'recipients.userId': userId },
            { $set: { 'recipients.$.isRead': true, 'recipients.$.readAt': new Date() } }
        );

        console.log('[Notifications markRead] Update result:', result);
        res.json({ success: true });
    } catch (err) {
        console.error('[Notifications PATCH /:id/read] Error:', err.message);
        console.error('[Notifications PATCH /:id/read] Stack:', err.stack);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Mark all as read ──────────────────────────────────────────────────────────

// ── DEBUG: Test notification endpoint ──────────────────────────────────────────
router.get('/debug/test-push', authGeneric, async (req, res) => {
    try {
        const { createNotification, getUserRecipient } = await import('../services/notificationService.js');

        console.log(`[DEBUG] Test push initiated for user ${req.user._id}`);

        const notification = await createNotification({
            type: 'general',
            title: '🧪 Test Notification',
            body: 'If you see this, push notifications are working!',
            recipients: [{
                userId: req.user._id,
                userModel: req.user.model,
                role: req.user.role,
            }],
            data: { test: true },
        });

        res.json({
            success: true,
            message: 'Test notification sent',
            notificationId: notification?._id,
        });
    } catch (err) {
        console.error('[DEBUG] Test push error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;