// services/mechanicPresenceService.js
//
// Single place that flips a mechanic / delivery partner ONLINE / OFFLINE.
// Used by: attendance (check-in / break / resume / sign-out), the status endpoint,
// and the stale-connection cron.
//
// Online is DRIVEN BY ATTENDANCE: checked-in = online; on a break / signed out = offline.
//
// Guarantees:
//   • Idempotent — only acts when the state really changes, so a double tap or a
//     cron/manual race never sends the admin two identical notifications.
//   • Admin gets (1) a DB notification + Expo push through your existing
//     createNotification(), and (2) a live socket event so the map updates instantly.
//   • Never throws into the caller because of a notification failure.
import Employee from "../Models/employeeModel.js";
import { createNotification, getAdminRecipients } from "./notificationService.js";
import { emitToWatchers } from "../sockets/trackingSocket.js";
import { ROLE_LABEL } from "./trackingService.js";
import { resetDutyAnchor } from "./dutyDistanceService.js";

const fullName = (e) =>
    [e.firstName, e.lastName].filter(Boolean).join(" ").trim() || e.email || "A mechanic";

const timeIST = (d = new Date()) =>
    d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });

function buildMessage(name, online, reason, at, role) {
    const t = timeIST(at);
    if (online) {
        return {
            title: `🟢 ${role} Online`,
            body: `${name} is online since ${t} and now available.`,
        };
    }
    if (reason === "connection_lost") {
        return {
            title: `🟠 ${role} Disconnected`,
            body: `${name} went offline at ${t} (no signal or app closed).`,
        };
    }
    if (reason === "logout") {
        return {
            title: `🔴 ${role} Offline`,
            body: `${name} logged out and went offline at ${t}.`,
        };
    }
    if (reason === "no_location") {
        return {
            title: `🔴 ${role} Offline`,
            body: `${name} could not share location at ${t} (location permission is off).`,
        };
    }
    if (reason === "break") {
        return { title: `🔴 ${role} Offline`, body: `${name} went on a break at ${t}.` };
    }
    if (reason === "sign_out") {
        return { title: `🔴 ${role} Offline`, body: `${name} signed out at ${t}.` };
    }
    return {
        title: `🔴 ${role} Offline`,
        body: `${name} went offline at ${t}.`,
    };
}

/**
 * @param {string|ObjectId} employeeId
 * @param {boolean} online
 * @param {{
 *   reason?: 'attendance'|'break'|'resume'|'sign_out'|'manual'|'logout'|'connection_lost'|'no_location'|'attendance_ended',
 *   notify?: boolean   // false → update the live map only, no admin notification/push (default true)
 * }} opts
 * @returns {Promise<{changed: boolean}>}
 */
export async function setPresence(employeeId, online, { reason = "manual", notify = true } = {}) {
    const now = new Date();
    const set = online
        ? { isOnline: true, lastOnlineAt: now, lastSeenAt: now }
        : { isOnline: false, lastOfflineAt: now, trackingDemandUntil: null };   // nobody can be watching an offline person

    // Filter on the OPPOSITE state → atomic "only if it actually changes".
    // $ne (not `isOnline: !online`): staff created before the field existed have NO isOnline value,
    // and `{ isOnline: false }` does not match a missing field → they could never go online.
    const emp = await Employee.findOneAndUpdate(
        { _id: employeeId, isOnline: { $ne: online } },
        { $set: set },
        { new: true }
    )
        .select("firstName lastName email phone position currentLocation")
        .lean();

    if (!emp) return { changed: false };

    // Online/offline changed → forget the last GPS point, so the ground covered between a break
    // and the resume (phone off, lift in a car, ...) is never counted as distance.
    resetDutyAnchor(emp._id).catch((e) => console.error("[mechanicPresence] duty anchor reset failed:", e.message));

    const name = fullName(emp);
    const role = ROLE_LABEL[emp.position] || "Staff";
    const message = buildMessage(name, online, reason, now, role);

    // 1) Live update for anyone watching the map
    emitToWatchers("mechanic:status", {
        id: String(emp._id),
        name,
        phone: emp.phone || null,
        position: emp.position || null,
        isOnline: online,
        reason,
        at: now,
        location: online ? emp.currentLocation || null : null,
    });

    // 2) Persistent notification + push to all admins (skipped for routine attendance-driven changes —
    //    admins already get the attendance notifications, and the map updates live anyway)
    if (!notify) return { changed: true };
    try {
        const recipients = await getAdminRecipients();
        await createNotification({
            type: "mechanic_status",
            title: message.title,
            body: message.body,
            recipients,
            data: {
                screen: "LiveMechanics",
                employeeId: String(emp._id),
                mechanicName: name,
                position: emp.position || null,
                isOnline: online,
                reason,
                at: now.toISOString(),
            },
            triggeredBy: { userId: emp._id, userModel: "Employee" },
        });
    } catch (err) {
        console.error("[mechanicPresence] notify failed:", err.message);
    }

    return { changed: true };
}
