import mongoose from "mongoose";

// One document per (app, platform) pair — e.g. mobile-android, mobile-ios,
// console-android, console-ios. This lets the Repairo Moto user app and the
// Repairo Moto Console app be versioned and force-updated independently,
// since they ship as separate Play Store / App Store listings with their
// own version numbers.
const appVersionSchema = new mongoose.Schema(
    {
        app: {
            type: String,
            enum: ["mobile", "console"], // "mobile" = customer app, "console" = admin/employee app
            required: true,
            default: "mobile",
        },
        platform: { type: String, enum: ["android", "ios"], required: true },

        // The version currently LIVE on the Play Store / App Store for this app.
        // Set this every time you publish a new build so the client's
        // "exact version match" check has something correct to compare against.
        latestVersion: { type: String, required: true },      // e.g. "1.4.0"

        // Anything strictly below this version is force-updated (no "Later" option),
        // regardless of the exact-match check below.
        minRequiredVersion: { type: String, required: true }, // e.g. "1.2.0"

        storeUrl: { type: String, required: true },
        updateMessage: { type: String, default: "A new version is available." },
        forceUpdate: { type: Boolean, default: false }, // manual override, e.g. for emergency rollout
    },
    { timestamps: true }
);

appVersionSchema.index({ app: 1, platform: 1 }, { unique: true });

export default mongoose.model("AppVersion", appVersionSchema);
