import fs from "fs/promises";
import path from "path";
import Banner from "../Models/bannerModel.js";

const MAX_TOTAL_BANNERS = 10; // total banners an admin can ever hold at once
const MAX_ACTIVE_BANNERS = 5; // max banners visible in the app at the same time

const removeImage = async (imagePath) => {
    if (!imagePath) return;
    const relativePath = imagePath.replace(/^\//, "");
    await fs.unlink(path.resolve(relativePath)).catch(() => { });
};

// "false" (string, from multipart form-data) -> false, anything else -> true
const parseBool = (value, fallback = true) => {
    if (value === undefined) return fallback;
    return value !== "false" && value !== false;
};

/**
 * POST /api/admin/banner
 * Create a new banner. Rejects if the admin already has 10 banners,
 * or if this banner is being created active and 5 are already active.
 */
export const createBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "A banner image is required." });
        }

        const totalCount = await Banner.countDocuments();
        if (totalCount >= MAX_TOTAL_BANNERS) {
            await removeImage(`/uploads/banners/${req.file.filename}`);
            return res.status(400).json({
                success: false,
                message: `You can only have a maximum of ${MAX_TOTAL_BANNERS} banners. Please delete an existing banner before creating a new one.`,
            });
        }

        const { title, link, order } = req.body;
        const isActive = parseBool(req.body.isActive, true);

        if (isActive) {
            const activeCount = await Banner.countDocuments({ isActive: true });
            if (activeCount >= MAX_ACTIVE_BANNERS) {
                await removeImage(`/uploads/banners/${req.file.filename}`);
                return res.status(400).json({
                    success: false,
                    message: `Only ${MAX_ACTIVE_BANNERS} banners can be visible at a time. Deactivate another banner first, or create this one as inactive.`,
                });
            }
        }

        let resolvedOrder = Number(order);
        if (Number.isNaN(resolvedOrder)) {
            // default: place the new banner at the end of the current order
            const lastBanner = await Banner.findOne().sort({ order: -1 });
            resolvedOrder = lastBanner ? lastBanner.order + 1 : 0;
        }

        const banner = await Banner.create({
            title: title?.trim() || "",
            link: link?.trim() || "",
            image: `/uploads/banners/${req.file.filename}`,
            order: resolvedOrder,
            isActive,
        });

        res.status(201).json({ success: true, message: "Banner created successfully.", banner });
    } catch (error) {
        if (req.file) await removeImage(`/uploads/banners/${req.file.filename}`);
        res.status(500).json({ success: false, message: "Failed to create banner.", error: error.message });
    }
};

/**
 * GET /api/admin/banner
 * Admin listing: every banner (active + inactive), ordered for the admin panel
 * so admins can see/manage the drag order and current active count.
 */
export const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
        const activeCount = banners.filter((b) => b.isActive).length;

        res.status(200).json({
            success: true,
            banners,
            meta: {
                total: banners.length,
                maxTotal: MAX_TOTAL_BANNERS,
                active: activeCount,
                maxActive: MAX_ACTIVE_BANNERS,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch banners.", error: error.message });
    }
};

/**
 * GET /api/banner/active
 * Public/app-facing: only active banners, in admin-defined order, capped at 5.
 */
export const getActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true })
            .sort({ order: 1, createdAt: 1 })
            .limit(MAX_ACTIVE_BANNERS);

        res.status(200).json({ success: true, banners });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch banners.", error: error.message });
    }
};

/**
 * PATCH /api/admin/banner/:id
 * Update title/link/order/isActive, optionally replacing the image.
 * Re-checks the active-banner limit if this update activates the banner.
 */
export const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            if (req.file) await removeImage(`/uploads/banners/${req.file.filename}`);
            return res.status(404).json({ success: false, message: "Banner not found." });
        }

        const { title, link, order } = req.body;
        const nextIsActive = req.body.isActive === undefined ? banner.isActive : parseBool(req.body.isActive, banner.isActive);

        if (nextIsActive && !banner.isActive) {
            const activeCount = await Banner.countDocuments({ isActive: true, _id: { $ne: banner._id } });
            if (activeCount >= MAX_ACTIVE_BANNERS) {
                if (req.file) await removeImage(`/uploads/banners/${req.file.filename}`);
                return res.status(400).json({
                    success: false,
                    message: `Only ${MAX_ACTIVE_BANNERS} banners can be visible at a time. Deactivate another banner first.`,
                });
            }
        }

        banner.title = title ?? banner.title;
        banner.link = link ?? banner.link;
        banner.isActive = nextIsActive;
        if (order !== undefined && !Number.isNaN(Number(order))) {
            banner.order = Number(order);
        }

        if (req.file) {
            const oldImage = banner.image;
            banner.image = `/uploads/banners/${req.file.filename}`;
            await banner.save();
            await removeImage(oldImage);
        } else {
            await banner.save();
        }

        res.status(200).json({ success: true, message: "Banner updated successfully.", banner });
    } catch (error) {
        if (req.file) await removeImage(`/uploads/banners/${req.file.filename}`);
        res.status(500).json({ success: false, message: "Failed to update banner.", error: error.message });
    }
};

/**
 * PATCH /api/admin/banner/reorder
 * Bulk-update display order, e.g. after a drag-and-drop reorder in the admin panel.
 * Body: { orders: [{ id, order }, ...] }
 */
export const reorderBanners = async (req, res) => {
    try {
        const { orders } = req.body;
        if (!Array.isArray(orders) || orders.length === 0) {
            return res.status(400).json({ success: false, message: "orders array is required." });
        }

        const operations = orders
            .filter((item) => item && item.id !== undefined && item.order !== undefined)
            .map((item) => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { order: Number(item.order) } },
                },
            }));

        if (operations.length === 0) {
            return res.status(400).json({ success: false, message: "No valid order entries provided." });
        }

        await Banner.bulkWrite(operations);

        const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json({ success: true, message: "Banner order updated.", banners });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to reorder banners.", error: error.message });
    }
};

/**
 * DELETE /api/admin/banner/:id
 */
export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found." });
        }
        await removeImage(banner.image);
        res.status(200).json({ success: true, message: "Banner deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete banner.", error: error.message });
    }
};