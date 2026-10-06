// Utils/tripCron.js
//
// Safety net for trips nobody closed (forgot "Arrived to Hub", phone died, ...).
// A trip open for more than TRIP_MAX_HOURS (default 16 h) is closed with reason "timeout" and
// flagged "auto_closed" so the admin can see it. Distance recorded up to then is kept.
// (Signing out of attendance also closes the trip — see attendanceController.checkOut.)
import cron from "node-cron";
import { closeStaleTrips } from "../services/tripService.js";

let running = false;
cron.schedule("*/15 * * * *", async () => {
    if (running) return;
    running = true;
    try {
        const n = await closeStaleTrips();
        if (n) console.log(`[tripCron] auto-closed ${n} stale trip(s)`);
    } catch (err) {
        console.error("[tripCron] error:", err);
    } finally {
        running = false;
    }
});
