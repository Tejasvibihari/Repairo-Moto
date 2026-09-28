import mongoose from 'mongoose';
import User from '../Models/userModel.js';
import Order from '../Models/orderModel.js';
import NotificationCampaign from '../Models/notificationCampaignModel.js';
import { createNotification } from './notificationService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// One Notification document per chunk keeps each doc far below Mongo's 16 MB limit.
const CHUNK_SIZE = 500;

/** Resolve an audience definition to a list of customer ids. */
export async function resolveAudience(audience = {}) {
    const activeUser = { status: { $ne: 'suspended' } };

    if (audience.type === 'all_users') {
        const users = await User.find(activeUser, '_id').lean();
        return users.map(u => u._id);
    }

    if (audience.type === 'selected_users') {
        const ids = (audience.userIds || []).filter(id => mongoose.Types.ObjectId.isValid(id));
        if (!ids.length) return [];
        const users = await User.find({ ...activeUser, _id: { $in: ids } }, '_id').lean();
        return users.map(u => u._id);
    }

    if (audience.type === 'inactive_days') {
        const days = Number(audience.inactiveDays);
        if (!days || days < 1) return [];
        const cutoff = new Date(Date.now() - days * DAY_MS);
        // Customers whose most recent (non-cancelled) booking is older than the cutoff.
        const stale = await Order.aggregate([
            { $match: { userId: { $ne: null }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: '$userId', last: { $max: '$createdAt' } } },
            { $match: { last: { $lt: cutoff } } },
        ]);
        if (!stale.length) return [];
        const users = await User.find({ ...activeUser, _id: { $in: stale.map(s => s._id) } }, '_id').lean();
        return users.map(u => u._id);
    }

    return [];
}

/** Send a saved campaign to its audience and record the outcome. */
export async function dispatchCampaign(campaignId) {
    const campaign = await NotificationCampaign.findById(campaignId);
    if (!campaign) return null;

    try {
        const userIds = await resolveAudience(campaign.audience);

        for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
            const chunk = userIds.slice(i, i + CHUNK_SIZE);
            await createNotification({
                type: 'promotion',
                title: campaign.title,
                body: campaign.body,
                recipients: chunk.map(userId => ({ userId, userModel: 'User', role: 'user' })),
                data: { campaignId: String(campaign._id) },
                triggeredBy: { userId: campaign.createdBy.userId, userModel: campaign.createdBy.userModel },
            });
        }

        campaign.status = 'sent';
        campaign.sentAt = new Date();
        campaign.recipientCount = userIds.length;
        campaign.error = '';
    } catch (err) {
        console.error('[Campaign] dispatch failed:', err);
        campaign.status = 'failed';
        campaign.error = err.message;
    }
    await campaign.save();
    return campaign;
}

/** Cron helper: claim and send every scheduled campaign that is now due. */
export async function dispatchDueCampaigns() {
    for (;;) {
        const claimed = await NotificationCampaign.findOneAndUpdate(
            { status: 'scheduled', scheduledFor: { $lte: new Date() } },
            { $set: { status: 'sending' } },
            { new: true }
        );
        if (!claimed) return;
        await dispatchCampaign(claimed._id);
    }
}
