// services/tripService.js
//
// Distance tracking for mechanics + delivery partners.
//
//   start ─▶ to_customer ─▶ at_customer ─▶ to_hub ─▶ closed
//            (counted)      (not counted)   (counted)
//
// WHERE THE KILOMETRES COME FROM
//   The phone already sends GPS pings (POST /api/employee/auth/location). While a trip is in a
//   driving phase the server feeds those pings to recordPoints(), which adds up the road distance.
//   A point is only counted when it passes ALL of these filters, so GPS noise cannot be turned
//   into paid kilometres:
//     • not flagged as a mock / fake-GPS fix
//     • accuracy better than MAX_ACCURACY_M
//     • moved more than the GPS error radius since the last accepted point (stationary jitter)
//     • implied speed below MAX_SPEED_MPS (teleport jumps)
//     • no longer than GAP_MS since the last point (a dark phone is a gap, not a straight line)
//
// BATTERY
//   The phone only needs the fast GPS mode while a trip is in a driving phase (or somebody is
//   watching). At the customer's place (at_customer) it drops back to the once-a-minute
//   low-power ping. The server tells the phone which mode to use in every ping reply.
import mongoose from "mongoose";
import axios from "axios";
import Trip from "../Models/tripModel.js";
import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import { haversineM, isValidLatLng, toKm } from "../Utils/geo.js";
import { istDateKey } from "../Utils/attendanceUtils.js";
import { isTrackable } from "./trackingService.js";
import { notifyOrderParties } from "./notificationService.js";

export const MOVING_PHASES = ["to_customer", "to_hub"];

const RULES = {
    MAX_ACCURACY_M: 80,            // ignore fixes worse than this
    MAX_SPEED_MPS: 40,             // 144 km/h — nobody on a bike goes faster, so it is a GPS jump
    MIN_STEP_M: 15,                // floor for the "did he really move?" check
    GAP_MS: 15 * 60 * 1000,        // silent longer than this → don't draw a straight line across it
    PATH_STEP_M: 40,               // store a route point at most every 40 m
    PATH_MAX_POINTS: 1500,
    FAR_M: 500,                    // "arrived" pressed this far from the pin → flagged for the admin
    FRESH_LOCATION_MS: 5 * 60 * 1000,
    ROAD_FACTOR: 1.35,             // road distance ≈ straight line × 1.35 (city)
    DEFAULT_SPEED_MPS: 6,          // ≈ 21 km/h average city speed when we have no data yet
};

export class TripError extends Error {
    constructor(code, message, status = 400) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

const nameOf = (e) => [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim() || e?.email || "Staff";
const sec = (ms) => Math.round(ms / 1000);

// ─── Serialisers ─────────────────────────────────────────────────────────────

export function tripPayload(t, { withPath = false } = {}) {
    if (!t) return null;
    return {
        id: String(t._id),
        role: t.role,
        employeeId: String(t.employeeId?._id || t.employeeId),
        employeeName: t.employeeId?.firstName !== undefined ? nameOf(t.employeeId) : undefined,
        orderId: String(t.orderId),
        orderRef: t.orderRef || null,
        date: t.date,
        phase: t.phase,
        startedAt: t.startedAt,
        arrivedAt: t.arrivedAt || null,
        returnStartedAt: t.returnStartedAt || null,
        endedAt: t.endedAt || null,
        endReason: t.endReason || null,
        distanceKm: toKm(t.distanceMeters),
        outboundKm: toKm(t.legs?.outboundM),
        returnKm: toKm(t.legs?.returnM),
        startedFromHub: t.startedFromHub !== false,
        hub: t.hub?.lat != null ? { lat: t.hub.lat, lng: t.hub.lng } : null,
        destination: t.destination?.lat != null ? { lat: t.destination.lat, lng: t.destination.lng } : null,
        arrivalOffsetM: t.arrivalOffsetM ?? null,
        hubOffsetM: t.hubOffsetM ?? null,
        flags: t.flags || [],
        gapCount: t.gapCount || 0,
        mockedCount: t.mockedCount || 0,
        ...(withPath ? { path: (t.path || []).map(([lat, lng, s]) => [lat, lng, s]) } : {}),
    };
}

// ─── Distance accounting ─────────────────────────────────────────────────────

function normalizePoints(raw, nowMs) {
    const out = [];
    for (const p of Array.isArray(raw) ? raw : []) {
        const lat = Number(p?.lat);
        const lng = Number(p?.lng);
        if (!isValidLatLng(lat, lng)) continue;
        let t = Number(p.t);
        // A wrong phone clock must not reorder or poison the trip → fall back to server time
        if (!Number.isFinite(t) || t > nowMs + 60 * 1000 || t < nowMs - 36 * 3600 * 1000) t = nowMs;
        const acc = Number(p.acc);
        out.push({ lat, lng, t, acc: Number.isFinite(acc) && acc >= 0 ? acc : undefined, mocked: p.mocked === true });
    }
    return out.sort((a, b) => a.t - b.t).slice(-60);
}

/**
 * Add GPS points to a trip. Safe to call with duplicates / old points / a trip in any phase.
 * @returns {{moving: boolean, phase: string|null, distanceMeters: number}}
 */
export async function recordPoints(tripId, rawPoints, nowMs = Date.now()) {
    const trip = await Trip.findById(tripId)
        .select("phase last lastT lastAcc speedEma distanceMeters")
        .lean();
    if (!trip) return { moving: false, phase: null, distanceMeters: 0 };
    if (!MOVING_PHASES.includes(trip.phase)) {
        return { moving: false, phase: trip.phase, distanceMeters: trip.distanceMeters || 0 };
    }

    const pts = normalizePoints(rawPoints, nowMs);
    const leg = trip.phase === "to_customer" ? "legs.outboundM" : "legs.returnM";

    let last = trip.last?.lat != null && trip.lastT != null
        ? { lat: trip.last.lat, lng: trip.last.lng, t: trip.lastT, acc: trip.lastAcc }
        : null;
    let lastStored = last;
    let add = 0, accepted = 0, gaps = 0, jumps = 0, mocked = 0;
    let ema = trip.speedEma || 0;
    const stored = [];

    for (const p of pts) {
        if (p.mocked) { mocked++; continue; }
        if (p.acc !== undefined && p.acc > RULES.MAX_ACCURACY_M) continue;

        if (!last) {                                   // first usable point: just anchor
            last = lastStored = p; accepted++;
            stored.push([p.lat, p.lng, sec(p.t)]);
            continue;
        }
        const dt = p.t - last.t;
        if (dt <= 0) continue;                         // already counted / out of order

        if (dt > RULES.GAP_MS) {                       // phone was dark: re-anchor, don't count the jump
            gaps++; last = lastStored = p; accepted++;
            stored.push([p.lat, p.lng, sec(p.t)]);
            continue;
        }
        const d = haversineM(last, p);
        const minStep = Math.max(RULES.MIN_STEP_M, Math.min(p.acc || 0, 50) * 0.5);
        if (d < minStep) continue;                     // standing still / GPS drift
        if (d / (dt / 1000) > RULES.MAX_SPEED_MPS) { jumps++; continue; }

        add += d; accepted++;
        const v = d / (dt / 1000);
        if (v > 1.5) ema = ema ? ema * 0.8 + v * 0.2 : v;
        last = p;
        if (!lastStored || haversineM(lastStored, p) >= RULES.PATH_STEP_M) {
            stored.push([p.lat, p.lng, sec(p.t)]);
            lastStored = p;
        }
    }

    const current = (trip.distanceMeters || 0);
    if (!accepted && !gaps && !jumps && !mocked) {
        return { moving: true, phase: trip.phase, distanceMeters: current };
    }

    const $set = { speedEma: Math.round(ema * 100) / 100 };
    if (last) {
        $set.last = { lat: last.lat, lng: last.lng };
        $set.lastT = last.t;
        if (last.acc !== undefined) $set.lastAcc = last.acc;
    }
    const $inc = {};
    if (add > 0) { $inc.distanceMeters = add; $inc[leg] = add; }
    if (accepted) $inc.pointCount = accepted;
    if (gaps) $inc.gapCount = gaps;
    if (jumps) $inc.jumpCount = jumps;
    if (mocked) $inc.mockedCount = mocked;
    const update = { $set };
    if (Object.keys($inc).length) update.$inc = $inc;
    if (stored.length) update.$push = { path: { $each: stored, $slice: -RULES.PATH_MAX_POINTS } };
    if (mocked) update.$addToSet = { flags: "mock_gps" };

    // lastT is an optimistic lock: if two pings raced, the loser is simply dropped and the next
    // ping measures from the winner's point, so nothing is ever counted twice.
    const r = await Trip.updateOne({ _id: trip._id, phase: trip.phase, lastT: trip.lastT ?? null }, update);
    return {
        moving: true,
        phase: trip.phase,
        distanceMeters: r.modifiedCount ? current + add : current,
    };
}

// ─── ETA (customer app) ──────────────────────────────────────────────────────

const etaCache = new Map();                       // tripId → { at, value }
const ETA_CACHE_MS = 90 * 1000;

/**
 * Approximate arrival time.
 *  • Default: straight-line distance × road factor ÷ the person's real moving speed (smoothed from
 *    the trip itself; 21 km/h until we have data). Free, instant, good enough for "about 12 min".
 *  • If GOOGLE_MAPS_SERVER_KEY is set, the Distance Matrix API (with live traffic) is used instead,
 *    cached for 90 s per trip so a customer polling every 10 s costs ONE API call per 90 s.
 */
export async function estimateEta(trip, from) {
    const to = trip?.destination;
    if (to?.lat == null || !from || !isValidLatLng(from.lat, from.lng) || !isValidLatLng(to.lat, to.lng)) return null;

    const key = String(trip._id);
    const hit = etaCache.get(key);
    if (hit && Date.now() - hit.at < ETA_CACHE_MS) return hit.value;

    const straight = haversineM(from, to);
    const speed = Math.min(11, Math.max(3.5, trip.speedEma > 2 ? trip.speedEma : RULES.DEFAULT_SPEED_MPS));
    let distanceM = straight * RULES.ROAD_FACTOR;
    let seconds = distanceM / speed;
    let source = "estimate";

    const gKey = process.env.GOOGLE_MAPS_SERVER_KEY;
    if (gKey && straight > 300) {
        try {
            const { data } = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
                params: {
                    origins: `${from.lat},${from.lng}`,
                    destinations: `${to.lat},${to.lng}`,
                    departure_time: "now",
                    mode: "driving",
                    key: gKey,
                },
                timeout: 4000,
            });
            const el = data?.rows?.[0]?.elements?.[0];
            if (el?.status === "OK") {
                distanceM = el.distance.value;
                seconds = (el.duration_in_traffic || el.duration).value;
                source = "google";
            }
        } catch { /* keep the estimate */ }
    }

    const minutes = Math.max(1, Math.ceil(seconds / 60));
    const value = {
        minutes,
        distanceKm: toKm(distanceM),
        arrivalAt: new Date(Date.now() + minutes * 60 * 1000),
        arriving: straight < 250,
        source,
    };
    etaCache.set(key, { at: Date.now(), value });
    if (etaCache.size > 500) for (const k of [...etaCache.keys()].slice(0, 200)) etaCache.delete(k);
    return value;
}

// ─── Order summary kept in sync (cheap copy for lists / timelines) ───────────

async function syncOrderTravel(trip) {
    if (!trip || trip.role !== "mechanic") return;
    const phase = trip.phase === "closed" ? (trip.endReason === "hub_arrived" ? "at_hub" : "closed") : trip.phase;
    await Order.updateOne(
        { _id: trip.orderId, "travel.tripId": trip._id },
        {
            $set: {
                "travel.phase": phase,
                "travel.distanceMeters": Math.round(trip.distanceMeters || 0),
                "travel.outboundMeters": Math.round(trip.legs?.outboundM || 0),
                "travel.returnMeters": Math.round(trip.legs?.returnM || 0),
                "travel.arrivedAt": trip.arrivedAt || null,
                "travel.returnStartedAt": trip.returnStartedAt || null,
                "travel.hubArrivedAt": trip.endReason === "hub_arrived" ? trip.endedAt : null,
            },
        }
    );
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

const OPEN_PHASES = ["to_customer", "at_customer", "to_hub"];
const DELIVERY_BLOCKED = ["Cancelled", "Completed"];

export async function getActiveTrip(employeeId) {
    return Trip.findOne({ employeeId, open: true }).select("-path").lean();
}

/** "Start" — leaves the hub (mechanic: order → Mechanic Start). */
export async function startTrip({ employeeId, orderId, lat, lng }) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) throw new TripError("BAD_ORDER", "Invalid order.", 400);

    const emp = await Employee.findById(employeeId)
        .select("firstName lastName email position isOnline currentLocation lastSeenAt activeTripId")
        .lean();
    if (!emp) throw new TripError("NOT_FOUND", "Employee not found.", 404);
    if (!isTrackable(emp.position)) throw new TripError("NOT_TRACKABLE", "Only mechanics and delivery partners can start a trip.", 403);
    if (!emp.isOnline) {
        throw new TripError("NOT_ONLINE", "Mark your attendance (or resume from your break) before you start.", 409);
    }

    const order = await Order.findById(orderId);
    if (!order) throw new TripError("NOT_FOUND", "Order not found.", 404);

    const role = emp.position;
    if (role === "mechanic") {
        if (!(order.mechanicIds || []).some((m) => String(m) === String(emp._id))) {
            throw new TripError("NOT_ASSIGNED", "This order is not assigned to you.", 403);
        }
    } else if (String(order.deliveryId) !== String(emp._id)) {
        throw new TripError("NOT_ASSIGNED", "This order is not assigned to you.", 403);
    }

    // Same-order double tap (already on this trip) is handled below; everything else must be in the right state
    const sameOrderTrip = emp.activeTripId
        ? await Trip.exists({ _id: emp.activeTripId, orderId: order._id, open: true, phase: { $ne: "to_hub" } })
        : null;
    if (!sameOrderTrip) {
        if (role === "mechanic") {
            if (order.status !== "Mechanic Assigned") {
                throw new TripError("BAD_STATUS", `You can only start when the order is "Mechanic Assigned" (it is "${order.status}").`, 409);
            }
        } else if (DELIVERY_BLOCKED.includes(order.status)) {
            throw new TripError("BAD_STATUS", `This order is already ${order.status.toLowerCase()}.`, 409);
        }
    }

    // Where is he starting from?
    const fresh = emp.currentLocation?.updatedAt &&
        Date.now() - new Date(emp.currentLocation.updatedAt).getTime() < RULES.FRESH_LOCATION_MS;
    const origin = isValidLatLng(Number(lat), Number(lng))
        ? { lat: Number(lat), lng: Number(lng) }
        : fresh ? { lat: emp.currentLocation.lat, lng: emp.currentLocation.lng } : null;
    if (!origin) throw new TripError("NO_LOCATION", "Could not get your location. Turn on GPS and try again.", 400);

    // One open trip per person
    let chained = false;
    if (emp.activeTripId) {
        const cur = await Trip.findOne({ _id: emp.activeTripId, open: true }).select("phase orderId").lean();
        if (!cur) {
            await Employee.updateOne({ _id: emp._id, activeTripId: emp.activeTripId }, { $set: { activeTripId: null } });
        } else if (String(cur.orderId) === String(order._id) && cur.phase !== "to_hub") {
            const trip = await Trip.findById(cur._id).select("-path").lean();   // double tap → same trip
            return { trip, order, already: true };
        } else if (cur.phase === "to_hub") {
            await closeTrip(cur._id, "next_trip");                               // going straight to the next customer
            chained = true;
        } else {
            throw new TripError("ACTIVE_TRIP", "Finish your current trip before starting a new one.", 409);
        }
    }

    // Claim the "one trip" slot atomically, then create the trip
    const tripId = new mongoose.Types.ObjectId();
    const claim = await Employee.updateOne(
        { _id: emp._id, $or: [{ activeTripId: null }, { activeTripId: { $exists: false } }] },
        { $set: { activeTripId: tripId } }
    );
    if (!claim.modifiedCount) throw new TripError("ACTIVE_TRIP", "You already have a trip in progress.", 409);

    const nowMs = Date.now();
    const dest = order.userLocation?.coordinates?.length === 2
        ? { lat: order.userLocation.coordinates[1], lng: order.userLocation.coordinates[0] }
        : undefined;

    let trip;
    try {
        trip = await Trip.create({
            _id: tripId,
            employeeId: emp._id,
            role,
            orderId: order._id,
            orderRef: order.orderId,
            date: istDateKey(new Date(nowMs)),
            phase: "to_customer",
            startedAt: new Date(nowMs),
            hub: origin,
            destination: dest,
            startedFromHub: !chained,
            last: origin,
            lastT: nowMs,
            path: [[origin.lat, origin.lng, sec(nowMs)]],
        });

        if (role === "mechanic") {
            order.status = "Mechanic Start";
            order.mechanicStartedAt = new Date(nowMs);
            order.travel = {
                employeeId: emp._id,
                tripId,
                phase: "to_customer",
                startedAt: new Date(nowMs),
                distanceMeters: 0,
                outboundMeters: 0,
                returnMeters: 0,
            };
            await order.save();
        }
    } catch (err) {
        await Trip.deleteOne({ _id: tripId }).catch(() => { });
        await Employee.updateOne({ _id: emp._id, activeTripId: tripId }, { $set: { activeTripId: null } }).catch(() => { });
        throw err;
    }

    if (role === "mechanic") {
        const eta = await estimateEta({ ...trip.toObject(), destination: dest }, origin).catch(() => null);
        await notifyOrderParties(order, {
            type: "mechanic_started",
            actor: { userId: emp._id, userModel: "Employee" },
            data: { etaMinutes: eta?.minutes ?? null },
            user: {
                title: "🛵 Your mechanic is on the way",
                body: `${emp.firstName || "Your mechanic"} has started for order #${order.orderId}${eta ? ` — arriving in about ${eta.minutes} min.` : "."} Track it live in the app.`,
            },
            staff: {
                title: "🛵 Mechanic Started",
                body: `${nameOf(emp)} left for order #${order.orderId}${eta ? ` (ETA ~${eta.minutes} min)` : ""}.`,
            },
            skipRoles: ["mechanic"],
        });
    }

    return { trip: trip.toObject(), order, already: false };
}

/**
 * Reached the customer. Mechanic: called from confirmMechanicArrival (order → Mechanic Arrived).
 * Delivery: called from the trips endpoint; there is no job to wait for, so he heads back at once.
 * Idempotent; returns null when there is no trip to move (e.g. the mechanic never pressed Start).
 */
export async function arriveAtCustomer({ orderId, employeeId = null, role = "mechanic", lat, lng }) {
    const filter = { orderId, role, phase: "to_customer", open: true };
    if (employeeId) filter.employeeId = employeeId;
    const trip = await Trip.findOne(filter).select("_id destination last role employeeId").lean();
    if (!trip) return null;

    const nowMs = Date.now();
    const here = isValidLatLng(Number(lat), Number(lng)) ? { lat: Number(lat), lng: Number(lng) } : null;
    if (here) await recordPoints(trip._id, [{ ...here, t: nowMs }], nowMs);   // the last stretch up to the door

    const ref = here || (trip.last?.lat != null ? trip.last : null);
    const offset = ref && trip.destination?.lat != null ? Math.round(haversineM(ref, trip.destination)) : null;

    const $set = { phase: "at_customer", arrivedAt: new Date(nowMs), arrivalOffsetM: offset };
    const update = { $set };
    if (role === "delivery") {                       // no work to wait for → straight back
        $set.phase = "to_hub";
        $set.returnStartedAt = new Date(nowMs);
        if (ref) { $set.last = { lat: ref.lat, lng: ref.lng }; $set.lastT = nowMs; }
        else { $set.lastT = null; update.$unset = { last: "" }; }
    }
    if (offset != null && offset > RULES.FAR_M) update.$addToSet = { flags: "arrived_far" };

    const updated = await Trip.findOneAndUpdate({ _id: trip._id, phase: "to_customer" }, update, { new: true })
        .select("-path").lean();
    if (updated) await syncOrderTravel(updated);
    return updated;
}

/** Set off for the hub. Automatic on Work Completed / Cancelled; manual endpoint as a fallback. */
export async function beginReturn(tripId) {
    const trip = await Trip.findOne({ _id: tripId, open: true, phase: { $in: ["at_customer", "to_customer"] } })
        .select("employeeId").lean();
    if (!trip) return null;

    // Anchor the return leg at where he is NOW, so time spent at the customer is never measured.
    const emp = await Employee.findById(trip.employeeId).select("currentLocation").lean();
    const nowMs = Date.now();
    const loc = emp?.currentLocation;
    const fresh = loc?.lat != null && loc.updatedAt && nowMs - new Date(loc.updatedAt).getTime() < RULES.FRESH_LOCATION_MS;

    const $set = { phase: "to_hub", returnStartedAt: new Date(nowMs) };
    const update = { $set };
    if (fresh) { $set.last = { lat: loc.lat, lng: loc.lng }; $set.lastT = nowMs; }
    else { $set.lastT = null; update.$unset = { last: "" }; }

    const updated = await Trip.findOneAndUpdate(
        { _id: tripId, open: true, phase: { $in: ["at_customer", "to_customer"] } }, update, { new: true }
    ).select("-path").lean();
    if (updated) await syncOrderTravel(updated);
    return updated;
}

/** "Arrived to Hub" — the movement is complete. */
export async function arriveAtHub({ tripId, employeeId, lat, lng }) {
    const trip = await Trip.findOne({ _id: tripId, employeeId }).select("phase open hub last role").lean();
    if (!trip) throw new TripError("NOT_FOUND", "Trip not found.", 404);
    if (!trip.open) return { trip: await Trip.findById(tripId).select("-path").lean(), already: true };
    if (trip.phase !== "to_hub") {
        throw new TripError(
            "WRONG_PHASE",
            trip.phase === "to_customer"
                ? "Mark your arrival at the customer first."
                : "Finish the job first — the trip back to the hub starts after the work is completed.",
            409
        );
    }
    const nowMs = Date.now();
    const here = isValidLatLng(Number(lat), Number(lng)) ? { lat: Number(lat), lng: Number(lng) } : null;
    if (here) await recordPoints(tripId, [{ ...here, t: nowMs }], nowMs);

    const ref = here || (trip.last?.lat != null ? trip.last : null);
    const hubOffsetM = ref && trip.hub?.lat != null ? Math.round(haversineM(ref, trip.hub)) : null;
    const closed = await closeTrip(tripId, "hub_arrived", { hubOffsetM });
    return { trip: closed, already: false };
}

/** Close a trip for any reason. Distance recorded so far is kept. */
export async function closeTrip(tripId, reason, extra = {}) {
    const update = { $set: { phase: "closed", open: false, endedAt: new Date(), endReason: reason, ...extra } };
    const flags = [];
    if (reason === "checkout" || reason === "timeout") flags.push("auto_closed");
    if (extra.hubOffsetM != null && extra.hubOffsetM > RULES.FAR_M) flags.push("hub_far");
    if (flags.length) update.$addToSet = { flags: { $each: flags } };

    const trip = await Trip.findOneAndUpdate({ _id: tripId, open: true }, update, { new: true })
        .select("-path").lean();
    if (!trip) return null;
    await Employee.updateOne({ _id: trip.employeeId, activeTripId: trip._id }, { $set: { activeTripId: null } });
    await syncOrderTravel(trip).catch((e) => console.error("[trip] order sync failed:", e.message));
    return trip;
}

export async function closeOpenTripsFor(employeeId, reason) {
    const trips = await Trip.find({ employeeId, open: true }).select("_id").lean();
    for (const t of trips) await closeTrip(t._id, reason);
    return trips.length;
}

/** Mechanic(s) taken off an order while travelling to it. */
export async function closeTripsForOrder(orderId, employeeIds, reason) {
    const ids = (employeeIds || []).map(String);
    if (!ids.length) return 0;
    const trips = await Trip.find({ orderId, open: true, employeeId: { $in: ids } }).select("_id").lean();
    for (const t of trips) await closeTrip(t._id, reason);
    return trips.length;
}

/**
 * Called by the Order model after a save that changed the status.
 *   Work Completed → the mechanic is free to leave → return leg starts
 *   Cancelled      → everybody still travelling for it turns back
 */
export async function onOrderStatusChanged(order) {
    // Admin moved the order back (force-update) while the mechanic was on the road → that trip is void
    if (order.status === "Pending" || order.status === "Mechanic Assigned") {
        const stale = await Trip.find({ orderId: order._id, role: "mechanic", open: true, phase: "to_customer" })
            .select("_id").lean();
        for (const t of stale) await closeTrip(t._id, "reassigned");
        return;
    }
    const roles = order.status === "Work Completed" ? ["mechanic"]
        : order.status === "Cancelled" ? ["mechanic", "delivery"] : null;
    if (!roles) return;
    const trips = await Trip.find({
        orderId: order._id, role: { $in: roles }, open: true, phase: { $in: ["to_customer", "at_customer"] },
    }).select("_id").lean();
    for (const t of trips) await beginReturn(t._id);
}

/** Safety net used by the cron: a trip that nobody closed. */
export async function closeStaleTrips(maxHours = Number(process.env.TRIP_MAX_HOURS) || 16) {
    const cutoff = new Date(Date.now() - maxHours * 3600 * 1000);
    const stale = await Trip.find({ open: true, startedAt: { $lt: cutoff } }).select("_id").lean();
    for (const t of stale) await closeTrip(t._id, "timeout");
    return stale.length;
}

export { OPEN_PHASES };
