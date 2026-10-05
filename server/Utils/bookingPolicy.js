import StoreBookingDay from '../Models/storeBookingDayModel.js';
import Order from '../Models/orderModel.js';
import { loadSettings } from './shopStatus.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CLOSED_ORDER_STATUSES = { $nin: ['Cancelled'] };

export const normalizeBookingDate = (value) => {
    const ymd = String(value || '').slice(0, 10);
    if (!DATE_RE.test(ymd)) return null;
    const date = new Date(`${ymd}T00:00:00.000Z`);
    return date.toISOString().slice(0, 10) === ymd ? ymd : null;
};

const activeOrderCount = (ymd) => {
    const start = new Date(`${ymd}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return Order.countDocuments({
        preferredDate: { $gte: start, $lt: end },
        status: CLOSED_ORDER_STATUSES,
    });
};

const getClosure = (settings, ymd) => (settings.storeClosures || []).find(item => item.date === ymd) || null;

export const getBookingAvailability = async (ymd, settings = null) => {
    const date = normalizeBookingDate(ymd);
    if (!date) return { date: ymd, available: false, code: 'INVALID_DATE', message: 'Date must use YYYY-MM-DD format.' };

    const currentSettings = settings || await loadSettings();
    const closure = getClosure(currentSettings, date);
    const limit = currentSettings.bookingPolicy?.dailyOrderLimit ?? null;
    const day = await StoreBookingDay.findOne({ date }).lean();
    const count = day?.count ?? await activeOrderCount(date);
    const limitReached = Number.isInteger(limit) && limit > 0 && count >= limit;

    if (closure) {
        return {
            date, available: false, code: 'STORE_CLOSED',
            title: closure.title, message: closure.message,
            count, limit,
        };
    }
    if (limitReached) {
        return {
            date, available: false, code: 'DAILY_LIMIT_REACHED',
            title: 'Bookings full', message: currentSettings.bookingPolicy?.limitMessage,
            count, limit,
        };
    }
    return { date, available: true, code: null, message: null, count, limit };
};

export const assertBookingDateAvailable = async (ymd) => {
    const result = await getBookingAvailability(ymd);
    if (!result.available) {
        const error = new Error(result.message || 'Bookings are not available for this date.');
        error.status = result.code === 'INVALID_DATE' ? 400 : 409;
        error.code = result.code;
        error.details = result;
        throw error;
    }
    return result;
};

export const reserveBookingDate = async (ymd) => {
    const date = normalizeBookingDate(ymd);
    if (!date) throw Object.assign(new Error('Date must use YYYY-MM-DD format.'), { status: 400, code: 'INVALID_DATE' });

    const settings = await loadSettings();
    const closure = getClosure(settings, date);
    if (closure) {
        throw Object.assign(new Error(closure.message), {
            status: 409, code: 'STORE_CLOSED', details: { date, title: closure.title, message: closure.message },
        });
    }

    const limit = settings.bookingPolicy?.dailyOrderLimit ?? null;
    if (!Number.isInteger(limit) || limit <= 0) return { date, reserved: false, unlimited: true };

    let day = await StoreBookingDay.findOne({ date });
    if (!day) {
        const count = await activeOrderCount(date);
        try {
            day = await StoreBookingDay.create({ date, count: count + 1 });
            if (count >= limit) {
                await StoreBookingDay.updateOne({ _id: day._id }, { $inc: { count: -1 } });
                throw Object.assign(new Error(settings.bookingPolicy?.limitMessage), {
                    status: 409, code: 'DAILY_LIMIT_REACHED', details: { date, count, limit },
                });
            }
            return { date, reserved: true };
        } catch (error) {
            if (error.code === 11000) return reserveBookingDate(date);
            throw error;
        }
    }

    const updated = await StoreBookingDay.findOneAndUpdate(
        { date, count: { $lt: limit } },
        { $inc: { count: 1 } },
        { new: true },
    );
    if (!updated) {
        throw Object.assign(new Error(settings.bookingPolicy?.limitMessage), {
            status: 409, code: 'DAILY_LIMIT_REACHED', details: { date, count: day.count, limit },
        });
    }
    return { date, reserved: true };
};

export const releaseBookingDate = async (ymd) => {
    const date = normalizeBookingDate(ymd);
    if (!date) return;
    await StoreBookingDay.findOneAndUpdate(
        { date, count: { $gt: 0 } },
        { $inc: { count: -1 } },
    );
};

export const bookingDateRange = (ymd) => {
    const date = normalizeBookingDate(ymd);
    if (!date) return null;
    const start = new Date(`${date}T00:00:00.000Z`);
    return { $gte: start, $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};
