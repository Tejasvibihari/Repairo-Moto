// services/dutyDistanceService.js
//
// Adds up the distance a mechanic / delivery partner travels WHILE ONLINE.
// Called from POST /api/employee/auth/location for every ping (that endpoint only accepts pings
// from people who are online on the server, so "online" is already guaranteed).
//
// Safe to call with duplicates / old points / racing requests: `lastT` is an optimistic lock,
// so the loser of a race is dropped and the next ping measures from the winner's point —
// nothing is ever counted twice.
import DutyDistance from "../Models/dutyDistanceModel.js";
import { DUTY_RULES, measureDuty, normalizePoints } from "../Utils/dutyMeasure.js";
import { istDateKey } from "../Utils/attendanceUtils.js";

/**
 * @returns {Promise<{moving: boolean, distanceMeters: number}>}  distanceMeters = today's total
 */
export async function recordDutyPoints(employeeId, role, rawPoints, nowMs = Date.now()) {
    const date = istDateKey(new Date(nowMs));
    const doc = await DutyDistance.findOne({ employeeId, date })
        .select("last lastT lastAcc distanceMeters lastMoveAt")
        .lean();

    const current = doc?.distanceMeters || 0;
    const recentlyMoved = !!doc?.lastMoveAt && nowMs - doc.lastMoveAt < DUTY_RULES.MOVING_HOLD_MS;

    const anchor = doc?.last?.lat != null && doc.lastT != null
        ? { lat: doc.last.lat, lng: doc.last.lng, t: doc.lastT, acc: doc.lastAcc }
        : null;

    const r = measureDuty(anchor, normalizePoints(rawPoints, nowMs));
    if (!r.accepted && !r.gaps && !r.jumps && !r.mocked) {
        return { moving: recentlyMoved, distanceMeters: current };
    }

    const $set = {};
    if (r.last) {
        $set.last = { lat: r.last.lat, lng: r.last.lng };
        $set.lastT = r.last.t;
        if (r.last.acc !== undefined) $set.lastAcc = r.last.acc;
    }
    if (r.add > 0) $set.lastMoveAt = nowMs;

    const $inc = {};
    if (r.add > 0) $inc.distanceMeters = r.add;
    if (r.accepted) $inc.pointCount = r.accepted;
    if (r.gaps) $inc.gapCount = r.gaps;
    if (r.jumps) $inc.jumpCount = r.jumps;
    if (r.mocked) $inc.mockedCount = r.mocked;

    const update = { $set, $setOnInsert: { role } };
    if (Object.keys($inc).length) update.$inc = $inc;

    let applied = false;
    try {
        const res = await DutyDistance.updateOne(
            { employeeId, date, lastT: doc?.lastT ?? null },
            update,
            { upsert: true }
        );
        applied = !!(res.modifiedCount || res.upsertedCount);
    } catch (err) {
        if (err?.code !== 11000) throw err;     // 11000 = a parallel ping created today's row first → just skip
    }

    return {
        moving: recentlyMoved || (applied && r.add > 0),
        distanceMeters: applied ? current + r.add : current,
    };
}

/**
 * Forget the "last point" — used when the person goes online / offline, so the stretch between
 * a break and the next resume (or a different place after a sign-out) is never joined by a line.
 */
export async function resetDutyAnchor(employeeId) {
    await DutyDistance.updateOne(
        { employeeId, date: istDateKey() },
        { $set: { lastT: null, lastMoveAt: null }, $unset: { last: "" } }
    );
}
