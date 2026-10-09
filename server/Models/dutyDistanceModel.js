import mongoose from "mongoose";

// One document = the distance ONE mechanic / delivery partner travelled on ONE IST day while
// he was ONLINE (checked in, not on a break). It is independent of orders and trips:
//
//     online + moving  →  distance grows        offline / standing still  →  nothing changes
//
// The distance is computed on the SERVER from the pings the phone already sends
// (POST /api/employee/auth/location) — the phone is never trusted to report a total.
// Per-order trips (Models/tripModel.js) still exist for the order timeline and ETA.

const pointSchema = new mongoose.Schema({
    lat: { type: Number },
    lng: { type: Number },
}, { _id: false });

const dutyDistanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    role: { type: String, enum: ["mechanic", "delivery"] },
    date: { type: String, required: true },                     // IST day, "YYYY-MM-DD"

    distanceMeters: { type: Number, default: 0 },

    // live accounting state
    last: { type: pointSchema, default: undefined },            // last ACCEPTED point
    lastT: { type: Number, default: null },                     // its time (ms) — also the optimistic lock for racing pings
    lastAcc: { type: Number },
    lastMoveAt: { type: Number, default: null },                // when distance last grew (ms) → "is he moving?"

    // audit
    pointCount: { type: Number, default: 0 },
    gapCount: { type: Number, default: 0 },                     // phone silent > 15 min: that stretch is NOT counted
    jumpCount: { type: Number, default: 0 },                    // impossible jumps ignored
    mockedCount: { type: Number, default: 0 },                  // fake-GPS fixes ignored
}, { timestamps: true });

dutyDistanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
dutyDistanceSchema.index({ date: 1 });

const DutyDistance = mongoose.model("DutyDistance", dutyDistanceSchema);
export default DutyDistance;
