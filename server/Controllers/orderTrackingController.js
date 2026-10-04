// Controllers/orderTrackingController.js
//
// Customer side of live tracking:  GET /api/user/order-tracking/:orderId
//
// • The customer app calls this every ~10s while its tracking screen is open.
// • Each call is ALSO the "somebody is watching" signal, so the mechanic / delivery phone
//   switches to the fast GPS stream only while a customer is really looking (and goes back to
//   low-power afterwards). See services/trackingService.js.
// • What the customer may see follows the ORDER FLOW: only while the order is in a status listed
//   in CUSTOMER_VISIBLE_STATUSES, only for people who are ONLINE (checked in), only a first name,
//   and never anyone else's orders.
import mongoose from "mongoose";
import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import {
    CUSTOMER_VISIBLE_STATUSES,
    ROLE_LABEL,
    requestLiveLocation,
} from "../services/trackingService.js";

const POLL_AFTER_MS = 10 * 1000;

export const getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid order id." });
        }

        // Only the customer who owns the order
        const order = await Order.findOne({ _id: orderId, userId: req.user._id })
            .select("status mechanicIds deliveryId userLocation")
            .lean();
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });

        const candidates = [];
        if (order.mechanicIds?.[0]) candidates.push({ role: "mechanic", id: order.mechanicIds[0] });
        if (order.deliveryId) candidates.push({ role: "delivery", id: order.deliveryId });

        // Order flow decides who may be followed right now
        const allowed = candidates.filter((c) => (CUSTOMER_VISIBLE_STATUSES[c.role] || []).includes(order.status));
        if (!allowed.length) {
            return res.json({ success: true, trackable: false, orderStatus: order.status, trackers: [], pollAfterMs: 30 * 1000 });
        }

        const people = await Employee.find({ _id: { $in: allowed.map((a) => a.id) } })
            .select("firstName isOnline currentLocation")
            .lean();
        const byId = new Map(people.map((p) => [String(p._id), p]));

        const trackers = allowed.map(({ role, id }) => {
            const p = byId.get(String(id));
            const loc = p?.isOnline ? p.currentLocation : null;
            return {
                role,
                label: ROLE_LABEL[role],
                name: p?.firstName || ROLE_LABEL[role],
                online: !!p?.isOnline,
                location: loc?.lat != null && loc?.lng != null
                    ? { lat: loc.lat, lng: loc.lng, heading: loc.heading ?? null, speed: loc.speed ?? null, updatedAt: loc.updatedAt || null }
                    : null,
            };
        });

        // "A customer is watching" → wake the phones of the people being shown
        requestLiveLocation(allowed.map((a) => a.id))
            .catch((e) => console.error("[orderTracking] demand failed:", e.message));

        res.json({
            success: true,
            trackable: true,
            orderStatus: order.status,
            destination: order.userLocation?.coordinates?.length === 2
                ? { lat: order.userLocation.coordinates[1], lng: order.userLocation.coordinates[0] }
                : null,
            trackers,
            pollAfterMs: POLL_AFTER_MS,
        });
    } catch (err) {
        console.error("[orderTracking]", err);
        res.status(500).json({ success: false, message: "Could not load tracking." });
    }
};
