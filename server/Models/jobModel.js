import mongoose from "mongoose";

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
export const JOB_STATUSES = ["open", "closed", "draft"];

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        department: {
            type: String,
            trim: true,
            default: "",
        },
        location: {
            type: String,
            trim: true,
            default: "Patna",
        },
        jobType: {
            type: String,
            enum: JOB_TYPES,
            default: "Full-time",
        },
        experience: {
            type: String,
            trim: true,
            default: "",
        },
        salary: {
            type: String,
            trim: true,
            default: "",
        },
        openings: {
            type: Number,
            min: 1,
            default: 1,
        },
        description: {
            type: String,
            required: true,
        },
        requirements: {
            type: String,
            default: "",
        },
        lastDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: JOB_STATUSES,
            default: "open",
        },
        createdBy: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;
