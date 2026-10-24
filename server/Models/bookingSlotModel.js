import mongoose from 'mongoose';

// A bookable time slot the admin controls from the Console web dashboard.
//
// Times are wall-clock IST in 24h "HH:mm". The slot's `startTime` is the value a
// customer books (it is stored on the order as `preferredTime`, e.g. "08:00 AM").
// `endTime` is optional and only used to show a range ("08:00 AM - 09:00 AM").
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const bookingSlotSchema = new mongoose.Schema({
    startTime: { type: String, required: true, unique: true, match: TIME_RE },
    endTime: { type: String, default: '', validate: { validator: (v) => !v || TIME_RE.test(v), message: 'endTime must be HH:mm' } },
    // Optional friendly name shown next to the time ("Morning", "Lunch break")
    label: { type: String, default: '', trim: true, maxlength: 40 },
    // Disabled slots are hidden from customers but kept so they can be re-enabled.
    isActive: { type: Boolean, default: true },
    // Max non-cancelled bookings per calendar date for this slot. null = unlimited.
    maxBookings: { type: Number, default: null, min: 1, max: 1000 },
}, { timestamps: true });

export default mongoose.model('BookingSlot', bookingSlotSchema);
