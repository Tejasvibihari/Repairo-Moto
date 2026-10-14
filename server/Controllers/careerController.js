import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Job, { JOB_TYPES, JOB_STATUSES } from "../Models/jobModel.js";
import JobApplication, { APPLICATION_STATUSES } from "../Models/jobApplicationModel.js";
import { RESUME_DIR } from "../Middleware/resumeMulter.js";
import { escapeRegex } from "../Utils/leadHelpers.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;

const removeResumeFile = (filename) => {
    if (!filename) return;
    // basename guards against any path tricks in a stored value
    fs.unlink(path.join(RESUME_DIR, path.basename(filename)), () => { });
};

// A job is "live" for the public when it is open and its last date has not passed.
const livenessFilter = () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return {
        status: "open",
        $or: [{ lastDate: null }, { lastDate: { $gte: startOfToday } }],
    };
};

const cleanJobBody = (body) => {
    const out = {};
    const str = ["title", "department", "location", "experience", "salary", "description", "requirements"];
    for (const k of str) {
        if (body[k] !== undefined) out[k] = String(body[k]).trim();
    }
    if (body.jobType !== undefined) out.jobType = body.jobType;
    if (body.status !== undefined) out.status = body.status;
    if (body.openings !== undefined) out.openings = Number(body.openings);
    if (body.lastDate !== undefined) out.lastDate = body.lastDate ? new Date(body.lastDate) : null;
    return out;
};

const validateJob = (data, { partial = false } = {}) => {
    if (!partial || data.title !== undefined) {
        if (!data.title) return "Job title is required.";
    }
    if (!partial || data.description !== undefined) {
        if (!data.description) return "Job description is required.";
    }
    if (data.jobType !== undefined && !JOB_TYPES.includes(data.jobType)) return "Invalid job type.";
    if (data.status !== undefined && !JOB_STATUSES.includes(data.status)) return "Invalid status.";
    if (data.openings !== undefined && (!Number.isInteger(data.openings) || data.openings < 1)) {
        return "Openings must be a whole number of at least 1.";
    }
    if (data.lastDate instanceof Date && Number.isNaN(data.lastDate.getTime())) return "Invalid last date.";
    return null;
};

// ─────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────
export const getPublicJobs = async (req, res) => {
    try {
        const jobs = await Job.find(livenessFilter())
            .select("-createdBy")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, jobs });
    } catch (error) {
        console.error("getPublicJobs:", error);
        res.status(500).json({ success: false, message: "Failed to load job openings." });
    }
};

export const getPublicJob = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: "Job not found." });
        }
        const job = await Job.findOne({ _id: req.params.id, ...livenessFilter() })
            .select("-createdBy")
            .lean();
        if (!job) return res.status(404).json({ success: false, message: "This job is no longer open." });
        res.json({ success: true, job });
    } catch (error) {
        console.error("getPublicJob:", error);
        res.status(500).json({ success: false, message: "Failed to load job." });
    }
};

export const applyToJob = async (req, res) => {
    const file = req.file;
    const fail = (status, message) => {
        if (file) removeResumeFile(file.filename);
        return res.status(status).json({ success: false, message });
    };

    try {
        // Honeypot: real users never fill this hidden field.
        if (req.body.website) {
            if (file) removeResumeFile(file.filename);
            return res.status(201).json({ success: true, message: "Application submitted." });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return fail(404, "Job not found.");

        const job = await Job.findOne({ _id: id, ...livenessFilter() }).lean();
        if (!job) return fail(404, "This job is no longer accepting applications.");

        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        // Normalise so "99999 99999" and "9999999999" count as the same number.
        const phone = String(req.body.phone || "").replace(/[\s-]/g, "");

        if (!name) return fail(400, "Name is required.");
        if (email && !EMAIL_RE.test(email)) return fail(400, "Please enter a valid email address or leave it blank.");
        if (!PHONE_RE.test(phone)) return fail(400, "A valid phone number is required.");
        if (!file) return fail(400, "Please attach your resume (PDF, DOC or DOCX).");

        // Email is optional, so the phone number is the main duplicate check; email is also checked when given.
        const duplicate = await JobApplication.exists({
            job: job._id,
            $or: [{ phone }, ...(email ? [{ email }] : [])],
        });
        if (duplicate) return fail(409, "You have already applied for this position with this phone number or email.");

        await JobApplication.create({
            job: job._id,
            jobTitle: job.title,
            name,
            email,
            phone,
            city: String(req.body.city || "").trim(),
            experience: String(req.body.experience || "").trim(),
            currentCompany: String(req.body.currentCompany || "").trim(),
            coverLetter: String(req.body.coverLetter || "").trim().slice(0, 3000),
            resume: {
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            },
        });

        res.status(201).json({ success: true, message: "Application submitted. We will get in touch if you are shortlisted." });
    } catch (error) {
        if (error?.code === 11000) return fail(409, "You have already applied for this position with this phone number or email.");
        console.error("applyToJob:", error);
        return fail(500, "Failed to submit application. Please try again.");
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — JOBS
// ─────────────────────────────────────────────────────────────
export const createJob = async (req, res) => {
    try {
        const data = cleanJobBody(req.body);
        const error = validateJob(data);
        if (error) return res.status(400).json({ success: false, message: error });

        const job = await Job.create({ ...data, createdBy: req.user?.leadBy || "" });
        res.status(201).json({ success: true, message: "Job posted successfully.", job });
    } catch (error) {
        console.error("createJob:", error);
        res.status(500).json({ success: false, message: "Failed to create job." });
    }
};

export const getAdminJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).lean();

        const counts = await JobApplication.aggregate([
            {
                $group: {
                    _id: "$job",
                    total: { $sum: 1 },
                    new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
                },
            },
        ]);
        const countMap = new Map(counts.map((c) => [String(c._id), c]));

        const withCounts = jobs.map((j) => {
            const c = countMap.get(String(j._id));
            return { ...j, applicationCount: c?.total || 0, newApplicationCount: c?.new || 0 };
        });

        res.json({ success: true, jobs: withCounts });
    } catch (error) {
        console.error("getAdminJobs:", error);
        res.status(500).json({ success: false, message: "Failed to load jobs." });
    }
};

export const updateJob = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: "Job not found." });
        }
        const data = cleanJobBody(req.body);
        const error = validateJob(data, { partial: true });
        if (error) return res.status(400).json({ success: false, message: error });

        const job = await Job.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!job) return res.status(404).json({ success: false, message: "Job not found." });

        // Keep the snapshot on existing applications in sync with a renamed job.
        if (data.title) await JobApplication.updateMany({ job: job._id }, { jobTitle: job.title });

        res.json({ success: true, message: "Job updated.", job });
    } catch (error) {
        console.error("updateJob:", error);
        res.status(500).json({ success: false, message: "Failed to update job." });
    }
};

export const deleteJob = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: "Job not found." });
        }
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found." });

        const apps = await JobApplication.find({ job: job._id }).select("resume.filename").lean();
        apps.forEach((a) => removeResumeFile(a.resume?.filename));
        await JobApplication.deleteMany({ job: job._id });

        res.json({ success: true, message: "Job and its applications were deleted." });
    } catch (error) {
        console.error("deleteJob:", error);
        res.status(500).json({ success: false, message: "Failed to delete job." });
    }
};

// ─────────────────────────────────────────────────────────────
// ADMIN — APPLICATIONS
// ─────────────────────────────────────────────────────────────
export const getApplications = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

        const filter = {};
        if (req.query.job && mongoose.isValidObjectId(req.query.job)) filter.job = req.query.job;
        if (req.query.status && APPLICATION_STATUSES.includes(req.query.status)) filter.status = req.query.status;
        if (req.query.q) {
            const rx = new RegExp(escapeRegex(String(req.query.q).trim()), "i");
            filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { jobTitle: rx }];
        }

        const [applications, total, statusCounts] = await Promise.all([
            JobApplication.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            JobApplication.countDocuments(filter),
            JobApplication.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        ]);

        res.json({
            success: true,
            applications,
            total,
            page,
            pages: Math.max(Math.ceil(total / limit), 1),
            statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
        });
    } catch (error) {
        console.error("getApplications:", error);
        res.status(500).json({ success: false, message: "Failed to load applications." });
    }
};

export const updateApplication = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        const update = {};
        if (req.body.status !== undefined) {
            if (!APPLICATION_STATUSES.includes(req.body.status)) {
                return res.status(400).json({ success: false, message: "Invalid status." });
            }
            update.status = req.body.status;
        }
        if (req.body.adminNotes !== undefined) update.adminNotes = String(req.body.adminNotes).trim().slice(0, 2000);

        const application = await JobApplication.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!application) return res.status(404).json({ success: false, message: "Application not found." });

        res.json({ success: true, message: "Application updated.", application });
    } catch (error) {
        console.error("updateApplication:", error);
        res.status(500).json({ success: false, message: "Failed to update application." });
    }
};

export const deleteApplication = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        const application = await JobApplication.findByIdAndDelete(req.params.id);
        if (!application) return res.status(404).json({ success: false, message: "Application not found." });
        removeResumeFile(application.resume?.filename);
        res.json({ success: true, message: "Application deleted." });
    } catch (error) {
        console.error("deleteApplication:", error);
        res.status(500).json({ success: false, message: "Failed to delete application." });
    }
};

export const downloadResume = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        const application = await JobApplication.findById(req.params.id).lean();
        if (!application?.resume?.filename) {
            return res.status(404).json({ success: false, message: "Resume not found." });
        }
        const filePath = path.join(RESUME_DIR, path.basename(application.resume.filename));
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "Resume file is missing on the server." });
        }
        res.download(filePath, application.resume.originalName || path.basename(filePath));
    } catch (error) {
        console.error("downloadResume:", error);
        res.status(500).json({ success: false, message: "Failed to download resume." });
    }
};
