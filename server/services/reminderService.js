import Order from '../Models/orderModel.js';
import ServiceReminderConfig from '../Models/serviceReminderConfig.js';
import { createNotification, getUserRecipient } from './notificationService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Singleton config, created with defaults on first use. */
export async function getReminderConfig() {
    let cfg = await ServiceReminderConfig.findOne();
    if (!cfg) cfg = await ServiceReminderConfig.create({});
    return cfg;
}

/** Hour of day (0-23) in IST. */
const istHour = (d = new Date()) => new Date(d.getTime() + IST_OFFSET_MS).getUTCHours();

/** When the service was actually finished (best available timestamp). */
export const completedAtOf = (order) =>
    order.workCompletedAt || order.paymentDate || order.invoiceDate || order.updatedAt;

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

/** Replace {{placeholders}}; unknown ones are left out rather than printed raw. */
export function renderTemplate(template, vars) {
    return String(template || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => (vars[key] ?? ''));
}

function templateVars(order) {
    const done = completedAtOf(order);
    return {
        name: (order.name || '').trim().split(/\s+/)[0] || 'there',
        bike: [order.selectedBrand, order.selectedModel].filter(Boolean).join(' ') || 'bike',
        lastServiceDate: done ? fmtDate(done) : '',
        days: done ? String(Math.max(1, Math.round((Date.now() - new Date(done).getTime()) / DAY_MS))) : '',
    };
}

/** Rendered title/body for an order (per-order override wins over the global template). */
export function buildReminderMessage(order, cfg) {
    const vars = templateVars(order);
    return {
        title: renderTemplate(order.followUp?.title || cfg.title, vars),
        body: renderTemplate(order.followUp?.body || cfg.body, vars),
    };
}

/**
 * Step 1 — give every newly Completed order a reminder date.
 * Only orders finished on/after cfg.enabledSince are picked up, and orders an
 * admin already configured (or disabled) are left alone.
 */
export async function scheduleFollowUps(cfg) {
    if (!cfg.enabled || !cfg.enabledSince) return 0;

    const candidates = await Order.find({
        status: 'Completed',
        userId: { $ne: null },
        'followUp.status': null,
        'followUp.disabled': { $ne: true },
        updatedAt: { $gte: cfg.enabledSince },
    }).limit(500);

    let scheduled = 0;
    for (const order of candidates) {
        const done = completedAtOf(order);
        if (!done || new Date(done) < cfg.enabledSince) continue;

        const days = order.followUp?.remindAfterDays || cfg.defaultDelayDays;
        await Order.updateOne(
            { _id: order._id, 'followUp.status': null },
            {
                $set: {
                    'followUp.status': 'pending',
                    'followUp.remindAfterDays': days,
                    'followUp.remindAt': new Date(new Date(done).getTime() + days * DAY_MS),
                    'followUp.setBy': order.followUp?.setBy || 'auto',
                },
            }
        );
        scheduled++;
    }
    return scheduled;
}

/** Has this customer booked anything since the given service was completed? */
async function hasRebooked(order) {
    const done = completedAtOf(order);
    return !!(await Order.exists({
        userId: order.userId,
        _id: { $ne: order._id },
        status: { $ne: 'Cancelled' },
        createdAt: { $gt: done },
    }));
}

/** Step 2 — send every reminder that is due. Returns how many were sent. */
export async function sendDueFollowUps(cfg) {
    if (!cfg.enabled) return 0;

    // Quiet hours: due reminders just wait for the next allowed window.
    const hour = istHour();
    if (hour < cfg.sendFromHour || hour >= cfg.sendUntilHour) return 0;

    const due = await Order.find({
        'followUp.status': 'pending',
        'followUp.disabled': { $ne: true },
        'followUp.remindAt': { $lte: new Date() },
        userId: { $ne: null },
    }).limit(200);

    let sent = 0;
    for (const order of due) {
        // Claim atomically so two server instances can't both send it.
        const claimed = await Order.findOneAndUpdate(
            { _id: order._id, 'followUp.status': 'pending' },
            { $set: { 'followUp.status': 'sent', 'followUp.sentAt': new Date() } },
            { new: true }
        );
        if (!claimed) continue;

        try {
            if (cfg.skipIfRebooked && await hasRebooked(order)) {
                await Order.updateOne({ _id: order._id }, {
                    $set: { 'followUp.status': 'skipped', 'followUp.sentAt': null, 'followUp.skipReason': 'Customer already booked again' },
                });
                continue;
            }

            const { title, body } = buildReminderMessage(order, cfg);
            await createNotification({
                type: 'service_reminder',
                title,
                body,
                recipients: getUserRecipient(order.userId),
                orderId: order._id,
                data: {
                    screenOrderId: order.orderId,
                    reminderType: 'service_followup',
                    bikeBrand: order.selectedBrand,
                    bikeModel: order.selectedModel,
                },
            });
            sent++;
        } catch (err) {
            console.error(`[ServiceReminder] failed for order ${order.orderId}:`, err.message);
            // Put it back so the next run retries.
            await Order.updateOne({ _id: order._id }, {
                $set: { 'followUp.status': 'pending', 'followUp.sentAt': null },
            });
        }
    }
    return sent;
}

/** Entry point used by the cron job. */
export async function runServiceReminders() {
    const cfg = await getReminderConfig();
    const scheduled = await scheduleFollowUps(cfg);
    const sent = await sendDueFollowUps(cfg);
    if (scheduled || sent) console.log(`[ServiceReminder] scheduled=${scheduled} sent=${sent}`);
}
