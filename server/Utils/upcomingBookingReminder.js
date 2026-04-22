/**
 * upcomingBookingReminderCron.js
 *
 * Runs every 15 minutes.
 * Finds orders whose (preferredDate + preferredTime) is between NOW and NOW+2hr,
 * have not yet had a reminder sent, and are in an active (non-cancelled/completed) status.
 * Sends a push notification to all admins and saves it to the Notification collection.
 *
 * Setup in server.js / app.js:
 *   import './jobs/upcomingBookingReminderCron.js';
 */

import cron from 'node-cron';
import Order from '../Models/orderModel.js';
import {
    createNotification,
    getAdminRecipients,
} from '../services/notificationService.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const REMINDER_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const LOOK_AHEAD_BUFFER_MS = 15 * 60 * 1000;   // 15-min buffer (matches cron frequency)

/**
 * Parse preferredTime string (e.g. "10:30 AM", "14:00", "2:30 PM")
 * and combine with preferredDate to produce a full Date object.
 *
 * Returns null if parsing fails.
 */
const buildAppointmentDate = (preferredDate, preferredTime) => {
    try {
        if (!preferredDate || !preferredTime) return null;

        const base = new Date(preferredDate);
        const timeStr = preferredTime.trim().toUpperCase();

        let hours = 0;
        let minutes = 0;

        // Handle "HH:MM AM/PM" format
        const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
        if (ampmMatch) {
            hours = parseInt(ampmMatch[1], 10);
            minutes = parseInt(ampmMatch[2], 10);
            if (ampmMatch[3] === 'PM' && hours !== 12) hours += 12;
            if (ampmMatch[3] === 'AM' && hours === 12) hours = 0;
        } else {
            // Handle "HH:MM" 24-hour format
            const h24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
            if (h24Match) {
                hours = parseInt(h24Match[1], 10);
                minutes = parseInt(h24Match[2], 10);
            } else {
                console.warn(`[BookingReminder] Could not parse time: "${preferredTime}"`);
                return null;
            }
        }

        // Build the full datetime using the date part + parsed time
        const result = new Date(base);
        result.setHours(hours, minutes, 0, 0);
        return result;
    } catch (err) {
        console.warn(`[BookingReminder] buildAppointmentDate error:`, err.message);
        return null;
    }
};

// ─── Main job ─────────────────────────────────────────────────────────────────
export const runUpcomingBookingReminder = async () => {
    console.log('[BookingReminder] Checking for upcoming bookings…');
    try {
        const now = new Date();
        console.log(`[BookingReminder] Current time: ${now.toISOString()}`);
        // Window: orders whose appointment falls between now+0 and now+2hr+15min
        // The +15min buffer ensures we don't miss orders right at the 2hr mark
        // between cron ticks.
        const windowStart = now;
        const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS + LOOK_AHEAD_BUFFER_MS);

        // Fetch candidate orders:
        // - preferredDate is within today or tomorrow (broad filter for index use)
        // - not cancelled or completed
        // - reminder not yet sent
        const candidates = await Order.find({
            preferredDate: {
                $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // from yesterday (safety)
                $lte: new Date(now.getTime() + 48 * 60 * 60 * 1000), // up to 2 days ahead
            },
            status: {
                $nin: ['Completed', 'Cancelled'],
            },
            reminderSent: { $ne: true }, // ← flag we set after sending (see schema note below)
        }).lean();

        if (!candidates.length) {
            console.log('[BookingReminder] No candidate orders found.');
            return;
        }

        // Now do precise time-based filtering in JS
        const dueOrders = candidates.filter(order => {
            const appointmentAt = buildAppointmentDate(order.preferredDate, order.preferredTime);
            if (!appointmentAt) return false;

            // ✅ Now windowStart and windowEnd are actually used
            return appointmentAt >= windowStart && appointmentAt <= windowEnd;
        });
        if (!dueOrders.length) {
            console.log('[BookingReminder] No bookings due within the 2-hour window.');
            return;
        }

        console.log(`[BookingReminder] Found ${dueOrders.length} upcoming booking(s) to notify.`);

        const adminRecipients = await getAdminRecipients();
        if (!adminRecipients.length) {
            console.warn('[BookingReminder] No admin recipients found. Skipping.');
            return;
        }

        for (const order of dueOrders) {
            const appointmentAt = buildAppointmentDate(order.preferredDate, order.preferredTime);
            const minutesUntil = Math.round((appointmentAt.getTime() - now.getTime()) / 60000);

            const timeLabel = minutesUntil <= 60
                ? `${minutesUntil} minutes`
                : `${Math.round(minutesUntil / 60)} hours`;

            // Create notification (saved to DB + push sent to all admins)
            await createNotification({
                type: 'general',
                title: '⏰ Upcoming Booking Reminder',
                body: `Order #${order.orderId} for ${order.name} (${order.selectedBrand} ${order.selectedModel}) is scheduled in ~${timeLabel}. Address: ${order.address}, ${order.city}.`,
                recipients: adminRecipients,
                orderId: order._id,
                data: {
                    screenOrderId: order.orderId,
                    orderId: order._id.toString(),
                    appointmentAt: appointmentAt.toISOString(),
                    customerName: order.name,
                    contactNo: order.contactNo,
                    vehicle: `${order.selectedBrand} ${order.selectedModel}`,
                    address: order.address,
                    city: order.city,
                    reminderType: 'upcoming_booking_2hr',
                },
            });

            // Mark reminder as sent so we don't re-notify on the next cron tick
            await Order.findByIdAndUpdate(order._id, {
                $set: { reminderSent: true },
            });

            console.log(`[BookingReminder] Reminder sent for order ${order.orderId} (in ~${timeLabel})`);
        }

    } catch (err) {
        console.error('[BookingReminder] Job error:', err);
    }
};

// ─── Schedule: every 15 minutes ──────────────────────────────────────────────
cron.schedule('*/15 * * * *', runUpcomingBookingReminder, {
    timezone: 'Asia/Kolkata',
});

console.log('[BookingReminder] Upcoming booking reminder cron scheduled (every 15 min).');

export default runUpcomingBookingReminder;