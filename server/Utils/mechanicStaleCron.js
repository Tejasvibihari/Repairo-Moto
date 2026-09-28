// Utils/mechanicStaleCron.js
//
// If a mechanic is "online" but has sent no location for STALE minutes
// (phone died, app force-killed, no network), mark them offline and tell the admin.
// Runs every minute; safe on multiple instances because setPresence() is atomic/idempotent.
import cron from "node-cron";
import Employee from "../Models/employeeModel.js";
import { setPresence } from "../services/mechanicPresenceService.js";

const STALE_MS = (Number(process.env.MECHANIC_STALE_MINUTES) || 3) * 60 * 1000;

let running = false;
cron.schedule(
    "* * * * *",
    async () => {
        if (running) return;
        running = true;
        try {
            const stale = await Employee.find({
                isOnline: true,
                lastSeenAt: { $lt: new Date(Date.now() - STALE_MS) },
            }).select("_id").lean();

            for (const e of stale) {
                await setPresence(e._id, false, { reason: "connection_lost" });
            }
        } catch (err) {
            console.error("[MechanicStaleCron] error:", err);
        } finally {
            running = false;
        }
    },
    { timezone: "Asia/Kolkata" }
);

console.log(`[MechanicStaleCron] auto-offline after ${STALE_MS / 60000} min of silence.`);
