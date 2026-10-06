// Controllers/orderTrackingController.js
//
// Customer side of live tracking:  GET /api/user/order-tracking/:orderId
//
// • The customer app calls this every ~10s while its tracking screen is open (and pauses when the
//   app goes to the background).
// • Each call is ALSO the "somebody is watching" signal, so the mechanic / delivery phone
//   switches to the fast GPS stream only while a customer is really looking (and goes back to
//   the distance-based trip mode afterwards). See services/trackingService.js.
// • What the customer may see follows the TRIP: only while the person is driving TO this
//   customer (phase `to_customer`, i.e. order status "Mechanic Start" for mechanics), only for
//   people who are ONLINE, only a first name, and never anyone else's orders.
// • Every tracker also carries an approximate arrival time (`eta`).
import mongoose from "mongoose";
import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import Trip from "../Models/tripModel.js";
import { ROLE_LABEL, requestLiveLocation } from "../services/trackingService.js";
import { estimateEta } from "../services/tripService.js";

const POLL_AFTER_MS = 10 * 1000;

export const getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid order id." });
        }

        // Only the customer who owns the order
        const order = await Order.findOne({ _id: orderId, userId: req.user._id })
            .select("status userLocation")
            .lean();
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });

        const trips = await Trip.find({ orderId, open: true, phase: "to_customer" })
            .select("role employeeId destination speedEma startedAt")
            .lean();
        if (!trips.length) {
            return res.json({ success: true, trackable: false, orderStatus: order.status, trackers: [], eta: null, pollAfterMs: 30 * 1000 });
        }

        const people = await Employee.find({ _id: { $in: trips.map((t) => t.employeeId) } })
            .select("firstName isOnline currentLocation")
            .lean();
        const byId = new Map(people.map((p) => [String(p._id), p]));

        const trackers = [];
        for (const t of trips) {
            const p = byId.get(String(t.employeeId));
            const loc = p?.isOnline ? p.currentLocation : null;
            const has = loc?.lat != null && loc?.lng != null;
            const eta = has ? await estimateEta(t, { lat: loc.lat, lng: loc.lng }).catch(() => null) : null;
            trackers.push({
                role: t.role,
                label: ROLE_LABEL[t.role],
                name: p?.firstName || ROLE_LABEL[t.role],
                online: !!p?.isOnline,
                startedAt: t.startedAt,
                location: has
                    ? { lat: loc.lat, lng: loc.lng, heading: loc.heading ?? null, speed: loc.speed ?? null, updatedAt: loc.updatedAt || null }
                    : null,
                eta: eta
                    ? { minutes: eta.minutes, distanceKm: eta.distanceKm, arrivalAt: eta.arrivalAt, arriving: eta.arriving }
                    : null,
            });
        }

        // "A customer is watching" → wake the phones of the people being shown
        requestLiveLocation(trips.map((t) => t.employeeId))
            .catch((e) => console.error("[orderTracking] demand failed:", e.message));

        // The headline ETA is the mechanic's (he is the one the customer is waiting for)
        const headline = trackers.find((t) => t.role === "mechanic" && t.eta) || trackers.find((t) => t.eta) || null;

        res.json({
            success: true,
            trackable: true,
            orderStatus: order.status,
            destination: order.userLocation?.coordinates?.length === 2
                ? { lat: order.userLocation.coordinates[1], lng: order.userLocation.coordinates[0] }
                : null,
            trackers,
            eta: headline?.eta || null,
            pollAfterMs: POLL_AFTER_MS,
        });
    } catch (err) {
        console.error("[orderTracking]", err);
        res.status(500).json({ success: false, message: "Could not load tracking." });
    }
};
