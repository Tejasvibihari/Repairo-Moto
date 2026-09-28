// services/mechanicPresenceService.js
//
// Single place that flips a mechanic ONLINE / OFFLINE.
// Used by: the on/off switch endpoint, and the stale-connection cron.
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

const fullName = (e) =>
    [e.firstName, e.lastName].filter(Boolean).join(" ").trim() || e.email || "A mechanic";

const timeIST = (d = new Date()) =>
    d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });

function buildMessage(name, online, reason, at) {
    const t = timeIST(at);
    if (online) {
        return {
            title: "🟢 Mechanic Online",
            body: `${name} turned ON the app at ${t} and is now available.`,
        };
    }
    if (reason === "connection_lost") {
        return {
            title: "🟠 Mechanic Disconnected",
            body: `${name} went offline at ${t} (no signal or app closed).`,
        };
    }
    if (reason === "logout") {
        return {
            title: "🔴 Mechanic Offline",
            body: `${name} logged out and went offline at ${t}.`,
        };
    }
    return {
        title: "🔴 Mechanic Offline",
        body: `${name} turned OFF the app at ${t}.`,
    };
}

/**
 * @param {string|ObjectId} employeeId
 * @param {boolean} online
 * @param {{reason?: 'manual'|'logout'|'connection_lost'}} opts
 * @returns {Promise<{changed: boolean}>}
 */
export async function setPresence(employeeId, online, { reason = "manual" } = {}) {
    const now = new Date();
    const set = online
        ? { isOnline: true, lastOnlineAt: now, lastSeenAt: now }
        : { isOnline: false, lastOfflineAt: now };

    // Filter on the OPPOSITE state → atomic "only if it actually changes"
    const emp = await Employee.findOneAndUpdate(
        { _id: employeeId, isOnline: !online },
        { $set: set },
        { new: true }
    )
        .select("firstName lastName email phone currentLocation")
        .lean();

    if (!emp) return { changed: false };

    const name = fullName(emp);
    const message = buildMessage(name, online, reason, now);

    // 1) Live update for anyone watching the map
    emitToWatchers("mechanic:status", {
        id: String(emp._id),
        name,
        phone: emp.phone || null,
        isOnline: online,
        reason,
        at: now,
        location: online ? emp.currentLocation || null : null,
    });

    // 2) Persistent notification + push to all admins
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
