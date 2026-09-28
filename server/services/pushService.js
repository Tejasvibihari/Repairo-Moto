import axios from 'axios';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Admin from '../Models/adminModel.js';
import Vendor from '../Models/vendorModel.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const isExpoToken = (t) => /^Expo(nent)?PushToken\[.+\]$/.test(t);

/**
 * Fetch expoPushToken from the correct model based on role.
 */
async function getTokensForRecipients(recipients) {
    const grouped = {};
    for (const r of recipients) {
        if (!grouped[r.userModel]) grouped[r.userModel] = [];
        grouped[r.userModel].push(r.userId);
    }

    const models = { User, Employee, Admin, Vendor };
    const tokens = [];

    for (const [modelName, ids] of Object.entries(grouped)) {
        const Model = models[modelName];
        if (!Model || !ids.length) continue;
        const docs = await Model.find(
            { _id: { $in: ids }, expoPushToken: { $exists: true, $nin: [null, ''] } },
            'expoPushToken'
        ).lean();
        console.log(`[push] ${modelName}: ${docs.length}/${ids.length} recipients have a token`);
        tokens.push(...docs.map(d => d.expoPushToken));
    }

    // Same phone can be logged in under more than one account → avoid double pushes
    return [...new Set(tokens.filter(t => {
        if (!t) return false;
        if (!isExpoToken(t)) {
            console.warn('[push] invalid token format, skipping:', t);
            return false;
        }
        return true;
    }))];
}

/** Remove a token Expo says is dead so we stop pushing to it. */
async function clearDeadToken(token) {
    try {
        await Promise.all([User, Employee, Admin, Vendor].map(M =>
            M.updateMany({ expoPushToken: token }, { $unset: { expoPushToken: 1 } })
        ));
    } catch (e) {
        console.error('[push] failed clearing dead token:', e.message);
    }
}

/**
 * Receipts are where FCM-side failures show up
 * (InvalidCredentials, MismatchSenderId, DeviceNotRegistered...).
 */
async function checkReceipts(ticketMap) {
    const ids = Object.keys(ticketMap);
    if (!ids.length) return;
    try {
        const { data } = await axios.post(EXPO_RECEIPTS_URL, { ids }, {
            headers: { 'Content-Type': 'application/json' },
        });
        for (const [id, receipt] of Object.entries(data?.data || {})) {
            if (receipt.status === 'ok') {
                console.log(`[push] receipt ok for ${ticketMap[id]}`);
                continue;
            }
            console.error(`[push] receipt ERROR for ${ticketMap[id]}:`, receipt.message, JSON.stringify(receipt.details));
            if (receipt.details?.error === 'DeviceNotRegistered') clearDeadToken(ticketMap[id]);
        }
    } catch (e) {
        console.error('[push] receipt check failed:', e.message);
    }
}

/**
 * Send push notifications to a set of recipients.
 * @param {Array<{userId, userModel}>} recipients  — from Notification.recipients
 * @param {{ title: string, body: string, data?: object }} payload
 */
export async function sendPushToRecipients(recipients, { title, body, data = {} }) {
    const tokens = await getTokensForRecipients(recipients);
    if (!tokens.length) {
        console.warn('[push] no valid Expo tokens for recipients — nothing sent');
        return;
    }
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

            const ticketMap = {};
            result?.data?.forEach((ticket, idx) => {
                const token = chunk[idx].to;
                if (ticket.status === 'ok') {
                    ticketMap[ticket.id] = token;
                } else {
                    console.error(`[push] ticket ERROR for ${token}:`, ticket.message, JSON.stringify(ticket.details));
                    if (ticket.details?.error === 'DeviceNotRegistered') clearDeadToken(token);
                }
            });

            // Expo needs a little time before receipts exist
            setTimeout(() => checkReceipts(ticketMap), 30 * 1000);
        } catch (err) {
            console.error('[push] Expo batch error:', err.response?.data || err.message);
        }
    }
}
