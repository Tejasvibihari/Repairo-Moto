import mongoose from "mongoose";

export const APPLICATION_STATUSES = [
    "new",
    "reviewed",
    "shortlisted",
    "rejected",
    "hired",
];

const jobApplicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true,
        },
        // Snapshot so the admin still sees what was applied for if the job is renamed.
        jobTitle: {
            type: String,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
            default: "",
        },
        experience: {
            type: String,
            trim: true,
            default: "",
        },
        currentCompany: {
            type: String,
            trim: true,
            default: "",
        },
        coverLetter: {
            type: String,
            trim: true,
            default: "",
        },
        resume: {
            // Stored OUTSIDE the public /uploads folder; only served via the admin-only download route.
            filename: { type: String, default: "" },
            originalName: { type: String, default: "" },
            mimeType: { type: String, default: "" },
            size: { type: Number, default: 0 },
        },
        status: {
            type: String,
            enum: APPLICATION_STATUSES,
            default: "new",
        },
        adminNotes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

// One application per phone number per job, and per email when an email was given (email is optional).
jobApplicationSchema.index({ job: 1, phone: 1 }, { unique: true });
jobApplicationSchema.index(
    { job: 1, email: 1 },
    { unique: true, partialFilterExpression: { email: { $gt: "" } } }
);
jobApplicationSchema.index({ status: 1, createdAt: -1 });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

// Drops the old unique {job, email} index (which made a blank email collide) and builds the new ones.
// Only touches this collection.
JobApplication.syncIndexes().catch((err) => console.error("JobApplication.syncIndexes:", err.message));

export default JobApplication;
