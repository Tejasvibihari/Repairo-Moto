import BookingSlot from '../Models/bookingSlotModel.js';
import Order from '../Models/orderModel.js';
import { bookingDateRange, getBookingAvailability, normalizeBookingDate } from './bookingPolicy.js';

// All slot times are IST wall-clock, regardless of where the server runs.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isValidSlotTime = (t) => typeof t === 'string' && TIME_RE.test(t);

export const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

export const fromMinutes = (mins) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** "08:00" -> "08:00 AM"  (zero-padded; the format orders already use for preferredTime) */
export const to12h = (t) => {
    const [h, m] = t.split(':').map(Number);
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

/**
 * Accepts "08:00 AM", "8:00 pm", "14:00" and returns "HH:mm" (24h) - or null.
 * Orders in the database hold both styles (app: "10:00 AM", old web form: "14:00").
 */
export const parseAnyTime = (raw) => {
    const s = String(raw ?? '').trim().toUpperCase();
    let m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (m) {
        const h12 = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        if (h12 < 1 || h12 > 12 || min > 59) return null;
        return fromMinutes(((h12 % 12) + (m[3] === 'PM' ? 12 : 0)) * 60 + min);
    }
    m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        const h = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        if (h > 23 || min > 59) return null;
        return fromMinutes(h * 60 + min);
    }
    return null;
};

/** Current IST calendar date + minutes since midnight. */
export const istNow = (now = new Date()) => {
    const d = new Date(now.getTime() + IST_OFFSET_MS);
    return { ymd: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
};

/** Shape sent to the web console and the mobile apps. */
export const serializeSlot = (slot) => {
    const start = slot.startTime;
    const end = slot.endTime || '';
    const value = to12h(start);
    const range = end ? `${value} - ${to12h(end)}` : value;
    return {
        _id: slot._id,
        startTime: start,
        endTime: end,
        label: slot.label || '',
        // `value` is what the app must send back as `preferredTime` when booking.
        value,
        // `displayLabel` is what to show the customer.
        displayLabel: slot.label ? `${range} (${slot.label})` : range,
        isActive: slot.isActive !== false,
        maxBookings: slot.maxBookings ?? null,
    };
};

export const listSlots = ({ onlyActive = false } = {}) =>
    BookingSlot.find(onlyActive ? { isActive: true } : {}).sort({ startTime: 1 }).lean();

/** { 'HH:mm' -> count } of non-cancelled bookings on a date. */
const bookedCountsByTime = async (ymd, excludeOrderId = null) => {
    const filter = { preferredDate: bookingDateRange(ymd), status: { $ne: 'Cancelled' } };
    if (excludeOrderId) filter._id = { $ne: excludeOrderId };
    const orders = await Order.find(filter).select('preferredTime').lean();
    const counts = {};
    for (const o of orders) {
        const t = parseAnyTime(o.preferredTime);
        if (t) counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
};

const slotState = (slot, { ymd, counts, now, dateBlocked }) => {
    const booked = counts[slot.startTime] || 0;
    const remaining = slot.maxBookings == null ? null : Math.max(slot.maxBookings - booked, 0);
    let reason = null;
    if (dateBlocked) reason = dateBlocked.code;
    else if (ymd < now.ymd || (ymd === now.ymd && toMinutes(slot.startTime) <= now.minutes)) reason = 'SLOT_PAST';
    else if (remaining === 0) reason = 'SLOT_FULL';
    return { booked, remaining, available: reason === null, unavailableReason: reason };
};

/**
 * Slots a customer can pick on `ymd`, each flagged available / unavailable with the reason.
 * `enforced` is false when the admin has not configured any slots yet (free-form time).
 */
export const getSlotsForDate = async (ymd) => {
    const date = normalizeBookingDate(ymd);
    if (!date) return { error: { status: 400, code: 'INVALID_DATE', message: 'Date must use YYYY-MM-DD format.' } };

    const [all, availability] = await Promise.all([listSlots(), getBookingAvailability(date)]);
    const active = all.filter((s) => s.isActive !== false);
    const counts = await bookedCountsByTime(date);
    const now = istNow();
    const dateBlocked = availability.available ? null : availability;

    return {
        date,
        enforced: all.length > 0,
        dateAvailability: {
            available: availability.available,
            code: availability.code,
            title: availability.title || null,
            message: availability.message || null,
        },
        slots: active.map((slot) => ({
            ...serializeSlot(slot),
            ...slotState(slot, { ymd: date, counts, now, dateBlocked }),
        })),
    };
};

const slotError = (status, code, message, details = {}) =>
    Object.assign(new Error(message), { status, code, details });

/**
 * Throws a SLOT_* error unless `preferredTime` is a currently bookable slot on `ymd`.
 * Returns { enforced, value }; `value` is the canonical "08:00 AM" string to store.
 *
 *  - No slots configured at all -> not enforced (old free-form behaviour keeps working).
 *  - Emergency Repair is "as soon as possible", so it is never tied to a slot.
 */
export const assertSlotBookable = async ({ ymd, preferredTime, serviceType, excludeOrderId = null }) => {
    if (serviceType === 'Emergency Repair') return { enforced: false, value: null };

    const all = await listSlots();
    if (all.length === 0) return { enforced: false, value: null };

    const time = parseAnyTime(preferredTime);
    const slot = time && all.find((s) => s.startTime === time && s.isActive !== false);
    if (!slot) {
        throw slotError(400, 'SLOT_NOT_AVAILABLE', 'This time slot is not available. Please choose one of the available slots.');
    }

    const date = normalizeBookingDate(ymd);
    const counts = await bookedCountsByTime(date, excludeOrderId);
    const state = slotState(slot, { ymd: date, counts, now: istNow(), dateBlocked: null });
    if (state.unavailableReason === 'SLOT_PAST') {
        throw slotError(409, 'SLOT_PAST', 'This time slot has already passed. Please choose a later slot.');
    }
    if (state.unavailableReason === 'SLOT_FULL') {
        throw slotError(409, 'SLOT_FULL', 'This time slot is fully booked. Please choose another slot.', { slot: serializeSlot(slot) });
    }
    return { enforced: true, value: to12h(slot.startTime) };
};
