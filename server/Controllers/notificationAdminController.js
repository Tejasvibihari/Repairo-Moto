import mongoose from 'mongoose';
import Order from '../Models/orderModel.js';
import ServiceReminderConfig from '../Models/serviceReminderConfig.js';
import NotificationCampaign from '../Models/notificationCampaignModel.js';
import { getReminderConfig, buildReminderMessage, completedAtOf } from '../services/reminderService.js';
import { resolveAudience, dispatchCampaign } from '../services/campaignService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const actorOf = (req) => ({
    userId: req.user._id,
    userModel: req.user.model === 'Employee' ? 'Employee' : 'Admin',
    name: req.user.leadBy || [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.email || '',
});

/** Mass messaging and global reminder settings are Admin-only (telecallers/managers also pass authAdmin). */
export const requireAdminOnly = (req, res, next) => {
    if (req.user?.model !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Only admins can do this.' });
    }
    next();
};

// ═══════════════════════════════════════════════════════════════════════════
// Manual campaigns (offers / announcements)
// ═══════════════════════════════════════════════════════════════════════════

const cleanAudience = (a = {}) => {
    const type = a.type;
    if (!['all_users', 'selected_users', 'inactive_days'].includes(type)) return null;
    return {
        type,
        userIds: type === 'selected_users' ? (a.userIds || []) : [],
        inactiveDays: type === 'inactive_days' ? Number(a.inactiveDays) || null : null,
    };
};

// POST /campaigns/preview  → how many customers would receive this
export const previewAudience = async (req, res) => {
    try {
        const audience = cleanAudience(req.body?.audience);
        if (!audience) return res.status(400).json({ message: 'Invalid audience.' });
        const ids = await resolveAudience(audience);
        res.json({ count: ids.length });
    } catch (err) {
        console.error('[previewAudience]', err);
        res.status(500).json({ message: 'Could not calculate audience.' });
    }
};

// POST /campaigns  → send now, or schedule with `scheduledFor`
export const createCampaign = async (req, res) => {
    try {
        const title = String(req.body?.title || '').trim();
        const body = String(req.body?.body || '').trim();
        if (!title || !body) return res.status(400).json({ message: 'Title and message are required.' });
        if (title.length > 80) return res.status(400).json({ message: 'Title must be 80 characters or fewer.' });
        if (body.length > 400) return res.status(400).json({ message: 'Message must be 400 characters or fewer.' });

        const audience = cleanAudience(req.body?.audience);
        if (!audience) return res.status(400).json({ message: 'Choose who should receive this.' });
        if (audience.type === 'selected_users' && !audience.userIds.length) {
            return res.status(400).json({ message: 'Select at least one customer.' });
        }
        if (audience.type === 'inactive_days' && !audience.inactiveDays) {
            return res.status(400).json({ message: 'Enter the number of inactive days.' });
        }

        let scheduledFor = null;
        if (req.body?.scheduledFor) {
            scheduledFor = new Date(req.body.scheduledFor);
            if (isNaN(scheduledFor.getTime())) return res.status(400).json({ message: 'Invalid schedule time.' });
            if (scheduledFor.getTime() <= Date.now() + 60 * 1000) {
                return res.status(400).json({ message: 'Schedule time must be at least a minute in the future.' });
            }
        }

        const campaign = await NotificationCampaign.create({
            title, body, audience,
            status: scheduledFor ? 'scheduled' : 'sending',
            scheduledFor,
            createdBy: actorOf(req),
        });

        if (scheduledFor) return res.status(201).json({ message: 'Campaign scheduled.', campaign });

        const sent = await dispatchCampaign(campaign._id);
        const code = sent?.status === 'sent' ? 201 : 500;
        res.status(code).json({
            message: sent?.status === 'sent' ? `Sent to ${sent.recipientCount} customers.` : 'Sending failed.',
            campaign: sent,
        });
    } catch (err) {
        console.error('[createCampaign]', err);
        res.status(500).json({ message: 'Could not create campaign.' });
    }
};

// GET /campaigns
export const listCampaigns = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
        const campaigns = await NotificationCampaign.find().sort({ createdAt: -1 }).limit(limit).lean();
        res.json({ campaigns });
    } catch (err) {
        res.status(500).json({ message: 'Could not load campaigns.' });
    }
};

// DELETE /campaigns/:id  → cancel a scheduled campaign
export const cancelCampaign = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid id.' });
        const cancelled = await NotificationCampaign.findOneAndUpdate(
            { _id: req.params.id, status: 'scheduled' },
            { $set: { status: 'cancelled' } },
            { new: true }
        );
        if (!cancelled) return res.status(409).json({ message: 'Only scheduled campaigns that have not started can be cancelled.' });
        res.json({ message: 'Campaign cancelled.', campaign: cancelled });
    } catch (err) {
        res.status(500).json({ message: 'Could not cancel campaign.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// Service-reminder settings (global)
// ═══════════════════════════════════════════════════════════════════════════

// GET /reminder-config
export const getConfig = async (req, res) => {
    try {
        res.json(await getReminderConfig());
    } catch (err) {
        res.status(500).json({ message: 'Could not load reminder settings.' });
    }
};

// PUT /reminder-config
export const updateConfig = async (req, res) => {
    try {
        const cfg = await getReminderConfig();
        const b = req.body || {};

        if (b.defaultDelayDays !== undefined) {
            const d = Number(b.defaultDelayDays);
            if (!Number.isInteger(d) || d < 1 || d > 730) return res.status(400).json({ message: 'Default delay must be 1–730 days.' });
            cfg.defaultDelayDays = d;
        }
        if (b.presetDays !== undefined) {
            const list = [...new Set((b.presetDays || []).map(Number))].filter(n => Number.isInteger(n) && n >= 1 && n <= 730).sort((a, c) => a - c);
            if (!list.length || list.length > 8) return res.status(400).json({ message: 'Provide 1–8 preset day values.' });
            cfg.presetDays = list;
        }
        for (const f of ['title', 'body']) {
            if (b[f] !== undefined) {
                const v = String(b[f]).trim();
                if (!v) return res.status(400).json({ message: `${f} cannot be empty.` });
                if (v.length > (f === 'title' ? 80 : 400)) return res.status(400).json({ message: `${f} is too long.` });
                cfg[f] = v;
            }
        }
        for (const f of ['sendFromHour', 'sendUntilHour']) {
            if (b[f] !== undefined) {
                const h = Number(b[f]);
                if (!Number.isInteger(h) || h < 0 || h > 24) return res.status(400).json({ message: `${f} must be an hour between 0 and 24.` });
                cfg[f] = h;
            }
        }
        if (cfg.sendFromHour >= cfg.sendUntilHour) return res.status(400).json({ message: 'Send window start must be before its end.' });
        if (b.skipIfRebooked !== undefined) cfg.skipIfRebooked = !!b.skipIfRebooked;

        if (b.enabled !== undefined) {
            const turningOn = !!b.enabled && !cfg.enabled;
            cfg.enabled = !!b.enabled;
            // Start the clock the first time it is switched on (or back on after being off).
            if (turningOn) cfg.enabledSince = new Date();
        }

        await cfg.save();
        res.json(cfg);
    } catch (err) {
        console.error('[updateConfig]', err);
        res.status(500).json({ message: 'Could not save reminder settings.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// Per-order follow-up reminder
// ═══════════════════════════════════════════════════════════════════════════

// PUT /follow-up/:orderId   body: { days?, disabled?, title?, body? }
export const setOrderFollowUp = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ message: 'Invalid order id.' });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (!order.userId) return res.status(400).json({ message: 'This booking has no app customer to notify.' });
        if (order.status === 'Cancelled') return res.status(400).json({ message: 'Cancelled bookings cannot have reminders.' });
        if (order.followUp?.status === 'sent') return res.status(409).json({ message: 'The reminder for this order was already sent.' });

        const b = req.body || {};
        const set = { 'followUp.setBy': 'admin' };

        if (b.disabled !== undefined) {
            set['followUp.disabled'] = !!b.disabled;
            if (b.disabled) set['followUp.status'] = order.status === 'Completed' ? 'skipped' : null;
            if (b.disabled) set['followUp.skipReason'] = 'Turned off by admin';
        }
        for (const f of ['title', 'body']) {
            if (b[f] !== undefined) set[`followUp.${f}`] = String(b[f]).trim().slice(0, f === 'title' ? 80 : 400);
        }

        if (b.days !== undefined && b.disabled !== true) {
            const days = Number(b.days);
            if (!Number.isInteger(days) || days < 1 || days > 730) return res.status(400).json({ message: 'Days must be between 1 and 730.' });
            set['followUp.remindAfterDays'] = days;
            set['followUp.disabled'] = false;
            set['followUp.skipReason'] = '';

            if (order.status === 'Completed') {
                // Service already done → fix the exact date now.
                set['followUp.status'] = 'pending';
                set['followUp.remindAt'] = new Date(new Date(completedAtOf(order)).getTime() + days * DAY_MS);
            } else {
                // Not done yet → remember the choice; the scheduler dates it when the service completes.
                set['followUp.status'] = null;
                set['followUp.remindAt'] = null;
            }
        }

        const updated = await Order.findByIdAndUpdate(orderId, { $set: set }, { new: true });
        const cfg = await getReminderConfig();
        res.json({
            message: 'Reminder updated.',
            followUp: updated.followUp,
            preview: buildReminderMessage(updated, cfg),
        });
    } catch (err) {
        console.error('[setOrderFollowUp]', err);
        res.status(500).json({ message: 'Could not update reminder.' });
    }
};

// GET /follow-ups?status=pending   → upcoming reminders, soonest first
export const listFollowUps = async (req, res) => {
    try {
        const status = ['pending', 'sent', 'skipped'].includes(req.query.status) ? req.query.status : 'pending';
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
        const orders = await Order.find(
            { 'followUp.status': status },
            'orderId name contactNo selectedBrand selectedModel followUp'
        )
            .sort(status === 'pending' ? { 'followUp.remindAt': 1 } : { 'followUp.sentAt': -1 })
            .limit(limit)
            .lean();
        res.json({ followUps: orders });
    } catch (err) {
        res.status(500).json({ message: 'Could not load reminders.' });
    }
};
