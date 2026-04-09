import express from 'express';
import Notification from '../Models/notificationModel.js';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Admin from '../Models/adminModel.js';
import Vendor from '../Models/vendorModel.js';
import authGeneric from '../Middleware/authGeneric.js'; // works for all roles

const router = express.Router();

// ── Register / update expo push token ─────────────────────────────────────────
// Works for any role — just updates the token on whichever model the user is in
router.post('/register-token', authGeneric, async (req, res) => {
    const { expoPushToken } = req.body;
    if (!expoPushToken) return res.status(400).json({ message: 'Token required' });

    try {
        console.log(`[NOTIFICATION] Registering token for user ${req.user._id} (${req.user.model})`);
        console.log(`[NOTIFICATION] Token: ${expoPushToken.substring(0, 20)}...`);

        // req.user should have { _id, role, model } — adjust to match your auth middleware
        const Model = req.user.model === 'Employee' ? Employee : req.user.model === 'Admin' ? Admin : req.user.model === 'Vendor' ? Vendor : User;

        const result = await Model.findByIdAndUpdate(
            req.user._id,
            { expoPushToken },
            { new: true }
        );

        console.log(`[NOTIFICATION] Token registered successfully for ${req.user.model} ${req.user._id}`);
        res.json({ success: true, message: 'Token registered', userId: req.user._id, model: req.user.model });
    } catch (err) {
        console.error(`[NOTIFICATION] Token registration error:`, err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Get notifications for current user ────────────────────────────────────────
router.get('/', authGeneric, async (req, res) => {
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
        .limit(50)
        .lean();

    const shaped = notifications.map(n => ({
        id: n._id,
        title: n.title,
        body: n.body,
        type: n.type,
        orderId: n.orderId,
        data: n.data,
        isRead: n.recipients?.[0]?.isRead ?? false,
        createdAt: n.createdAt,
    }));

    res.json({ notifications: shaped });
});

// ── Unread count only (for badge on app launch) ───────────────────────────────
router.get('/unread-count', authGeneric, async (req, res) => {
    const count = await Notification.countDocuments({
        recipients: { $elemMatch: { userId: req.user._id, isRead: false } },
    });
    res.json({ count });
});


router.patch('/read-all', authGeneric, async (req, res) => {
    await Notification.updateMany(
        { recipients: { $elemMatch: { userId: req.user._id, isRead: false } } },
        { $set: { 'recipients.$.isRead': true, 'recipients.$.readAt': new Date() } }
    );
    res.json({ success: true });
});

// ── Mark one as read ──────────────────────────────────────────────────────────
router.patch('/:id/read', authGeneric, async (req, res) => {
    await Notification.updateOne(
        { _id: req.params.id, 'recipients.userId': req.user._id },
        { $set: { 'recipients.$.isRead': true, 'recipients.$.readAt': new Date() } }
    );
    res.json({ success: true });
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