// Controllers/mechanicTrackingController.js
import Employee from "../Models/employeeModel.js";
import Order from "../Models/orderModel.js";
import Attendance from "../Models/attendanceModel.js";
import { setPresence } from "../services/mechanicPresenceService.js";
import { recordPoints } from "../services/tripService.js";
import { toKm } from "../Utils/geo.js";
import { emitToWatchers } from "../sockets/trackingSocket.js";
import { istDateKey, openBreakOf } from "../Utils/attendanceUtils.js";
import {
    CUSTOMER_VISIBLE_STATUSES,
    TRACKABLE_POSITIONS,
    isDemanded,
    isTrackable,
} from "../services/trackingService.js";

// Online/Offline is driven by ATTENDANCE (checked in = online; break / signed out = offline),
// so a person can only be put online here while they are really checked in right now.
async function isCheckedInNow(employeeId) {
    const rec = await Attendance.findOne({ employeeId, date: istDateKey() })
        .select("checkIn.at checkOut.at breaks")
        .lean();
    return !!rec?.checkIn?.at && !rec.checkOut?.at && !openBreakOf(rec.breaks);
}

const WATCHER_POSITIONS = ["manager", "operational manager"];

const nameOf = (e) =>
    [e.firstName, e.lastName].filter(Boolean).join(" ").trim() || e.email;

// Every ≤15s (not on every ping) look at the person's orders:
//   • mechanic → copy the live position onto their en-route orders, so the customer's tracking
//     screen (Order.mechanicLocation) stays fresh without hammering the orders collection.
//   • delivery → just check whether they are on an order the customer can follow.
// The result also tells us if the person is EN ROUTE to a customer. While they are, the phone
// stays in the fast "live" mode (a customer may open the tracking screen at any moment).
const lastOrderSync = new Map();
const enRoute = new Map();                 // employeeId → boolean (result of the last check)
const ORDER_SYNC_MS = 15 * 1000;

async function syncActiveOrders(employeeId, position, lat, lng, now) {
    const key = String(employeeId);
    if (now - (lastOrderSync.get(key) || 0) < ORDER_SYNC_MS) return;
    lastOrderSync.set(key, now);

    const statuses = CUSTOMER_VISIBLE_STATUSES[position] || [];
    if (position === "delivery") {
        enRoute.set(key, !!(await Order.exists({ deliveryId: employeeId, status: { $in: statuses } })));
        return;
    }
    const res = await Order.updateMany(
        { mechanicIds: employeeId, status: { $in: statuses } },
        { $set: { mechanicLocation: { type: "Point", coordinates: [lng, lat], lastUpdated: new Date(now) } } }
    );
    enRoute.set(key, (res.matchedCount ?? res.modifiedCount ?? 0) > 0);
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
            canTrack: isTrackable(req.employee.position),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/employee/auth/status   body: { online: boolean, reason?: 'logout' | 'no_location' }
//
// There is no free on/off switch any more: going ONLINE is only allowed while the person is
// checked in (the app calls this to re-sync after the server or the phone lost the connection).
// Going OFFLINE is always allowed (logout, location permission turned off).
export const setMyStatus = async (req, res) => {
    try {
        if (!isTrackable(req.employee.position)) {
            return res.status(403).json({ success: false, message: "Only mechanics and delivery partners have an online status." });
        }
        const { online, reason } = req.body || {};
        if (typeof online !== "boolean") {
            return res.status(400).json({ success: false, message: "`online` must be true or false." });
        }
        if (online && !(await isCheckedInNow(req.employee._id))) {
            return res.status(409).json({
                success: false,
                code: "NOT_CHECKED_IN",
                message: "Mark your attendance (or resume from your break) to go online.",
            });
        }
        const { changed } = await setPresence(req.employee._id, online, {
            reason: online ? "resume" : reason === "logout" ? "logout" : reason === "no_location" ? "no_location" : "manual",
            notify: !online,          // going online again is routine — only the offline side is worth a notification
        });
        res.json({ success: true, isOnline: online, changed });
    } catch (err) {
        console.error("[setMyStatus]", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/employee/auth/location
//   body: { lat, lng, speed?, heading?, accuracy?, mocked?,
//           points?: [{ lat, lng, t (ms), acc?, mocked? }] }     ← every fix since the last successful upload
//
// While the person is on a trip (Employee.activeTripId) the fixes are also added to the trip's
// distance (services/tripService.js). Reply: { live, mode, trip }
//   mode 'live' → somebody is watching (admin map / customer screen): fast GPS, every ~5 s
//   mode 'trip' → driving to the customer or back to the hub: distance-based GPS (cheap, batched)
//   mode 'idle' → nothing to record: low-power ping about once a minute
export const postMyLocation = async (req, res) => {
    try {
        const { lat, lng, speed, heading, accuracy, points, mocked } = req.body || {};
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
        ).select("firstName lastName email position trackingDemandUntil activeTripId").lean();

        // Server says OFFLINE (break / signed out / cron marked them offline).
        // 409 tells the app to stop the background tracking.
        if (!emp) return res.status(409).json({ success: false, code: "OFFLINE" });

        emitToWatchers("mechanic:location", {
            id: String(emp._id),
            name: nameOf(emp),
            position: emp.position || null,
            lat, lng,
            speed: num(speed), heading: num(heading), accuracy: num(accuracy),
            at: now,
        });

        syncActiveOrders(emp._id, emp.position, lat, lng, now.getTime())
            .catch((e) => console.error("[syncActiveOrders]", e.message));

        // Trip distance: only people who are on a trip cost an extra query
        let trip = null;
        if (emp.activeTripId) {
            try {
                const batch = Array.isArray(points) && points.length
                    ? points
                    : [{ lat, lng, t: now.getTime(), acc: num(accuracy), mocked: mocked === true }];
                trip = await recordPoints(emp.activeTripId, batch, now.getTime());
            } catch (e) {
                console.error("[trip.recordPoints]", e.message);
            }
        }

        // Tell the phone which GPS mode to use (see the header of this handler)
        const watched = isDemanded(emp, now.getTime());
        const moving = !!trip?.moving;
        const mode = watched ? "live" : moving ? "trip" : "idle";
        // `live` stays for app builds that only know the two-mode protocol
        const live = watched || moving || enRoute.get(String(emp._id)) === true;
        res.json({
            success: true,
            live,
            mode,
            trip: trip?.phase ? { phase: trip.phase, distanceKm: toKm(trip.distanceMeters) } : null,
        });
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
            .select("firstName lastName email phone position profileImage currentLocation lastSeenAt lastOnlineAt")
            .lean();

        res.json({
            success: true,
            mechanics: list.map((e) => ({
                id: String(e._id),
                name: nameOf(e),
                phone: e.phone || null,
                position: e.position || null,
                profileImage: e.profileImage || null,
                lat: e.currentLocation?.lat ?? null,
                lng: e.currentLocation?.lng ?? null,
                speed: e.currentLocation?.speed ?? null,
                heading: e.currentLocation?.heading ?? null,
                accuracy: e.currentLocation?.accuracy ?? null,
                at: e.currentLocation?.updatedAt || e.lastSeenAt || e.lastOnlineAt,
                onlineSince: e.lastOnlineAt,
            })),
        });
    } catch (err) {
        console.error("[getLiveMechanics]", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// GET /api/admin/tracking/staff — EVERY mechanic + delivery partner, online or not, with the reason.
// Lets the web map explain "0 online" (not checked in / on break / signed out / phone silent)
// instead of just showing an empty map.
export const getTrackableStaff = async (req, res) => {
    try {
        const u = req.user || {};
        const allowed = u.model === "Admin" || WATCHER_POSITIONS.includes(u.position);
        if (!allowed) return res.status(403).json({ success: false, message: "Not allowed." });

        const list = await Employee.find({ position: { $in: TRACKABLE_POSITIONS } })
            .select("firstName lastName email phone position isOnline lastOnlineAt lastOfflineAt lastSeenAt currentLocation")
            .lean();
        const records = await Attendance.find({
            employeeId: { $in: list.map((e) => e._id) },
            date: istDateKey(),
        }).select("employeeId checkIn.at checkOut.at breaks").lean();
        const byEmp = new Map(records.map((r) => [String(r.employeeId), r]));

        const attendanceOf = (rec) =>
            !rec?.checkIn?.at ? "not_marked"
                : rec.checkOut?.at ? "checked_out"
                    : openBreakOf(rec.breaks) ? "on_break"
                        : "checked_in";

        res.json({
            success: true,
            staff: list.map((e) => {
                const attendance = attendanceOf(byEmp.get(String(e._id)));
                const online = !!e.isOnline;
                let reason = null;
                if (!online) {
                    reason = attendance === "not_marked" ? "Has not marked attendance today"
                        : attendance === "on_break" ? "On a break"
                            : attendance === "checked_out" ? "Signed out for the day"
                                : "Checked in, but the phone is not sharing location (open the app, allow location 'all the time')";
                }
                return {
                    id: String(e._id),
                    name: nameOf(e),
                    phone: e.phone || null,
                    position: e.position || null,
                    online,
                    attendance,
                    reason,
                    lastSeenAt: e.lastSeenAt || null,
                    lastOfflineAt: e.lastOfflineAt || null,
                    lat: e.currentLocation?.lat ?? null,
                    lng: e.currentLocation?.lng ?? null,
                };
            }),
        });
    } catch (err) {
        console.error("[getTrackableStaff]", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
