import mongoose from "mongoose";

const appContentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "",
        },
        message: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        image: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            trim: true,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        startsAt: {
            type: Date,
            default: null,
        },
        endsAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const AppContent = mongoose.model("AppContent", appContentSchema);
export default AppContent;
