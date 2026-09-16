import AdminSettings from "../Models/adminSettings.js";

// There is only ever one settings document (a singleton). This helper fetches
// it, creating it with schema defaults on first use so callers never have to
// handle a missing-document case.
const getOrCreateSettings = async () => {
    let settings = await AdminSettings.findOne();
    if (!settings) {
        settings = await AdminSettings.create({});
    }
    return settings;
};

// Public - read-only, used by both the Console app (to prefill the settings
// form) and any invoice screen that needs company / payment details.
// GET /api/admin-settings
export const getAdminSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Admin only - update the singleton settings document.
// PUT /api/admin-settings
export const updateAdminSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();

        const allowedFields = [
            "companyName", "address", "city", "pin", "contactNo", "email", "gstNo",
            "upiId", "upiPayeeName",
            "bankAccountName", "bankAccountNumber", "bankIFSC", "bankName", "bankBranch",
        ];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        }

        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};