import Order from '../Models/orderModel.js';
import ManualInvoice from '../Models/manualInvoiceModel.js';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Vendor from '../Models/vendorModel.js';
import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers — everything is bucketed in IST (Asia/Kolkata, UTC+05:30) so that
// "Today" means the admin's today, not the server's (usually UTC) today.
// ─────────────────────────────────────────────────────────────────────────────
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const TZ = 'Asia/Kolkata';

// Midnight IST of the day containing `date`, returned as a real UTC Date.
const startOfDayIST = (date) => {
    const shifted = new Date(date.getTime() + IST_OFFSET_MS);
    shifted.setUTCHours(0, 0, 0, 0);
    return new Date(shifted.getTime() - IST_OFFSET_MS);
};

// 'YYYY-MM-DD' (an IST calendar day) → midnight IST as UTC Date, or null.
const parseISTDate = (str) => {
    if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const d = new Date(`${str}T00:00:00+05:30`);
    return Number.isNaN(d.getTime()) ? null : d;
};

const PERIODS = ['today', 'yesterday', 'week', 'last7', 'last30', 'month', 'year', 'custom'];

/**
 * Resolve a period key into a half-open range [start, end).
 * Also returns the immediately preceding range of equal length so the UI can
 * show "vs previous period" deltas.
 *
 *  today      – since midnight IST
 *  yesterday  – yesterday midnight → today midnight
 *  week       – calendar week to date (Monday 00:00 IST → now)
 *  last7      – last 7 days (incl. today)
 *  last30     – last 30 days (incl. today)
 *  month      – calendar month to date
 *  year       – calendar year to date
 *  custom     – ?from=YYYY-MM-DD&to=YYYY-MM-DD (both inclusive)
 */
const resolveRange = ({ period, from, to }) => {
    const now = new Date();
    const todayStart = startOfDayIST(now);
    const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
    let start;
    let end = tomorrowStart;

    switch (period) {
        case 'today':
            start = todayStart;
            break;
        case 'yesterday':
            start = new Date(todayStart.getTime() - DAY_MS);
            end = todayStart;
            break;
        case 'week': {
            // todayStart shifted by the IST offset reads as 00:00 UTC of the IST day,
            // so getUTCDay() is the IST weekday. Monday = 0.
            const dow = (new Date(todayStart.getTime() + IST_OFFSET_MS).getUTCDay() + 6) % 7;
            start = new Date(todayStart.getTime() - dow * DAY_MS);
            break;
        }
        case 'last7':
            start = new Date(todayStart.getTime() - 6 * DAY_MS);
            break;
        case 'last30':
            start = new Date(todayStart.getTime() - 29 * DAY_MS);
            break;
        case 'month': {
            const s = new Date(todayStart.getTime() + IST_OFFSET_MS);
            s.setUTCDate(1);
            start = new Date(s.getTime() - IST_OFFSET_MS);
            break;
        }
        case 'year': {
            const s = new Date(todayStart.getTime() + IST_OFFSET_MS);
            s.setUTCMonth(0, 1);
            start = new Date(s.getTime() - IST_OFFSET_MS);
            break;
        }
        case 'custom': {
            const f = parseISTDate(from);
            const t = parseISTDate(to);
            if (!f || !t) return { error: 'Custom range needs valid from and to dates (YYYY-MM-DD).' };
            if (t < f) return { error: '"To" date cannot be before "From" date.' };
            if ((t - f) / DAY_MS > 731) return { error: 'Custom range cannot exceed 2 years.' };
            start = f;
            end = new Date(t.getTime() + DAY_MS); // make `to` inclusive
            break;
        }
        default:
            return { error: 'Invalid period.' };
    }

    const length = end.getTime() - start.getTime();
    return {
        start,
        end,
        prevStart: new Date(start.getTime() - length),
        prevEnd: start,
    };
};

// ── Chart bucketing ──────────────────────────────────────────────────────────
// hour buckets for ≤ 1 day, day buckets up to ~3 months, month buckets beyond.
const getGranularity = (start, end) => {
    const days = (end - start) / DAY_MS;
    if (days <= 1) return 'hour';
    if (days <= 92) return 'day';
    return 'month';
};

const BUCKET_FORMAT = { hour: '%H', day: '%Y-%m-%d', month: '%Y-%m' };

const bucketKeyIST = (date, granularity) => {
    const s = new Date(date.getTime() + IST_OFFSET_MS).toISOString(); // IST wall-clock as ISO
    if (granularity === 'hour') return s.slice(11, 13);
    if (granularity === 'day') return s.slice(0, 10);
    return s.slice(0, 7);
};

// Mongo only returns buckets that have data; fill the gaps with zeros so the
// chart's x-axis is continuous.
const fillBuckets = (rows, start, end, granularity) => {
    const map = new Map(rows.map((r) => [r._id, r]));
    const out = [];
    const push = (key) => {
        const r = map.get(key);
        out.push({ key, revenue: r?.revenue || 0, orders: r?.orders || 0 });
    };

    if (granularity === 'hour') {
        for (let h = 0; h < 24; h++) push(String(h).padStart(2, '0'));
    } else if (granularity === 'day') {
        for (let t = start.getTime(); t < end.getTime(); t += DAY_MS) {
            push(bucketKeyIST(new Date(t), 'day'));
        }
    } else {
        const cur = new Date(start.getTime() + IST_OFFSET_MS);
        cur.setUTCDate(1);
        const last = new Date(end.getTime() - 1 + IST_OFFSET_MS);
        while (cur <= last) {
            push(cur.toISOString().slice(0, 7));
            cur.setUTCMonth(cur.getUTCMonth() + 1);
        }
    }
    return out;
};

const pctChange = (curr, prev) => {
    if (!prev) return curr ? null : 0; // null → "new" (no baseline to compare to)
    return Math.round(((curr - prev) / prev) * 1000) / 10;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Revenue actually collected on an order: full bill if paid, part-payment if partial.
const COLLECTED_EXPR = {
    $switch: {
        branches: [
            { case: { $eq: ['$paymentStatus', 'paid'] }, then: { $ifNull: ['$total.finalPayable', 0] } },
            { case: { $eq: ['$paymentStatus', 'partial'] }, then: { $ifNull: ['$amountPaid', 0] } },
        ],
        default: 0,
    },
};

// Orders that are booked but work has not started yet.
const UPCOMING_STATUSES = ['Pending', 'Mechanic Assigned'];
// Manual invoices that count as "issued" (drafts / cancelled are reported separately).
const ISSUED_INVOICE_STATUSES = ['paid', 'unpaid'];

// ── GET /api/admin/dashboard ─────────────────────────────────────────────────
// Query params:
//   period       today | yesterday | week | last7 | last30 | month | year | custom   (default: month)
//   from, to     YYYY-MM-DD (IST, inclusive) — required when period=custom
//   city         exact city (case-insensitive)
//   serviceType  'Schedule Repair' | 'Emergency Repair'
//   mechanicId   Employee _id — orders that mechanic is assigned to
export const getAdminDashboard = async (req, res) => {
    try {
        const period = PERIODS.includes(req.query.period) ? req.query.period : 'month';
        const range = resolveRange({ period, from: req.query.from, to: req.query.to });
        if (range.error) {
            return res.status(400).json({ success: false, message: range.error });
        }
        const { start, end, prevStart, prevEnd } = range;

        // ── Scope filters (apply to every order-based number) ─────────────
        const scope = {};
        const city = (req.query.city || '').trim();
        if (city) scope.city = new RegExp(`^${escapeRegex(city)}$`, 'i');

        const serviceType = (req.query.serviceType || '').trim();
        if (serviceType) {
            if (!['Schedule Repair', 'Emergency Repair'].includes(serviceType)) {
                return res.status(400).json({ success: false, message: 'Invalid serviceType.' });
            }
            scope.serviceType = serviceType;
        }

        const mechanicId = (req.query.mechanicId || '').trim();
        if (mechanicId) {
            if (!mongoose.Types.ObjectId.isValid(mechanicId)) {
                return res.status(400).json({ success: false, message: 'Invalid mechanicId.' });
            }
            scope.mechanicIds = new mongoose.Types.ObjectId(mechanicId);
        }

        const periodMatch = { ...scope, createdAt: { $gte: start, $lt: end } };
        const prevMatch = { ...scope, createdAt: { $gte: prevStart, $lt: prevEnd } };
        const billedMatch = { ...periodMatch, status: { $ne: 'Cancelled' }, 'total.finalPayable': { $gt: 0 } };

        const granularity = getGranularity(start, end);

        // Upcoming = scheduled from today onwards, work not started. Ignores the
        // period filter on purpose (it is a look-ahead) but honours city / service /
        // mechanic scope.
        const todayStart = startOfDayIST(new Date());
        const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
        const in7Days = new Date(todayStart.getTime() + 7 * DAY_MS);
        const upcomingMatch = {
            ...scope,
            status: { $in: UPCOMING_STATUSES },
            preferredDate: { $gte: todayStart },
        };

        // Manual invoices only carry a city (service type / mechanic don't apply).
        const invoiceScope = city ? { 'customerDetails.city': new RegExp(`^${escapeRegex(city)}$`, 'i') } : {};
        const invoiceMatch = { ...invoiceScope, invoiceDate: { $gte: start, $lt: end } };
        const prevInvoiceMatch = {
            ...invoiceScope,
            invoiceDate: { $gte: prevStart, $lt: prevEnd },
            status: { $in: ISSUED_INVOICE_STATUSES },
        };

        const mechanicFilter = { position: 'mechanic' };
        if (city) mechanicFilter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');

        const [
            periodOrders,
            prevOrders,
            statusAgg,
            revenueAgg,
            prevRevenueAgg,
            paymentAgg,
            recentOrders,
            chartAgg,
            topServices,
            totalUsers,
            newUsers,
            totalMechanics,
            totalVendors,
            allTimeOrders,
            invoiceAgg,
            prevInvoiceCount,
            upcomingTotal,
            upcomingToday,
            upcomingNext7,
            upcomingList,
        ] = await Promise.all([
            Order.countDocuments(periodMatch),
            Order.countDocuments(prevMatch),

            // one pass instead of six countDocuments — also picks up statuses the
            // old dashboard silently ignored (Mechanic Arrived, Work Completed, …)
            Order.aggregate([
                { $match: periodMatch },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),

            Order.aggregate([
                { $match: periodMatch },
                { $group: { _id: null, total: { $sum: COLLECTED_EXPR } } },
            ]),
            Order.aggregate([
                { $match: prevMatch },
                { $group: { _id: null, total: { $sum: COLLECTED_EXPR } } },
            ]),

            // Payment health: only orders that actually have a bill and aren't cancelled
            Order.aggregate([
                { $match: billedMatch },
                {
                    $group: {
                        _id: '$paymentStatus',
                        count: { $sum: 1 },
                        outstanding: {
                            $sum: {
                                $max: [0, { $subtract: ['$total.finalPayable', { $ifNull: ['$amountPaid', 0] }] }],
                            },
                        },
                    },
                },
            ]),

            Order.find(periodMatch)
                .sort({ updatedAt: -1 })
                .limit(10)
                .select('orderId name city status serviceType total paymentStatus createdAt updatedAt assignedMechanics')
                .lean(),

            Order.aggregate([
                { $match: periodMatch },
                {
                    $group: {
                        _id: { $dateToString: { format: BUCKET_FORMAT[granularity], date: '$createdAt', timezone: TZ } },
                        revenue: { $sum: COLLECTED_EXPR },
                        orders: { $sum: 1 },
                    },
                },
            ]),

            Order.aggregate([
                { $match: periodMatch },
                { $unwind: '$services' },
                { $group: { _id: '$services', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),

            // Users have no city, so these two are global by design
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: start, $lt: end } }),
            Employee.countDocuments(mechanicFilter),
            Vendor.countDocuments(),

            // All-time orders within the current scope filters
            Order.countDocuments(scope),

            // Manual invoices in range, grouped by status
            ManualInvoice.aggregate([
                { $match: invoiceMatch },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        amount: { $sum: { $ifNull: ['$total.finalPayable', 0] } },
                    },
                },
            ]),
            ManualInvoice.countDocuments(prevInvoiceMatch),

            Order.countDocuments(upcomingMatch),
            Order.countDocuments({ ...upcomingMatch, preferredDate: { $gte: todayStart, $lt: tomorrowStart } }),
            Order.countDocuments({ ...upcomingMatch, preferredDate: { $gte: todayStart, $lt: in7Days } }),
            Order.find(upcomingMatch)
                .sort({ preferredDate: 1, createdAt: 1 })
                .limit(8)
                .select('orderId name city status serviceType services preferredDate preferredTime assignedMechanics')
                .lean(),
        ]);

        // ── Shape results ─────────────────────────────────────────────────
        const statusCount = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));
        const orderStatus = {
            pending: statusCount['Pending'] || 0,
            mechanicAssigned: statusCount['Mechanic Assigned'] || 0,
            mechanicStart: statusCount['Mechanic Start'] || 0,
            mechanicArrived: statusCount['Mechanic Arrived'] || 0,
            inProgress: statusCount['In Progress'] || 0,
            completionRequested: statusCount['Completion Requested'] || 0,
            workCompleted: statusCount['Work Completed'] || 0,
            invoiceGenerated: statusCount['Invoice Generated'] || 0,
            completed: statusCount['Completed'] || 0,
            cancelled: statusCount['Cancelled'] || 0,
        };

        const pay = Object.fromEntries(paymentAgg.map((p) => [p._id, p]));
        const payments = {
            unpaid: pay.unpaid?.count || 0,
            partial: pay.partial?.count || 0,
            paid: pay.paid?.count || 0,
        };
        const outstandingAmount = (pay.unpaid?.outstanding || 0) + (pay.partial?.outstanding || 0);

        const inv = Object.fromEntries(invoiceAgg.map((r) => [r._id, r]));
        const invPaid = inv.paid?.count || 0;
        const invUnpaid = inv.unpaid?.count || 0;
        const invIssued = invPaid + invUnpaid;
        const manualInvoices = {
            total: invIssued,
            change: pctChange(invIssued, prevInvoiceCount),
            paid: invPaid,
            unpaid: invUnpaid,
            draft: inv.draft?.count || 0,
            cancelled: inv.cancelled?.count || 0,
            billedAmount: (inv.paid?.amount || 0) + (inv.unpaid?.amount || 0),
            paidAmount: inv.paid?.amount || 0,
            unpaidAmount: inv.unpaid?.amount || 0,
        };

        const periodRevenue = revenueAgg[0]?.total || 0;
        const prevRevenue = prevRevenueAgg[0]?.total || 0;

        res.json({
            success: true,
            period,
            range: { from: start, to: new Date(end.getTime() - 1) },
            filters: { city: city || null, serviceType: serviceType || null, mechanicId: mechanicId || null },
            data: {
                kpi: {
                    periodRevenue,
                    revenueChange: pctChange(periodRevenue, prevRevenue),
                    periodOrders,
                    ordersChange: pctChange(periodOrders, prevOrders),
                    totalOrders: allTimeOrders,
                    outstandingAmount,
                    avgOrderValue: payments.paid ? Math.round(periodRevenue / payments.paid) : 0,
                    totalUsers,
                    newUsers,
                    totalMechanics,
                    totalVendors,
                },
                orderStatus,
                payments,
                manualInvoices,
                upcoming: {
                    total: upcomingTotal,
                    today: upcomingToday,
                    next7Days: upcomingNext7,
                    orders: upcomingList,
                },
                revenueChart: {
                    granularity,
                    points: fillBuckets(chartAgg, start, end, granularity),
                },
                topServices,
                recentOrders,
            },
        });
    } catch (err) {
        console.error('[Dashboard]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/admin/dashboard/filters ─────────────────────────────────────────
// Options that populate the dashboard filter sheet.
export const getDashboardFilterOptions = async (req, res) => {
    try {
        const [cities, mechanics] = await Promise.all([
            Order.distinct('city'),
            Employee.find({ position: 'mechanic' })
                .select('firstName lastName city')
                .sort({ firstName: 1 })
                .lean(),
        ]);

        res.json({
            success: true,
            data: {
                cities: cities.filter(Boolean).sort(),
                serviceTypes: ['Schedule Repair', 'Emergency Repair'],
                mechanics: mechanics.map((m) => ({
                    _id: m._id,
                    name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unnamed',
                    city: m.city || '',
                })),
            },
        });
    } catch (err) {
        console.error('[Dashboard filters]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getOrderCounts = async (req, res) => {
    try {
        const employee = req.employee; // from auth middleware
        if (!employee) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { _id: employeeId, position: role, city } = employee;

        // Build match conditions based on role
        let matchConditions = {};

        if (role === 'mechanic') {
            matchConditions = {
                $or: [
                    { mechanicId: new mongoose.Types.ObjectId(employeeId) },
                    { assignedMechanic: employeeId.toString() }
                ]
            };
        }
        else if (role === 'delivery') {
            matchConditions = {
                $or: [
                    { deliveryId: new mongoose.Types.ObjectId(employeeId) },
                    { assignedDelivery: employeeId.toString() }
                ]
            };
        }
        else if (role === 'admin' || role === 'manager' || role === 'operational manager') {
            if (city) matchConditions.city = city;
        }
        // telecaller or other roles: matchConditions = {} (all orders)

        // Aggregate counts for each status
        const aggregation = await Order.aggregate([
            { $match: matchConditions },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert aggregation result to a map
        const countsMap = {};
        aggregation.forEach(item => {
            countsMap[item._id] = item.count;
        });

        // Compute totals
        const totalOrders = aggregation.reduce((sum, item) => sum + item.count, 0);
        const inProgressOrders = (countsMap['In Progress'] || 0) + (countsMap['Mechanic Assigned'] || 0) + (countsMap['Mechanic Start'] || 0);
        const completedOrders = (countsMap['Completed'] || 0) + (countsMap['Invoice Generated'] || 0);
        const cancelledOrders = countsMap['Cancelled'] || 0;

        return res.status(200).json({
            success: true,
            data: {
                totalOrders,
                inProgressOrders,
                completedOrders,
                cancelledOrders
            }
        });

    } catch (error) {
        console.error('Order counts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};