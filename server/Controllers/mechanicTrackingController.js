// Controllers/mechanicTrackingController.js
import Employee from "../Models/employeeModel.js";
import Order from "../Models/orderModel.js";
import { setPresence } from "../services/mechanicPresenceService.js";
import { emitToWatchers } from "../sockets/trackingSocket.js";

// Only these positions can go "Online" and be tracked. Add "delivery" here later if needed.
const TRACKABLE_POSITIONS = ["mechanic"];
const WATCHER_POSITIONS = ["manager", "operational manager"];

const nameOf = (e) =>
    [e.firstName, e.lastName].filter(Boolean).join(" ").trim() || e.email;

// Copy the mechanic's live position onto their en-route orders at most every 15s,
// so the customer's tracking screen (Order.mechanicLocation) stays fresh without
// hammering the orders collection on every 5-second ping.
const lastOrderSync = new Map();
const ORDER_SYNC_MS = 15 * 1000;

async function syncActiveOrders(employeeId, lat, lng, now) {
    const key = String(employeeId);
    if (now - (lastOrderSync.get(key) || 0) < ORDER_SYNC_MS) return;
    lastOrderSync.set(key, now);
    await Order.updateMany(
        { mechanicIds: employeeId, status: "Mechanic Assigned" },
        { $set: { mechanicLocation: { type: "Point", coordinates: [lng, lat], lastUpdated: new Date(now) } } }
    );
}

// GET /api/employee/auth/status — app calls this on open to re-sync the switch
export const getMyStatus = async (req, res) => {
    try {
        const emp = await Employee.findById(req.employee._id)
            .select("isOnline lastOnlineAt lastOfflineAt")
            .lean();
        res.json({
            success: true,
            isOnline: !!emp?.isOnline,
            canTrack: TRACKABLE_POSITIONS.includes(req.employee.position),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/employee/auth/status   body: { online: boolean, reason?: 'logout' }
export const setMyStatus = async (req, res) => {
    try {
        if (!TRACKABLE_POSITIONS.includes(req.employee.position)) {
            return res.status(403).json({ success: false, message: "Only mechanics can change online status." });
        }
        const { online, reason } = req.body || {};
        if (typeof online !== "boolean") {
            return res.status(400).json({ success: false, message: "`online` must be true or false." });
        }
        const { changed } = await setPresence(req.employee._id, online, {
            reason: !online && reason === "logout" ? "logout" : "manual",
        });
        res.json({ success: true, isOnline: online, changed });
    } catch (err) {
        console.error("[setMyStatus]", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/employee/auth/location   body: { lat, lng, speed?, heading?, accuracy? }
export const postMyLocation = async (req, res) => {
    try {
        const { lat, lng, speed, heading, accuracy } = req.body || {};
        const valid =
            Number.isFinite(lat) && Number.isFinite(lng) &&
            Math.abs(lat) <= 90 && Math.abs(lng) <= 180 &&
            !(lat === 0 && lng === 0);
        if (!valid) {
            return res.status(400).json({ success: false, message: "Invalid coordinates." });
        }

        const now = new Date();
        const num = (v) => (Number.isFinite(v) ? v : undefined);

        // Only accepted while the mechanic is ONLINE on the server
        const emp = await Employee.findOneAndUpdate(
            { _id: req.employee._id, isOnline: true },
            {
                $set: {
                    currentLocation: {
                        lat, lng,
                        speed: num(speed), heading: num(heading), accuracy: num(accuracy),
                        updatedAt: now,
                    },
                    lastSeenAt: now,
                },
            },
            { new: true }
        ).select("firstName lastName email").lean();

        // Server says OFFLINE (cron marked them offline / toggled from elsewhere).
        // 409 tells the app to stop the background tracking.
        if (!emp) return res.status(409).json({ success: false, code: "OFFLINE" });

        emitToWatchers("mechanic:location", {
            id: String(emp._id),
            name: nameOf(emp),
            lat, lng,
            speed: num(speed), heading: num(heading), accuracy: num(accuracy),
            at: now,
        });

        syncActiveOrders(emp._id, lat, lng, now.getTime())
            .catch((e) => console.error("[syncActiveOrders]", e.message));

        res.json({ success: true });
    } catch (err) {
        console.error("[postMyLocation]", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/tracking/live — snapshot for the admin map (before socket updates arrive)
export const getLiveMechanics = async (req, res) => {
    try {
        const u = req.user || {};
        const allowed = u.model === "Admin" || WATCHER_POSITIONS.includes(u.position);
        if (!allowed) return res.status(403).json({ success: false, message: "Not allowed." });

        const list = await Employee.find({ isOnline: true, position: { $in: TRACKABLE_POSITIONS } })
            .select("firstName lastName email phone profileImage currentLocation lastSeenAt lastOnlineAt")
            .lean();

        res.json({
            success: true,
            mechanics: list.map((e) => ({
                id: String(e._id),
                name: nameOf(e),
                phone: e.phone || null,
                profileImage: e.profileImage || null,
                lat: e.currentLocation?.lat ?? null,
                lng: e.currentLocation?.lng ?? null,
                speed: e.currentLocation?.speed ?? null,
                at: e.currentLocation?.updatedAt || e.lastSeenAt || e.lastOnlineAt,
                onlineSince: e.lastOnlineAt,
            })),
        });
    } catch (err) {
        console.error("[getLiveMechanics]", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
