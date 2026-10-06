// Utils/referral.js
//
// The ONE place that knows the referral money rules. Everything is in rupees, rounded to 2 decimals.
//
//   1. Signup with a code  → referrer.referralCount +1, referrer.pendingReferralAmount +BONUS   (earned, locked)
//   2. Referee's FIRST paid order (online or cash)
//                          → pending -BONUS, referralAmount +BONUS, totalReferralEarned +BONUS   (unlocked, once per referee)
//   3. Checkout wallet use → referralAmount -x, totalReferralRedeemed +x
//   4. Withdrawal request  → referralAmount -x (held)  → paid: totalWithdrawn +x | rejected: referralAmount +x
//   5. Admin edit          → see adminAdjustReferral()  (audited in referralAdjustments)
import User from "../Models/userModel.js";

export const REFERRAL_BONUS_AMOUNT = Number(process.env.REFERRAL_BONUS_AMOUNT) || 50;

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** Normalise what the user typed ("  prit1234ab ") so it matches the stored (upper-case) code. */
export const normalizeReferralCode = (code) => String(code ?? "").trim().toUpperCase() || null;

/**
 * A referee's first paid order unlocks the referrer's bonus. Safe to call any number of times and from
 * concurrent requests: the per-referee flag is flipped atomically, so the bonus is paid at most once.
 * Never throws (a referral hiccup must not fail a payment).
 */
export async function processReferralCredit(userId) {
    try {
        if (!userId) return { credited: false, reason: "no user" };

        // Atomically claim the reward for this referee. Only the first caller gets a document back.
        const referee = await User.findOneAndUpdate(
            { _id: userId, referredBy: { $nin: [null, ""] }, referralRewardGranted: { $ne: true } },
            { $set: { referralRewardGranted: true, referralRewardGrantedAt: new Date() } },
            { new: true }
        );
        if (!referee) return { credited: false, reason: "not referred or already rewarded" };

        const referrer = await User.findOne({ referralCode: referee.referredBy }, "_id");
        if (!referrer || String(referrer._id) === String(referee._id)) return { credited: false, reason: "no referrer" };

        const b = REFERRAL_BONUS_AMOUNT;
        await User.updateOne({ _id: referrer._id }, [{
            $set: {
                referralAmount: { $add: [{ $ifNull: ["$referralAmount", 0] }, b] },
                totalReferralEarned: { $add: [{ $ifNull: ["$totalReferralEarned", 0] }, b] },
                pendingReferralAmount: { $max: [0, { $subtract: [{ $ifNull: ["$pendingReferralAmount", 0] }, b] }] },
            },
        }]);
        return { credited: true, amount: b, referrerId: referrer._id };
    } catch (err) {
        console.error("[referral] credit failed:", err);
        return { credited: false, reason: err.message };
    }
}

/**
 * Spend wallet balance (checkout). Atomic: only succeeds if the balance still covers `amount`.
 * Returns the updated user, or null when the balance was too low.
 */
export async function debitReferralWallet(userId, amount) {
    const x = round2(amount);
    if (!(x > 0)) return null;
    return User.findOneAndUpdate(
        { _id: userId, referralAmount: { $gte: x } },
        { $inc: { referralAmount: -x, totalReferralRedeemed: x } },
        { new: true }
    );
}

/**
 * Admin override. `mode` "set" replaces the value, "adjust" adds `value` (negative to subtract).
 * Fields: referralAmount (available), pendingReferralAmount, referralCount. Nothing may go below 0.
 * Every change is written to user.referralAdjustments (who, what, before → after, note).
 */
export async function adminAdjustReferral(userId, { admin, mode = "set", changes = {}, note = "" }) {
    const FIELDS = ["referralAmount", "pendingReferralAmount", "referralCount"];
    const user = await User.findById(userId);
    if (!user) return { error: "User not found", status: 404 };

    const before = {}, after = {};
    for (const f of FIELDS) {
        if (changes[f] === undefined || changes[f] === null || changes[f] === "") continue;
        const v = Number(changes[f]);
        if (!Number.isFinite(v)) return { error: `${f} must be a number`, status: 400 };
        const cur = Number(user[f] || 0);
        const next = f === "referralCount" ? Math.round(mode === "adjust" ? cur + v : v) : round2(mode === "adjust" ? cur + v : v);
        if (next < 0) return { error: `${f} cannot go below 0 (would become ${next})`, status: 400 };
        if (next > 10000000) return { error: `${f} is too large`, status: 400 };
        before[f] = cur;
        after[f] = next;
    }
    if (!Object.keys(after).length) return { error: "Nothing to update", status: 400 };

    // Keep "Total earned" consistent: a manual increase of the available balance counts as earnings.
    if (after.referralAmount !== undefined) {
        const delta = round2(after.referralAmount - before.referralAmount);
        user.totalReferralEarned = Math.max(0, round2((user.totalReferralEarned || 0) + delta));
    }
    Object.assign(user, after);
    user.referralAdjustments.push({
        adminId: admin?._id,
        adminName: admin?.leadBy || admin?.email || "admin",
        mode, before, after,
        note: String(note || "").trim().slice(0, 300),
    });
    await user.save();
    return { user };
}
