// Utils/authIndexes.js
//
// One-time, automatic index maintenance for the mobile-number logins. Runs at startup and never throws.
//   1. phone_otps: the old unique index on `phone` alone would stop the same number from having a customer
//      AND an employee/vendor login at once. Replace it with the {phone, purpose} one from the model.
//   2. employees / vendors: make `phone` unique like `email`. If old data already contains the same number
//      twice, MongoDB cannot build the index — we list the duplicates so the admin can fix them, and the
//      app-level checks in the controllers keep blocking new duplicates in the meantime.
import PhoneOtp from "../Models/phoneOtpModel.js";
import Employee from "../Models/employeeModel.js";
import Vendor from "../Models/vendorModel.js";
import { localNumber } from "./phone.js";

async function fixPhoneOtpIndexes() {
    try {
        const indexes = await PhoneOtp.collection.indexes().catch(() => []);
        const legacy = indexes.find((i) => i.name === "phone_1");
        if (legacy) {
            await PhoneOtp.collection.dropIndex("phone_1");
            console.log("[otp] dropped legacy unique index phone_1 (replaced by {phone, purpose})");
        }
        await PhoneOtp.createIndexes();
    } catch (err) {
        console.error("[otp] could not update indexes:", err.message);
    }
}

async function makePhoneUnique(Model, label) {
    try {
        const docs = await Model.find({ phone: { $gt: "" } }).select("phone email").lean();
        const byNumber = new Map();
        for (const d of docs) {
            const key = localNumber(d.phone) || String(d.phone).replace(/\D/g, "");
            if (!key) continue;
            byNumber.set(key, [...(byNumber.get(key) || []), d.email || String(d._id)]);
        }
        for (const [number, who] of byNumber) {
            if (who.length > 1) {
                console.warn(`[${label}] DUPLICATE phone ${number} on ${who.length} accounts (${who.join(", ")}) — give each its own number`);
            }
        }
        await Model.createIndexes();
    } catch (err) {
        console.error(`[${label}] could not build the unique phone index (fix duplicate numbers, then restart):`, err.message);
    }
}

export async function ensureAuthIndexes() {
    await fixPhoneOtpIndexes();
    await makePhoneUnique(Employee, "employees");
    await makePhoneUnique(Vendor, "vendors");
}
