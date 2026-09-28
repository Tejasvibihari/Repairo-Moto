import mongoose from 'mongoose';

// History + scheduling record for admin-created (manual) notifications such as
// offers and announcements. The per-user inbox entries live in Notification;
// this collection is what the admin sees under "Sent campaigns".
const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 400 },

    audience: {
        // all_users      → every active customer
        // selected_users → explicit list (userIds)
        // inactive_days  → customers whose last booking is older than N days
        type: { type: String, enum: ['all_users', 'selected_users', 'inactive_days'], required: true },
        userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        inactiveDays: { type: Number, min: 1, max: 730, default: null },
    },

    status: {
        type: String,
        enum: ['scheduled', 'sending', 'sent', 'cancelled', 'failed'],
        default: 'sent',
    },
    scheduledFor: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    recipientCount: { type: Number, default: 0 },
    error: { type: String, default: '' },

    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userModel: { type: String, enum: ['Admin', 'Employee'], required: true },
        name: { type: String, default: '' },
    },
}, { timestamps: true });

campaignSchema.index({ status: 1, scheduledFor: 1 });
campaignSchema.index({ createdAt: -1 });

const NotificationCampaign = mongoose.model('NotificationCampaign', campaignSchema);
export default NotificationCampaign;
