import express from "express";
import authUser from "../Middleware/authUser.js";
import authAdmin from "../Middleware/authAdmin.js";
import {
    getUserMessages,
    sendUserMessage,
    getChatOrdersList,
    getAdminMessages,
    sendAdminMessage,
    getUnreadCounts,
} from "../Controllers/chatController.js";

const router = express.Router();

// User routes
router.get("/:orderId/messages", authUser, getUserMessages);
router.post("/:orderId/messages", authUser, sendUserMessage);

// Admin/Employee routes
router.get("/admin/orders", authAdmin, getChatOrdersList);
router.get("/admin/:orderId/messages", authAdmin, getAdminMessages);
router.post("/admin/:orderId/messages", authAdmin, sendAdminMessage);
router.get("/admin/unread-counts", authAdmin, getUnreadCounts);

export default router;