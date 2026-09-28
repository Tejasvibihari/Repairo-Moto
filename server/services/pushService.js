import axios from 'axios';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Admin from '../Models/adminModel.js';
import Vendor from '../Models/vendorModel.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Fetch expoPushToken from the correct model based on role.
 */
async function getTokensForRecipients(recipients) {
    // Group by model to do bulk queries
    const grouped = {};
    for (const r of recipients) {
        if (!grouped[r.userModel]) grouped[r.userModel] = [];
        grouped[r.userModel].push(r.userId);
    }

    const tokens = [];

    if (grouped['User']?.length) {
        const users = await User.find(
            { _id: { $in: grouped['User'] }, expoPushToken: { $exists: true, $nin: [null, ''] } },
            'expoPushToken'
        ).lean();
        tokens.push(...users.map(u => u.expoPushToken));
    }

    if (grouped['Employee']?.length) {
        const employees = await Employee.find(
            { _id: { $in: grouped['Employee'] }, expoPushToken: { $exists: true, $nin: [null, ''] } },
            'expoPushToken'
        ).lean();
        tokens.push(...employees.map(e => e.expoPushToken));
    }

    if (grouped['Admin']?.length) {
        const admins = await Admin.find(
            { _id: { $in: grouped['Admin'] }, expoPushToken: { $exists: true, $nin: [null, ''] } },
            'expoPushToken'
        ).lean();
        tokens.push(...admins.map(a => a.expoPushToken));
    }

    if (grouped['Vendor']?.length) {
        const vendors = await Vendor.find(
            { _id: { $in: grouped['Vendor'] }, expoPushToken: { $exists: true, $nin: [null, ''] } },
            'expoPushToken'
        ).lean();
        tokens.push(...vendors.map(v => v.expoPushToken));
    }

    // Same phone can be logged in under more than one account → avoid double pushes
    return [...new Set(tokens.filter(Boolean))];
}

/** Remove a token Expo says is dead so we stop pushing to it. */
async function clearDeadToken(token) {
    try {
        await Promise.all([User, Employee, Admin, Vendor].map(M =>
            M.updateMany({ expoPushToken: token }, { $unset: { expoPushToken: 1 } })
        ));
    } catch (e) {
        console.error('Failed clearing dead push token:', e.message);
    }
}

/**
 * Send push notifications to a set of recipients.
 * @param {Array<{userId, userModel}>} recipients  — from Notification.recipients
 * @param {{ title: string, body: string, data?: object }} payload
 */
export async function sendPushToRecipients(recipients, { title, body, data = {} }) {
    const tokens = await getTokensForRecipients(recipients);
    if (!tokens.length) return;
    const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
        channelId: 'orders',
        badge: 1,
        priority: 'high',
    }));

    // Expo allows max 100 per batch
    for (let i = 0; i < messages.length; i += 100) {
        const chunk = messages.slice(i, i + 100);
        try {
            const { data: result } = await axios.post(EXPO_PUSH_URL, chunk, {
                headers: { 'Content-Type': 'application/json' },
            });
            // Log any per-token errors from Expo
            result?.data?.forEach((ticket, idx) => {
                if (ticket.status === 'error') {
                    console.error(`Push error for token ${chunk[idx].to}:`, ticket.message);
                    if (ticket.details?.error === 'DeviceNotRegistered') clearDeadToken(chunk[idx].to);
                }
            });
        } catch (err) {
            console.error('Expo push batch error:', err.message);
        }
    }
}