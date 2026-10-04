// sockets/trackingSocket.js
//
// Live tracking of mechanics + delivery partners — SERVER → ADMIN.
// Staff phones do NOT connect here: they POST location over HTTP
// (POST /api/employee/auth/location) because sockets die in the background,
// while a background HTTP call keeps working. The controller then calls
// emitToWatchers() so every admin sees the marker move.
//
// Watchers also send a "watch" heartbeat while their live map is on screen. That flags the
// staff as "being watched", which makes their phones switch to the fast GPS stream (and back
// to low-power when the heartbeats stop). See services/trackingService.js.
//
// Namespace: /tracking     Rooms: "watchers" (admins + managers)
import jwt from "jsonwebtoken";
import Admin from "../Models/adminModel.js";
import Employee from "../Models/employeeModel.js";
import { requestLiveLocation } from "../services/trackingService.js";

let ns = null;

// Same rule as controllers: admins + managers may watch mechanics.
const WATCHER_POSITIONS = ["manager", "operational manager"];

const verifyWith = (token, secret) => {
    if (!secret) return null;
    try {
        return jwt.verify(token, secret);
    } catch {
        return null;
    }
};

async function authenticateWatcher(token) {
    if (!token) return null;

    const adminDecoded = verifyWith(token, process.env.ADMIN_JWT_SECRET);
    if (adminDecoded?.id) {
        const admin = await Admin.findById(adminDecoded.id).select("_id").lean();
        if (admin) return { id: admin._id, type: "admin" };
    }

    const empDecoded = verifyWith(token, process.env.EMPLOYEE_JWT_SECRET);
    if (empDecoded?.id) {
        const emp = await Employee.findById(empDecoded.id).select("_id position").lean();
        if (emp && WATCHER_POSITIONS.includes(emp.position)) {
            return { id: emp._id, type: "employee" };
        }
    }
    return null;
}

export const setupTrackingSockets = (io) => {
    ns = io.of("/tracking");

    ns.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        const watcher = await authenticateWatcher(token);
        if (!watcher) return next(new Error("Unauthorized"));
        socket.user = watcher;
        next();
    });

    ns.on("connection", (socket) => {
        socket.join("watchers");
        console.log(`📍 tracking watcher ${socket.user.type} ${socket.user.id} connected`);

        // { ids?: string[] }  — which people are on screen; omit for "everyone online".
        // Send it when the map opens and every ~30s while it stays open.
        socket.on("watch", async (payload) => {
            try {
                const ids = Array.isArray(payload?.ids) ? payload.ids.slice(0, 200) : null;
                await requestLiveLocation(ids);
            } catch (err) {
                console.error("[tracking] watch failed:", err.message);
            }
        });

        socket.on("disconnect", () => { });
    });
};

/** Broadcast an event ("mechanic:location" | "mechanic:status") to all watchers. */
export const emitToWatchers = (event, payload) => {
    ns?.to("watchers").emit(event, payload);
};
