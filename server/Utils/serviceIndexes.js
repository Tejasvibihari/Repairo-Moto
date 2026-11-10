// Utils/serviceIndexes.js
//
// Services used to have globally unique names (index `name_1`). They are now defined per
// brand + model, so "General service" must be allowed once for every model. Drop the old
// index (once, automatically at startup) and build the new brand + model + name one.
import Service from "../Models/serviceModel.js";

export async function ensureServiceIndexes() {
    try {
        const indexes = await Service.collection.indexes().catch(() => []);
        const legacy = indexes.find((i) => i.name === "name_1");
        if (legacy) {
            await Service.collection.dropIndex("name_1");
            console.log("[services] dropped legacy unique index name_1 (names are now unique per brand + model)");
        }
        await Service.createIndexes();
    } catch (err) {
        console.error("[services] could not update indexes:", err.message);
    }
}
