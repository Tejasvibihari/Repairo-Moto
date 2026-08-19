import fs from "fs/promises";
import path from "path";
import AppContent from "../Models/appContentModel.js";

const removeImage = async (imagePath) => {
    if (!imagePath) return;
    const relativePath = imagePath.replace(/^\//, "");
    await fs.unlink(path.resolve(relativePath)).catch(() => { });
};

const getDateOrNull = (value) => (value ? new Date(value) : null);

export const createAppContent = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "An image is required." });
        }

        const { title, message, link, isActive, startsAt, endsAt } = req.body;

        const content = await AppContent.create({
            title: title?.trim() || "",
            message,
            link,
            isActive: isActive !== "false",
            startsAt: getDateOrNull(startsAt),
            endsAt: getDateOrNull(endsAt),
            image: `/uploads/app-content/${req.file.filename}`,
        });

        res.status(201).json({ success: true, message: "App content created successfully.", content });
    } catch (error) {
        if (req.file) await removeImage(`/uploads/app-content/${req.file.filename}`);
        res.status(500).json({ success: false, message: "Failed to create app content.", error: error.message });
    }
};

export const getActiveAppContent = async (req, res) => {
    try {
        const now = new Date();
        const content = await AppContent.find({
            isActive: true,
            $and: [
                { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
                { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
            ],
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch app content.", error: error.message });
    }
};

export const getAllAppContent = async (req, res) => {
    try {
        const content = await AppContent.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch app content.", error: error.message });
    }
};

export const updateAppContent = async (req, res) => {
    try {
        const content = await AppContent.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: "App content not found." });

        const { title, message, link, isActive, startsAt, endsAt } = req.body;
        Object.assign(content, {
            title: title ?? content.title,
            message: message ?? content.message,
            link: link ?? content.link,
            isActive: isActive === undefined ? content.isActive : isActive !== "false",
            startsAt: startsAt === undefined ? content.startsAt : getDateOrNull(startsAt),
            endsAt: endsAt === undefined ? content.endsAt : getDateOrNull(endsAt),
        });

        if (req.file) {
            const oldImage = content.image;
            content.image = `/uploads/app-content/${req.file.filename}`;
            await content.save();
            await removeImage(oldImage);
        } else {
            await content.save();
        }

        res.status(200).json({ success: true, message: "App content updated successfully.", content });
    } catch (error) {
        if (req.file) await removeImage(`/uploads/app-content/${req.file.filename}`);
        res.status(500).json({ success: false, message: "Failed to update app content.", error: error.message });
    }
};

export const deleteAppContent = async (req, res) => {
    try {
        const content = await AppContent.findByIdAndDelete(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: "App content not found." });
        await removeImage(content.image);
        res.status(200).json({ success: true, message: "App content deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete app content.", error: error.message });
    }
};
