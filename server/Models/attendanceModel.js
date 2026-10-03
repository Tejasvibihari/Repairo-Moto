import mongoose from "mongoose";

// One document per employee per calendar day (IST).
// `date` is the IST day key ("YYYY-MM-DD") and is what makes "already marked today" a
// database-level guarantee (unique index below) instead of a race-prone check.

const stampSchema = new mongoose.Schema({
    at: { type: Date },                 // server time (never the phone's clock)
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },         // metres
    address: { type: String, trim: true, maxlength: 300 },   // reverse-geocoded by the app (best effort)
    mocked: { type: Boolean, default: false },                // Android "mock location" flag
}, { _id: false });

// A break inside the working day. `end` is missing while the employee is still on it.
// Breaks carry no location — they must be instant and are not what the admin audits.
const breakSchema = new mongoose.Schema({
    start: { type: Date, required: true },   // server time
    end: { type: Date },
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
        index: true,
    },
    date: { type: String, required: true },          // IST day key, e.g. "2026-10-03"
    checkIn: { type: stampSchema },
    checkOut: { type: stampSchema },
    breaks: { type: [breakSchema], default: [] },
    workedMinutes: { type: Number, default: 0 },     // filled on sign-out — NET of breaks
    breakMinutes: { type: Number, default: 0 },      // filled on sign-out — total break time
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
