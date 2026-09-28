import { getShopStatus } from '../Utils/shopStatus.js';

/**
 * Guards customer bookings with the admin's shop status.
 *  - Shop closed            -> 503 SHOP_CLOSED (with the admin's message)
 *  - Emergency after hours  -> 400 EMERGENCY_UNAVAILABLE
 * Fails open if settings can't be read, so a settings glitch never blocks bookings.
 * Deliberately NOT applied to admin/employee routes (manual orders keep working).
 */
const shopGate = async (req, res, next) => {
    let status;
    try {
        status = await getShopStatus();
    } catch (err) {
        console.error('[shopGate] could not read shop status, allowing request:', err.message);
        return next();
    }

    if (status.isClosed) {
        return res.status(503).json({
            success: false,
            code: 'SHOP_CLOSED',
            title: status.title,
            message: status.message,
            reopenAt: status.reopenAt,
        });
    }

    if (req.body?.serviceType === 'Emergency Repair' && !status.emergencyAvailable) {
        const { openLabel, closeLabel } = status.serviceHours;
        return res.status(400).json({
            success: false,
            code: 'EMERGENCY_UNAVAILABLE',
            message: `Emergency repairs are only available between ${openLabel} and ${closeLabel}. Please book a Schedule Repair instead.`,
        });
    }

    next();
};

export default shopGate;
