// Utils/userIndexes.js
//
// Phone-only customers have NO email. The old unique index on `email` treats a missing email as null,
// so the 2nd phone-only customer would fail with E11000. Replace it (once, automatically at startup)
// with a *partial* unique index that only covers documents that really have an email.
import User from "../Models/userModel.js";

export async function ensureUserIndexes() {
    try {
        const indexes = await User.collection.indexes().catch(() => []);
        const legacy = indexes.find((i) => i.name === "email_1" && !i.partialFilterExpression);
        if (legacy) {
            await User.collection.dropIndex("email_1");
            console.log("[users] dropped legacy unique index email_1 (replaced by a partial one)");
        }
        await User.createIndexes();
    } catch (err) {
        console.error("[users] could not update indexes:", err.message);
    }
}
