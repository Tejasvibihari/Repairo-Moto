import AppVersion from "../Models/appVersion.js";

// Public - hit by the app on launch.
// GET /api/app-version?app=mobile&platform=android
export const getAppVersion = async (req, res) => {
    try {
        const app = req.query.app || "mobile";
        const platform = req.query.platform || "android";

        const config = await AppVersion.findOne({ app, platform });
        if (!config) return res.status(404).json({ message: "No version config found" });

        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Admin only - list every configured app/platform combo, for the version
// management screen in Console (so the admin doesn't need Postman).
// GET /api/app-version/all
export const listAppVersions = async (req, res) => {
    try {
        const configs = await AppVersion.find().sort({ app: 1, platform: 1 });
        res.json(configs);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Admin only - upsert one (app, platform) config, e.g. right after publishing
// a new build to the store.
// POST /api/app-version  { app, platform, latestVersion, minRequiredVersion, storeUrl, updateMessage, forceUpdate }
export const upsertAppVersion = async (req, res) => {
    try {
        const { app, platform, latestVersion, minRequiredVersion, storeUrl, updateMessage, forceUpdate } = req.body;

        if (!app || !platform) {
            return res.status(400).json({ message: "app and platform are required" });
        }
        if (!["mobile", "console"].includes(app)) {
            return res.status(400).json({ message: "app must be 'mobile' or 'console'" });
        }
        if (!["android", "ios"].includes(platform)) {
            return res.status(400).json({ message: "platform must be 'android' or 'ios'" });
        }
        if (!latestVersion || !minRequiredVersion || !storeUrl) {
            return res.status(400).json({ message: "latestVersion, minRequiredVersion and storeUrl are required" });
        }

        const config = await AppVersion.findOneAndUpdate(
            { app, platform },
            { app, platform, latestVersion, minRequiredVersion, storeUrl, updateMessage, forceUpdate },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Admin only - remove a config (rarely needed, but useful for cleanup).
// DELETE /api/app-version/:id
export const deleteAppVersion = async (req, res) => {
    try {
        const deleted = await AppVersion.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Config not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
