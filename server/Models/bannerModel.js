import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "",
        },
        image: {
            type: String,
            required: true,
        },
        link: {
            // optional deep link / URL to open when the banner is tapped in the app
            type: String,
            trim: true,
            default: "",
        },
        order: {
            // lower order = shown first. Set by admin (drag & drop) to control
            // the sequence banners appear in on the mobile app.
            type: Number,
            default: 0,
            index: true,
        },
        isActive: {
            // whether this banner is currently one of the (max 5) visible banners
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;