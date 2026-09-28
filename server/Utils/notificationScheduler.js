/**
 * Runs the two scheduled notification jobs:
 *   • every minute  → send admin campaigns whose scheduled time has arrived
 *   • every 30 min  → date newly-completed services and send due service reminders
 * (Both jobs are safe to run on more than one server instance: work is claimed atomically.)
 */
import cron from 'node-cron';
import { dispatchDueCampaigns } from '../services/campaignService.js';
import { runServiceReminders } from '../services/reminderService.js';

const guarded = (name, fn) => {
    let running = false;
    return async () => {
        if (running) return;
        running = true;
        try { await fn(); } catch (err) { console.error(`[${name}] job error:`, err); }
        finally { running = false; }
    };
};

cron.schedule('* * * * *', guarded('Campaigns', dispatchDueCampaigns), { timezone: 'Asia/Kolkata' });
cron.schedule('*/30 * * * *', guarded('ServiceReminder', runServiceReminders), { timezone: 'Asia/Kolkata' });

console.log('[NotificationScheduler] campaign (1 min) and service-reminder (30 min) jobs scheduled.');
