import express from 'express';
import Notification from '../Models/notificationModel.js';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
// import { protect } from '../middleware/authMiddleware.js'; // your existing middleware

const router = express.Router();

// ── Register / update expo push token ─────────────────────────────────────────
// Works for any role — just updates the token on whichever model the user is in
router.post('/register-token', async (req, res) => {
    const { expoPushToken } = req.body;
    if (!expoPushToken) return res.status(400).json({ message: 'Token required' });

    // req.user should have { _id, role, model } — adjust to match your auth middleware
    const Model = req.user.model === 'Employee' ? Employee : User;
    await Model.findByIdAndUpdate(req.user._id, { expoPushToken });

    res.json({ success: true });
});

// ── Get notifications for current user ────────────────────────────────────────
router.get('/', async (req, res) => {
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
router.get('/unread-count', async (req, res) => {
    const count = await Notification.countDocuments({
        recipients: { $elemMatch: { userId: req.user._id, isRead: false } },
    });
    res.json({ count });
});

// ── Mark one as read ──────────────────────────────────────────────────────────
router.patch('/:id/read', async (req, res) => {
    await Notification.updateOne(
        { _id: req.params.id, 'recipients.userId': req.user._id },
        { $set: { 'recipients.$.isRead': true, 'recipients.$.readAt': new Date() } }
    );
    res.json({ success: true });
});

// ── Mark all as read ──────────────────────────────────────────────────────────
router.patch('/read-all', async (req, res) => {
    await Notification.updateMany(
        { recipients: { $elemMatch: { userId: req.user._id, isRead: false } } },
        { $set: { 'recipients.$.isRead': true, 'recipients.$.readAt': new Date() } }
    );
    res.json({ success: true });
});

export default router;