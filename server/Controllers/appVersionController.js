import AppVersion from "../Models/appVersion.js";

// Public - hit by the app on launch
export const getAppVersion = async (req, res) => {
    try {
        const platform = req.query.platform || "android";
        const config = await AppVersion.findOne({ platform });
        if (!config) return res.status(404).json({ message: "No version config found" });
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Admin only - update from dashboard when you publish a new build
export const upsertAppVersion = async (req, res) => {
    try {
        const { platform, latestVersion, minRequiredVersion, storeUrl, updateMessage, forceUpdate } = req.body;
        const config = await AppVersion.findOneAndUpdate(
            { platform },
            { latestVersion, minRequiredVersion, storeUrl, updateMessage, forceUpdate },
            { new: true, upsert: true }
        );
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};