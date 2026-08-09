import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
    {
        // Customer information
        customer: {
            name: {
                type: String,
                required: true,
                trim: true,
            },

            phone: {
                type: String,
                required: true,
                trim: true,
            },
        },

        // Vehicle information
        vehicle: {
            brand: {
                type: String,
                trim: true,
            },

            model: {
                type: String,
                trim: true,
            },

            registrationNumber: {
                type: String,
                trim: true,
            },
        },

        // Customer/service location
        location: {
            address: {
                type: String,
                trim: true,
            },

            city: {
                type: String,
                trim: true,
            },

            latitude: {
                type: Number,
            },

            longitude: {
                type: Number,
            },
            googleMapLink: {
                type: String,
                trim: true,
            }
        },

        // Where the lead came from
        source: {
            type: String,
            trim: true,
            default: "other",
        },

        // Service the customer is interested in
        serviceInterest: {
            type: String,
            trim: true,
        },

        // Lead status
        status: {
            type: String,
            enum: [
                "new",
                "called",
                "interested",
                "follow_up",
                "booked",
                "not_interested",
                "not_reachable",
                "completed",
                "direct_booking",
            ],
            default: "new",
            index: true,
        },

        // Remarks / conversation history
        remarks: [
            {
                text: {
                    type: String,
                    required: true,
                    trim: true,
                },

                addedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Admin",
                },

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        leadBy: {
            type: String,
            required: true,
            trim: true,
        },
        // Optional follow-up information
        followUp: {
            date: {
                type: Date,
            },

            note: {
                type: String,
                trim: true,
            },
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
        // Invoice/order association
        invoice: {
            linked: {
                type: Boolean,
                default: false,
            },

            invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
                default: null,
            },

            linkedAt: {
                type: Date,
            },
        },
    },
    {
        timestamps: true,
    }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;