import AdminSettings from '../Models/adminSettings.js';

// All shop hours are interpreted in IST (Asia/Kolkata, UTC+05:30), regardless of
// where the server runs.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DEFAULTS = {
    title: "We'll be back soon",
    message: 'Sorry for the inconvenience. We are currently closed and will be back shortly. Thank you for your patience and understanding.',
    emoji: '🛠️',
    openTime: '10:00',
    closeTime: '17:00',
};

export const isValidTime = (t) => typeof t === 'string' && TIME_RE.test(t);

const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

// "17:00" -> "5:00 PM"
export const formatTimeLabel = (t) => {
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

// Minutes since midnight, IST.
const istMinutesNow = (now) => {
    const d = new Date(now.getTime() + IST_OFFSET_MS);
    return d.getUTCHours() * 60 + d.getUTCMinutes();
};

export const loadSettings = async () => {
    let settings = await AdminSettings.findOne();
    if (!settings) settings = await AdminSettings.create({});
    return settings;
};

/**
 * Turn the stored settings into the state the apps act on.
 *  - isClosed:        effective closure (manual switch AND reopen time not yet reached)
 *  - manuallyClosed:  the raw switch (the console needs this to render the toggle)
 *  - emergencyAvailable: false when closed, or outside the configured service hours
 */
export const computeShopStatus = (settings, now = new Date()) => {
    const shop = settings?.shopStatus || {};
    const hours = settings?.serviceHours || {};

    const manuallyClosed = !!shop.isClosed;
    const reopenAt = shop.reopenAt ? new Date(shop.reopenAt) : null;
    const closureLifted = manuallyClosed && reopenAt && now >= reopenAt;
    const isClosed = manuallyClosed && !closureLifted;

    const hoursEnabled = !!hours.enabled;
    const openTime = isValidTime(hours.openTime) ? hours.openTime : DEFAULTS.openTime;
    const closeTime = isValidTime(hours.closeTime) ? hours.closeTime : DEFAULTS.closeTime;

    let withinServiceHours = true;
    if (hoursEnabled) {
        const mins = istMinutesNow(now);
        withinServiceHours = mins >= toMinutes(openTime) && mins < toMinutes(closeTime);
    }

    return {
        isClosed,
        manuallyClosed,
        title: shop.title || DEFAULTS.title,
        message: shop.message || DEFAULTS.message,
        emoji: shop.emoji || DEFAULTS.emoji,
        reopenAt: reopenAt ? reopenAt.toISOString() : null,
        contactNo: settings?.contactNo || '',
        serviceHours: {
            enabled: hoursEnabled,
            openTime,
            closeTime,
            openLabel: formatTimeLabel(openTime),
            closeLabel: formatTimeLabel(closeTime),
        },
        withinServiceHours,
        emergencyAvailable: !isClosed && withinServiceHours,
        serverTime: now.toISOString(),
    };
};

export const getShopStatus = async () => computeShopStatus(await loadSettings());
