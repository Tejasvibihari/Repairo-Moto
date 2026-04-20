import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        senderType: {
            type: String,
            enum: ["user", "admin", "employee"],
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        attachments: [
            {
                url: { type: String, trim: true },
                type: { type: String, enum: ["image", "file"], default: "image" },
            },
        ],
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

chatMessageSchema.index({ orderId: 1, createdAt: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;