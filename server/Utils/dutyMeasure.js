// Utils/dutyMeasure.js — pure distance maths for "on-duty" distance (no DB, no framework).
//
// RULE: while a mechanic / delivery partner is ONLINE and really moves, the road distance is added.
// Nothing else decides it — no trip, no order, no button to press.
//
// A GPS point is only counted when it passes ALL of these filters, so noise never becomes km:
//   • not flagged as a mock / fake-GPS fix
//   • accuracy better than MAX_ACCURACY_M
//   • moved more than the GPS error radius since the last accepted point (standing still = drift)
//   • implied speed below MAX_SPEED_MPS (teleport jumps are ignored)
//   • not longer than GAP_MS since the last point (a dark phone is a gap, not a straight line)
import { haversineM, isValidLatLng } from "./geo.js";

export const DUTY_RULES = {
    MAX_ACCURACY_M: 80,            // ignore fixes worse than this
    MAX_SPEED_MPS: 40,             // 144 km/h — nobody on a bike goes faster, so it is a GPS jump
    MIN_STEP_M: 15,                // floor for the "did he really move?" check
    GAP_MS: 15 * 60 * 1000,        // silent longer than this → re-anchor, don't draw a line across it
    MOVING_HOLD_MS: 3 * 60 * 1000, // "still moving" for this long after the last counted step (phone GPS mode)
};

/** Clean the points the phone sent: valid, sorted by time, wrong phone clocks replaced by server time. */
export function normalizePoints(raw, nowMs) {
    const out = [];
    for (const p of Array.isArray(raw) ? raw : []) {
        const lat = Number(p?.lat);
        const lng = Number(p?.lng);
        if (!isValidLatLng(lat, lng)) continue;
        let t = Number(p.t);
        if (!Number.isFinite(t) || t > nowMs + 60 * 1000 || t < nowMs - 36 * 3600 * 1000) t = nowMs;
        const acc = Number(p.acc);
        out.push({ lat, lng, t, acc: Number.isFinite(acc) && acc >= 0 ? acc : undefined, mocked: p.mocked === true });
    }
    return out.sort((a, b) => a.t - b.t).slice(-60);
}

/**
 * @param {{lat:number,lng:number,t:number,acc?:number}|null} anchor  last accepted point (null = none yet)
 * @param {Array} points  normalized points, oldest first
 * @returns {{add:number, accepted:number, gaps:number, jumps:number, mocked:number, last:object|null}}
 */
export function measureDuty(anchor, points, rules = DUTY_RULES) {
    let last = anchor;
    let add = 0, accepted = 0, gaps = 0, jumps = 0, mocked = 0;

    for (const p of points) {
        if (p.mocked) { mocked++; continue; }
        if (p.acc !== undefined && p.acc > rules.MAX_ACCURACY_M) continue;

        if (!last) { last = p; accepted++; continue; }          // first usable point: just anchor

        const dt = p.t - last.t;
        if (dt <= 0) continue;                                   // already counted / out of order

        if (dt > rules.GAP_MS) { gaps++; last = p; accepted++; continue; }

        const d = haversineM(last, p);
        const minStep = Math.max(rules.MIN_STEP_M, Math.min(p.acc || 0, 50) * 0.5);
        if (d < minStep) continue;                               // standing still / GPS drift
        if (d / (dt / 1000) > rules.MAX_SPEED_MPS) { jumps++; continue; }

        add += d; accepted++;
        last = p;
    }
    return { add, accepted, gaps, jumps, mocked, last };
}
