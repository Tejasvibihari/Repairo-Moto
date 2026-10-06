import mongoose from "mongoose";

// One document = one journey of a mechanic / delivery partner for ONE order:
//
//   to_customer ──arrive──▶ at_customer ──work done / order cancelled──▶ to_hub ──hub arrived──▶ closed
//   (counted)               (NOT counted)                                 (counted)
//
// Only the two driving legs add to `distanceMeters`, so a mechanic standing at the customer's
// place (or GPS drifting while he works) never inflates the number the admin pays on.
// The distance is computed on the SERVER from the pings the phone already sends — the phone
// is never trusted to report a total.

const pointSchema = new mongoose.Schema({
    lat: { type: Number },
    lng: { type: Number },
}, { _id: false });

const tripSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    role: { type: String, enum: ["mechanic", "delivery"], required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    orderRef: { type: String, trim: true },                     // human readable order number

    date: { type: String, required: true },                     // IST day the trip started, "YYYY-MM-DD"
    phase: {
        type: String,
        enum: ["to_customer", "at_customer", "to_hub", "closed"],
        default: "to_customer",
    },
    open: { type: Boolean, default: true },                     // false once closed (drives the partial unique index)

    startedAt: { type: Date, default: Date.now },
    arrivedAt: { type: Date, default: null },                   // reached the customer
    returnStartedAt: { type: Date, default: null },             // set off back to the hub
    endedAt: { type: Date, default: null },                     // "Arrived to Hub" (or auto-closed)
    endReason: {
        type: String,
        enum: [null, "hub_arrived", "checkout", "timeout", "next_trip", "reassigned"],
        default: null,
    },

    hub: { type: pointSchema, default: undefined },             // where the trip started (hub / warehouse / wherever he was)
    destination: { type: pointSchema, default: undefined },     // customer location (snapshot of order.userLocation)
    startedFromHub: { type: Boolean, default: true },           // false when a trip was chained from the previous customer

    // ── distance (metres) ──
    distanceMeters: { type: Number, default: 0 },
    legs: {
        outboundM: { type: Number, default: 0 },
        returnM: { type: Number, default: 0 },
    },

    // ── live accounting state ──
    last: { type: pointSchema, default: undefined },            // last ACCEPTED point
    lastT: { type: Number, default: null },                     // its time (ms) — also the optimistic-lock for concurrent pings
    lastAcc: { type: Number },
    speedEma: { type: Number, default: 0 },                     // smoothed moving speed (m/s) → used for the customer's ETA

    // ── audit / anti-fraud ──
    pointCount: { type: Number, default: 0 },
    gapCount: { type: Number, default: 0 },                     // phone silent > 15 min: that stretch is NOT counted
    jumpCount: { type: Number, default: 0 },                    // impossible jumps ignored
    mockedCount: { type: Number, default: 0 },                  // fake-GPS fixes ignored
    arrivalOffsetM: { type: Number, default: null },            // how far from the customer's pin "Arrived" was pressed
    hubOffsetM: { type: Number, default: null },                // how far from the start point "Arrived to Hub" was pressed
    flags: { type: [String], default: [] },                     // e.g. "arrived_far", "hub_far", "mock_gps", "auto_closed"

    // Simplified route for the admin map: [lat, lng, unixSeconds]. Not loaded unless asked for.
    path: { type: [[Number]], default: [], select: false },
}, { timestamps: true });

tripSchema.index({ employeeId: 1, date: 1 });
tripSchema.index({ orderId: 1 });
tripSchema.index({ date: 1, role: 1 });
tripSchema.index({ open: 1, startedAt: 1 });
// A person can only ever have ONE open trip — enforced by the database, not just by code.
tripSchema.index(
    { employeeId: 1 },
    { unique: true, partialFilterExpression: { open: true }, name: "one_open_trip_per_employee" }
);

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
