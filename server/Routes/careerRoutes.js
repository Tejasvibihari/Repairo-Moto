import express from "express";
import authAdmin from "../Middleware/authAdmin.js";
import requireAdminRole from "../Middleware/requireAdminRole.js";
import { resumeUpload } from "../Middleware/resumeMulter.js";
import {
    getPublicJobs,
    getPublicJob,
    applyToJob,
    createJob,
    getAdminJobs,
    updateJob,
    deleteJob,
    getApplications,
    updateApplication,
    deleteApplication,
    downloadResume,
} from "../Controllers/careerController.js";

// Tiny in-memory limiter for the public apply endpoint (5 submissions / hour / IP).
const hits = new Map();
const applyLimiter = (req, res, next) => {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const key = req.ip;
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= 5) {
        return res.status(429).json({ success: false, message: "Too many applications. Please try again later." });
    }
    recent.push(now);
    hits.set(key, recent);
    next();
};
setInterval(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [k, v] of hits) {
        if (!v.some((t) => t > cutoff)) hits.delete(k);
    }
}, 10 * 60 * 1000).unref();

// ── Public: /api/careers ─────────────────────────────────────
export const publicCareerRouter = express.Router();
publicCareerRouter.get("/", getPublicJobs);
publicCareerRouter.get("/:id", getPublicJob);
publicCareerRouter.post("/:id/apply", applyLimiter, resumeUpload, applyToJob);

// ── Admin only: /api/admin/careers ───────────────────────────
export const adminCareerRouter = express.Router();
adminCareerRouter.use(authAdmin, requireAdminRole);

adminCareerRouter.get("/jobs", getAdminJobs);
adminCareerRouter.post("/jobs", createJob);
adminCareerRouter.put("/jobs/:id", updateJob);
adminCareerRouter.delete("/jobs/:id", deleteJob);

adminCareerRouter.get("/applications", getApplications);
adminCareerRouter.get("/applications/:id/resume", downloadResume);
adminCareerRouter.patch("/applications/:id", updateApplication);
adminCareerRouter.delete("/applications/:id", deleteApplication);
