import AdminSettings from "../Models/adminSettings.js";
import { computeShopStatus, isValidTime, loadSettings } from "../Utils/shopStatus.js";

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

// ── Shop status ──────────────────────────────────────────────────────────────

// Public - polled by the customer app on launch / resume, and read by the Console.
// GET /api/admin-settings/shop-status
export const getShopStatus = async (req, res) => {
    try {
        const settings = await loadSettings();
        res.set('Cache-Control', 'no-store');
        res.json({ success: true, status: computeShopStatus(settings) });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// Admin only - update the closure switch, its message and the service hours.
// PUT /api/admin-settings/shop-status
export const updateShopStatus = async (req, res) => {
    try {
        const { isClosed, title, message, emoji, reopenAt, serviceHours } = req.body || {};
        const settings = await loadSettings();
        const fail = (msg) => res.status(400).json({ success: false, message: msg });

        // ---- closure ----
        if (isClosed !== undefined) {
            if (typeof isClosed !== "boolean") return fail("isClosed must be true or false.");
            settings.shopStatus.isClosed = isClosed;
        }
        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim() || title.trim().length > 80) {
                return fail("Title is required (max 80 characters).");
            }
            settings.shopStatus.title = title.trim();
        }
        if (message !== undefined) {
            if (typeof message !== "string" || !message.trim() || message.trim().length > 500) {
                return fail("Message is required (max 500 characters).");
            }
            settings.shopStatus.message = message.trim();
        }
        if (emoji !== undefined) {
            if (typeof emoji !== "string" || emoji.trim().length > 8) return fail("Emoji is too long.");
            settings.shopStatus.emoji = emoji.trim();
        }
        if (reopenAt !== undefined) {
            if (reopenAt === null || reopenAt === "") {
                settings.shopStatus.reopenAt = null;
            } else {
                const d = new Date(reopenAt);
                if (Number.isNaN(d.getTime())) return fail("Reopen date is not valid.");
                settings.shopStatus.reopenAt = d;
            }
        }
        // Closing with a reopen time that has already passed would be a no-op - reject it.
        if (settings.shopStatus.isClosed && settings.shopStatus.reopenAt && settings.shopStatus.reopenAt <= new Date()) {
            return fail("Reopen time must be in the future.");
        }
        // A stale reopen time must not linger once the shop is switched back to open.
        if (!settings.shopStatus.isClosed) settings.shopStatus.reopenAt = null;

        // ---- service hours ----
        if (serviceHours !== undefined) {
            const { enabled, openTime, closeTime } = serviceHours || {};
            if (enabled !== undefined) {
                if (typeof enabled !== "boolean") return fail("serviceHours.enabled must be true or false.");
                settings.serviceHours.enabled = enabled;
            }
            if (openTime !== undefined) {
                if (!isValidTime(openTime)) return fail("Opening time must be in HH:mm format.");
                settings.serviceHours.openTime = openTime;
            }
            if (closeTime !== undefined) {
                if (!isValidTime(closeTime)) return fail("Closing time must be in HH:mm format.");
                settings.serviceHours.closeTime = closeTime;
            }
            if (settings.serviceHours.openTime >= settings.serviceHours.closeTime) {
                return fail("Closing time must be after opening time.");
            }
        }

        settings.shopStatus.updatedAt = new Date();
        await settings.save();
        res.json({ success: true, status: computeShopStatus(settings) });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
