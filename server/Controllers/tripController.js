// Controllers/tripController.js
//
// Employee side (mounted at /api/employee/trips — mechanics + delivery partners):
//   GET  /active            the trip in progress (app calls it on open to restore its buttons + GPS mode)
//   GET  /my-summary        my own kilometres: today / this month / last 30 days
//   POST /start             { orderId, lat?, lng? }   leave the hub → to the customer
//   POST /:id/arrive        { lat?, lng? }            delivery partners only (mechanics use the order's
//                                                      mechanic-arrived endpoint, which also moves the status)
//   POST /:id/return        {}                        head back to the hub (fallback — normally automatic)
//   POST /:id/hub-arrived   { lat?, lng? }            "Arrived to Hub" — movement complete
//
// Admin side (see trackingAdminRoutes.js):
//   GET /api/admin/tracking/trips/order/:orderId     every trip of an order, with the route
import mongoose from "mongoose";
import Trip from "../Models/tripModel.js";
import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import { istDateKey, istMonthKey } from "../Utils/attendanceUtils.js";
import { toKm } from "../Utils/geo.js";
import { isTrackable } from "../services/trackingService.js";
import {
    TripError,
    arriveAtCustomer,
    arriveAtHub,
    beginReturn,
    estimateEta,
    getActiveTrip,
    startTrip,
    tripPayload,
} from "../services/tripService.js";

const WATCHER_POSITIONS = ["manager", "operational manager"];

const fail = (res, err, tag) => {
    if (err instanceof TripError) {
        return res.status(err.status).json({ success: false, code: err.code, message: err.message });
    }
    console.error(`[${tag}]`, err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
};

const mustBeTrackable = (req, res) => {
    if (isTrackable(req.employee?.position)) return true;
    res.status(403).json({ success: false, message: "Only mechanics and delivery partners have trips." });
    return false;
};

// GET /api/employee/trips/active
export const getMyActiveTrip = async (req, res) => {
    try {
        if (!mustBeTrackable(req, res)) return;
        const trip = await getActiveTrip(req.employee._id);
        res.json({ success: true, trip: tripPayload(trip) });
    } catch (err) { fail(res, err, "getMyActiveTrip"); }
};

// POST /api/employee/trips/start
export const startMyTrip = async (req, res) => {
    try {
        if (!mustBeTrackable(req, res)) return;
        const { orderId, lat, lng } = req.body || {};
        const { trip, order, already } = await startTrip({ employeeId: req.employee._id, orderId, lat, lng });
        res.json({
            success: true,
            already,
            trip: tripPayload(trip),
            orderStatus: order.status,
        });
    } catch (err) { fail(res, err, "startMyTrip"); }
};

// POST /api/employee/trips/:id/arrive   (delivery partners)
export const arriveMyTrip = async (req, res) => {
    try {
        if (!mustBeTrackable(req, res)) return;
        if (req.employee.position !== "delivery") {
            return res.status(400).json({ success: false, message: "Mechanics mark arrival from the order screen." });
        }
        const trip = await Trip.findOne({ _id: req.params.id, employeeId: req.employee._id }).select("orderId phase").lean();
        if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
        const { lat, lng } = req.body || {};
        const updated = await arriveAtCustomer({
            orderId: trip.orderId, employeeId: req.employee._id, role: "delivery", lat, lng,
        });
        const current = updated || (await Trip.findById(trip._id).select("-path").lean());   // double tap → current state
        res.json({ success: true, trip: tripPayload(current) });
    } catch (err) { fail(res, err, "arriveMyTrip"); }
};

// POST /api/employee/trips/:id/return
export const returnMyTrip = async (req, res) => {
    try {
        if (!mustBeTrackable(req, res)) return;
        const trip = await Trip.findOne({ _id: req.params.id, employeeId: req.employee._id }).select("orderId phase open role").lean();
        if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
        if (!trip.open) return res.status(409).json({ success: false, message: "This trip has already ended." });
        if (trip.phase === "to_hub") {
            return res.json({ success: true, trip: tripPayload(await Trip.findById(trip._id).select("-path").lean()) });
        }
        // A mechanic in the middle of the job must finish (or have it cancelled) first
        if (trip.role === "mechanic") {
            const order = await Order.findById(trip.orderId).select("status").lean();
            if (["Mechanic Start", "Mechanic Arrived", "In Progress", "Completion Requested"].includes(order?.status)) {
                return res.status(409).json({
                    success: false,
                    message: "The job is not finished yet. Complete it (or ask the admin to cancel it) before heading back.",
                });
            }
        }
        const updated = await beginReturn(trip._id);
        res.json({ success: true, trip: tripPayload(updated) });
    } catch (err) { fail(res, err, "returnMyTrip"); }
};

// POST /api/employee/trips/:id/hub-arrived
export const hubArrivedMyTrip = async (req, res) => {
    try {
        if (!mustBeTrackable(req, res)) return;
        const { lat, lng } = req.body || {};
        const { trip, already } = await arriveAtHub({
            tripId: req.params.id, employeeId: req.employee._id, lat, lng,
        });
        res.json({ success: true, already, trip: tripPayload(trip) });
    } catch (err) { fail(res, err, "hubArrivedMyTrip"); }
};

// GET /api/employee/trips/my-summary — the person's own kilometres (transparent for pay)
export const getMyTripSummary = async (req, res) => {
    try {
        if (!mustBeTrackable(req, res)) return;
        const id = new mongoose.Types.ObjectId(req.employee._id);
        const today = istDateKey();
        const month = istMonthKey();
        const since = istDateKey(new Date(Date.now() - 29 * 86400000));

        const [row] = await Trip.aggregate([
            { $match: { employeeId: id, date: { $gte: since } } },
            {
                $group: {
                    _id: null,
                    last30M: { $sum: "$distanceMeters" },
                    last30Trips: { $sum: 1 },
                    todayM: { $sum: { $cond: [{ $eq: ["$date", today] }, "$distanceMeters", 0] } },
                    todayTrips: { $sum: { $cond: [{ $eq: ["$date", today] }, 1, 0] } },
                    monthM: { $sum: { $cond: [{ $eq: [{ $substrBytes: ["$date", 0, 7] }, month] }, "$distanceMeters", 0] } },
                    monthTrips: { $sum: { $cond: [{ $eq: [{ $substrBytes: ["$date", 0, 7] }, month] }, 1, 0] } },
                },
            },
        ]);
        res.json({
            success: true,
            today: { km: toKm(row?.todayM), trips: row?.todayTrips || 0 },
            month: { km: toKm(row?.monthM), trips: row?.monthTrips || 0 },
            last30Days: { km: toKm(row?.last30M), trips: row?.last30Trips || 0 },
        });
    } catch (err) { fail(res, err, "getMyTripSummary"); }
};

// GET /api/admin/tracking/trips/order/:orderId
export const getOrderTrips = async (req, res) => {
    try {
        const u = req.user || {};
        if (!(u.model === "Admin" || WATCHER_POSITIONS.includes(u.position))) {
            return res.status(403).json({ success: false, message: "Not allowed." });
        }
        const { orderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid order id." });
        }
        const trips = await Trip.find({ orderId })
            .select("+path")
            .populate("employeeId", "firstName lastName email position")
            .sort({ startedAt: 1 })
            .lean();

        // For a trip that is still driving, also say where the person is right now
        const out = [];
        for (const t of trips) {
            const payload = tripPayload(t, { withPath: true });
            if (t.open) {
                const emp = await Employee.findById(t.employeeId?._id).select("currentLocation isOnline").lean();
                payload.live = emp?.currentLocation?.lat != null
                    ? { lat: emp.currentLocation.lat, lng: emp.currentLocation.lng, at: emp.currentLocation.updatedAt, online: !!emp.isOnline }
                    : null;
                if (t.phase === "to_customer" && payload.live) {
                    payload.eta = await estimateEta(t, payload.live).catch(() => null);
                }
            }
            out.push(payload);
        }
        const totalKm = toKm(trips.reduce((s, t) => s + (t.distanceMeters || 0), 0));
        res.json({ success: true, totalKm, trips: out });
    } catch (err) { fail(res, err, "getOrderTrips"); }
};
