// Utils/mechanicStaleCron.js
//
// Two safety nets, run every minute (safe on multiple instances: setPresence() is atomic/idempotent):
//
//  1. Silent phone — "online" but no location for STALE minutes (phone died, app force-killed,
//     no network) → mark offline and tell the admin. When nobody is watching, a phone only pings
//     about once a minute, so the default is 5 min (≈4 missed pings) instead of 3.
//
//  2. Not on duty any more — "online" but NOT checked in right now (forgot to sign out and the day
//     rolled over, or an old build still in the field). Online is driven by attendance, so
//     nobody may stay online (and tracked!) outside a checked-in working day.
import cron from "node-cron";
import Employee from "../Models/employeeModel.js";
import Attendance from "../Models/attendanceModel.js";
import { setPresence } from "../services/mechanicPresenceService.js";
import { TRACKABLE_POSITIONS } from "../services/trackingService.js";
import { istDateKey, openBreakOf } from "./attendanceUtils.js";

const STALE_MS = (Number(process.env.MECHANIC_STALE_MINUTES) || 5) * 60 * 1000;

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

            // 2) online but not checked in
            const online = await Employee.find({ isOnline: true, position: { $in: TRACKABLE_POSITIONS } })
                .select("_id").lean();
            if (online.length) {
                const records = await Attendance.find({
                    employeeId: { $in: online.map((e) => e._id) },
                    date: istDateKey(),
                }).select("employeeId checkIn.at checkOut.at breaks").lean();
                const working = new Set(
                    records
                        .filter((r) => r.checkIn?.at && !r.checkOut?.at && !openBreakOf(r.breaks))
                        .map((r) => String(r.employeeId))
                );
                for (const e of online) {
                    if (!working.has(String(e._id))) {
                        await setPresence(e._id, false, { reason: "attendance_ended", notify: false });
                    }
                }
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
