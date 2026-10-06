// Utils/geo.js — tiny geo helpers (no dependencies).

const R = 6371008.8;                       // mean Earth radius, metres
const rad = (d) => (d * Math.PI) / 180;

/** Great-circle distance in METRES between two {lat, lng} points. */
export function haversineM(a, b) {
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export const isValidLatLng = (lat, lng) =>
    Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0);

/** metres → kilometres rounded to 2 decimals (what the UI / payroll shows). */
export const toKm = (m) => Math.round(((Number(m) || 0) / 1000) * 100) / 100;
