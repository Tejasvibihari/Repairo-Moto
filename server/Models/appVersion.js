import mongoose from "mongoose";

const appVersionSchema = new mongoose.Schema(
    {
        platform: { type: String, enum: ["android", "ios"], required: true, unique: true },
        latestVersion: { type: String, required: true },      // e.g. "1.4.0"
        minRequiredVersion: { type: String, required: true }, // e.g. "1.2.0"
        storeUrl: { type: String, required: true },
        updateMessage: { type: String, default: "A new version is available." },
        forceUpdate: { type: Boolean, default: false },        // manual override
    },
    { timestamps: true }
);

export default mongoose.model("AppVersion", appVersionSchema);