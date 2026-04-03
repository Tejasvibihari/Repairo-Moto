
import mongoose from "mongoose";

const serviceAreaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
                default: "Point",
            },
            coordinates: {
                type: [Number], // [lng, lat]
                required: true,
            },
        },

        radius: {
            type: Number, // meters
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// 🔥 MUST for geo queries
serviceAreaSchema.index({ location: "2dsphere" });

export default mongoose.model("ServiceArea", serviceAreaSchema);