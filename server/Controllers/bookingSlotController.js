import mongoose from 'mongoose';
import BookingSlot from '../Models/bookingSlotModel.js';
import {
    fromMinutes, getSlotsForDate, isValidSlotTime, listSlots, serializeSlot, toMinutes,
} from '../Utils/bookingSlots.js';

const fail = (res, status, message, extra = {}) => res.status(status).json({ success: false, message, ...extra });
const MAX_GENERATED = 48;

// Validates the editable fields. Returns { error } or { data } holding only what was sent.
const parseSlotBody = (body = {}, { partial = false } = {}) => {
    const data = {};

    if (body.startTime !== undefined || !partial) {
        if (!isValidSlotTime(body.startTime)) return { error: 'Start time is required (HH:mm, 24-hour).' };
        data.startTime = body.startTime;
    }
    if (body.endTime !== undefined) {
        const end = body.endTime === null ? '' : body.endTime;
        if (end !== '' && !isValidSlotTime(end)) return { error: 'End time must be HH:mm (24-hour).' };
        data.endTime = end;
    }
    if (body.label !== undefined) {
        const label = String(body.label ?? '').trim();
        if (label.length > 40) return { error: 'Label can be at most 40 characters.' };
        data.label = label;
    }
    if (body.isActive !== undefined) {
        if (typeof body.isActive !== 'boolean') return { error: 'isActive must be true or false.' };
        data.isActive = body.isActive;
    }
    if (body.maxBookings !== undefined) {
        if (body.maxBookings === null || body.maxBookings === '') data.maxBookings = null;
        else {
            const n = Number(body.maxBookings);
            if (!Number.isInteger(n) || n < 1 || n > 1000) return { error: 'Max bookings must be a whole number between 1 and 1000, or empty for unlimited.' };
            data.maxBookings = n;
        }
    }
    return { data };
};

const checkRange = (start, end) =>
    end && toMinutes(end) <= toMinutes(start) ? 'End time must be after the start time.' : null;

// ── Public ────────────────────────────────────────────────────────────────────

// GET /api/booking-slots?date=YYYY-MM-DD
// The apps call this when the customer picks a date. Only enabled slots are returned.
// Without `date` it returns the enabled slots with no per-date availability.
export const getPublicSlots = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { date } = req.query;

        if (date) {
            const result = await getSlotsForDate(date);
            if (result.error) return fail(res, result.error.status, result.error.message, { code: result.error.code });
            return res.json({ success: true, ...result });
        }

        const all = await listSlots();
        return res.json({
            success: true,
            enforced: all.length > 0,
            slots: all.filter((s) => s.isActive !== false).map(serializeSlot),
        });
    } catch (err) {
        console.error('[bookingSlots] public list failed:', err);
        return fail(res, 500, 'Could not load time slots.');
    }
};

// ── Admin CRUD ────────────────────────────────────────────────────────────────

// GET /api/admin/booking-slots   (all slots, including disabled ones)
export const adminListSlots = async (req, res) => {
    try {
        const slots = await listSlots();
        return res.json({ success: true, slots: slots.map(serializeSlot) });
    } catch (err) {
        console.error('[bookingSlots] admin list failed:', err);
        return fail(res, 500, 'Could not load time slots.');
    }
};

// POST /api/admin/booking-slots
export const createSlot = async (req, res) => {
    try {
        const { data, error } = parseSlotBody(req.body);
        if (error) return fail(res, 400, error);
        const rangeError = checkRange(data.startTime, data.endTime);
        if (rangeError) return fail(res, 400, rangeError);

        const slot = await BookingSlot.create(data);
        return res.status(201).json({ success: true, slot: serializeSlot(slot) });
    } catch (err) {
        if (err.code === 11000) return fail(res, 409, 'A slot with this start time already exists.');
        console.error('[bookingSlots] create failed:', err);
        return fail(res, 500, 'Could not create the time slot.');
    }
};

// PUT /api/admin/booking-slots/:id   (send any subset of the fields)
export const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, 'Invalid slot id.');

        const { data, error } = parseSlotBody(req.body, { partial: true });
        if (error) return fail(res, 400, error);

        const slot = await BookingSlot.findById(id);
        if (!slot) return fail(res, 404, 'Time slot not found.');

        const nextStart = data.startTime ?? slot.startTime;
        const nextEnd = data.endTime ?? slot.endTime;
        const rangeError = checkRange(nextStart, nextEnd);
        if (rangeError) return fail(res, 400, rangeError);

        slot.set(data);
        await slot.save();
        return res.json({ success: true, slot: serializeSlot(slot) });
    } catch (err) {
        if (err.code === 11000) return fail(res, 409, 'A slot with this start time already exists.');
        console.error('[bookingSlots] update failed:', err);
        return fail(res, 500, 'Could not update the time slot.');
    }
};

// PATCH /api/admin/booking-slots/:id/toggle   (enable <-> disable)
export const toggleSlot = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, 'Invalid slot id.');

        const slot = await BookingSlot.findById(id);
        if (!slot) return fail(res, 404, 'Time slot not found.');

        slot.isActive = typeof req.body?.isActive === 'boolean' ? req.body.isActive : !slot.isActive;
        await slot.save();
        return res.json({ success: true, slot: serializeSlot(slot) });
    } catch (err) {
        console.error('[bookingSlots] toggle failed:', err);
        return fail(res, 500, 'Could not update the time slot.');
    }
};

// DELETE /api/admin/booking-slots/:id
// Existing bookings keep their stored time; only future booking choices change.
export const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, 'Invalid slot id.');

        const slot = await BookingSlot.findByIdAndDelete(id);
        if (!slot) return fail(res, 404, 'Time slot not found.');
        return res.json({ success: true, message: 'Time slot deleted.' });
    } catch (err) {
        console.error('[bookingSlots] delete failed:', err);
        return fail(res, 500, 'Could not delete the time slot.');
    }
};

// POST /api/admin/booking-slots/generate
// body: { startTime:"08:00", endTime:"15:00", intervalMinutes:60, maxBookings?:number|null, replaceExisting?:boolean }
// Builds back-to-back slots covering [startTime, endTime): 08:00-09:00 ... 14:00-15:00.
// This is the quick way to switch the whole day from "8 to 3" to "9 to 6".
export const generateSlots = async (req, res) => {
    try {
        const { startTime, endTime, intervalMinutes, maxBookings = null, replaceExisting = false } = req.body || {};

        if (!isValidSlotTime(startTime) || !isValidSlotTime(endTime)) return fail(res, 400, 'Start and end time are required (HH:mm, 24-hour).');
        const from = toMinutes(startTime);
        const to = toMinutes(endTime);
        if (to <= from) return fail(res, 400, 'End time must be after the start time.');

        const step = Number(intervalMinutes);
        if (!Number.isInteger(step) || step < 15 || step > 480) return fail(res, 400, 'Interval must be between 15 and 480 minutes.');

        const parsedMax = maxBookings === null || maxBookings === '' ? null : Number(maxBookings);
        if (parsedMax !== null && (!Number.isInteger(parsedMax) || parsedMax < 1 || parsedMax > 1000)) {
            return fail(res, 400, 'Max bookings must be a whole number between 1 and 1000, or empty for unlimited.');
        }

        const docs = [];
        for (let t = from; t < to; t += step) {
            docs.push({
                startTime: fromMinutes(t),
                endTime: fromMinutes(Math.min(t + step, to)),
                maxBookings: parsedMax,
                isActive: true,
            });
        }
        if (docs.length > MAX_GENERATED) return fail(res, 400, `That would create ${docs.length} slots. The limit is ${MAX_GENERATED}; use a longer interval.`);

        let removed = 0;
        if (replaceExisting === true) {
            removed = (await BookingSlot.deleteMany({})).deletedCount || 0;
        }

        // Without "replace", slots whose start time already exists are left untouched.
        const existing = new Set((await BookingSlot.find({}).select('startTime').lean()).map((s) => s.startTime));
        const fresh = docs.filter((d) => !existing.has(d.startTime));
        if (fresh.length) await BookingSlot.insertMany(fresh, { ordered: false });

        const slots = await listSlots();
        return res.status(201).json({
            success: true,
            created: fresh.length,
            skipped: docs.length - fresh.length,
            removed,
            slots: slots.map(serializeSlot),
        });
    } catch (err) {
        console.error('[bookingSlots] generate failed:', err);
        return fail(res, 500, 'Could not generate time slots.');
    }
};
