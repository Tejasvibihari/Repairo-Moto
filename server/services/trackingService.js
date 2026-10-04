// services/trackingService.js
//
// Shared rules for live tracking + the "demand" signal that makes tracking cheap.
//
// HOW DEMAND WORKS (why the phone's battery is not drained):
//   • An online mechanic/delivery phone always sends a LOW-POWER ping about once a minute
//     ("idle" mode) — enough for "last seen" and to prove the phone is alive.
//   • Whenever somebody is actually WATCHING (an admin with the live map open, or a customer
//     with the order-tracking screen open) the server sets `trackingDemandUntil` a little in
//     the future. The reply to the phone's next ping carries `live: true`, so the phone
//     switches to the fast GPS stream, and back to idle as soon as the demand expires.
//   • The demand lives in the database (not in memory), so it works with several server
//     instances and survives a restart. Watchers must keep re-asking; if they crash or close
//     the screen the demand simply expires — nothing to clean up.
import mongoose from "mongoose";
import Employee from "../Models/employeeModel.js";

/** Only these positions can be Online and be tracked. */
export const TRACKABLE_POSITIONS = ["mechanic", "delivery"];
export const isTrackable = (position) => TRACKABLE_POSITIONS.includes(position);

export const ROLE_LABEL = { mechanic: "Mechanic", delivery: "Delivery partner" };

/**
 * Order flow → when a CUSTOMER may see the person on the map.
 * Edit this one object to change the customer-facing rules.
 */
export const CUSTOMER_VISIBLE_STATUSES = {
    mechanic: ["Mechanic Assigned"],     // on the way to the customer
    delivery: ["Mechanic Assigned"],     // assumption: same window — change if delivery has its own stage
};

/** How long one "I'm watching" signal stays valid. Watchers refresh it every ~30s. */
export const DEMAND_TTL_MS = 75 * 1000;

// Avoid writing to the DB on every heartbeat: one write per employee per 20s is plenty.
const lastWrite = new Map();
const WRITE_EVERY_MS = 20 * 1000;

/**
 * Say "somebody is watching these people right now".
 * @param {Array<string|ObjectId>|null} ids  specific employees, or null = every online trackable employee
 * @returns {Promise<number>} how many employees were flagged
 */
export async function requestLiveLocation(ids = null) {
    const now = Date.now();
    const filter = { isOnline: true, position: { $in: TRACKABLE_POSITIONS } };

    if (Array.isArray(ids)) {
        const valid = ids
            .map(String)
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .filter((id) => now - (lastWrite.get(id) || 0) >= WRITE_EVERY_MS);
        if (!valid.length) return 0;
        valid.forEach((id) => lastWrite.set(id, now));
        filter._id = { $in: valid };
    } else {
        if (now - (lastWrite.get("*") || 0) < WRITE_EVERY_MS) return 0;
        lastWrite.set("*", now);
    }

    const res = await Employee.updateMany(filter, {
        $set: { trackingDemandUntil: new Date(now + DEMAND_TTL_MS) },
    });
    return res.modifiedCount ?? 0;
}

/** Is somebody watching this employee right now? */
export const isDemanded = (emp, now = Date.now()) =>
    !!emp?.trackingDemandUntil && new Date(emp.trackingDemandUntil).getTime() > now;
