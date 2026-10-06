// One-off: node scripts/migrateReferral.js   (safe to re-run)
// - marks every referee who already earned the referrer a bonus (an order with referralProcessed=true)
//   as rewarded, so the new "once per referee" rule does not pay them a second time
// - backfills totalReferralEarned for existing wallets
import "dotenv/config";
import mongoose from "mongoose";
import User from "../Models/userModel.js";
import Order from "../Models/orderModel.js";

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
const rewardedIds = await Order.distinct("userId", { referralProcessed: true });
const r1 = await User.updateMany(
    { _id: { $in: rewardedIds }, referredBy: { $nin: [null, ""] }, referralRewardGranted: { $ne: true } },
    { $set: { referralRewardGranted: true, referralRewardGrantedAt: new Date() } }
);
let n = 0;
for await (const u of User.find({ totalReferralEarned: { $in: [0, null] }, $or: [{ referralAmount: { $gt: 0 } }, { totalWithdrawn: { $gt: 0 } }] })) {
    const held = (u.withdrawalRequests || []).filter(w => ["pending", "approved"].includes(w.status)).reduce((a, w) => a + (w.amount || 0), 0);
    u.totalReferralEarned = (u.referralAmount || 0) + (u.totalWithdrawn || 0) + held + (u.totalReferralRedeemed || 0);
    await u.save(); n++;
}
console.log(`referees marked rewarded: ${r1.modifiedCount}, wallets backfilled: ${n}`);
await mongoose.disconnect();
