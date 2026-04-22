import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import http from "http";
import { Server as SocketServer } from "socket.io";

// Import Routes
import adminRoutes from "./Routes/adminRoutes.js";
import brandRoutes from "./Routes/brandRoutes.js";
import orderRouter from "./Routes/orderRoutes.js";
import employeeRouter from "./Routes/employeeRoutes.js";
import vendorRouter from "./Routes/vendorRoutes.js";
import userRouter from "./Routes/userRoutes.js";
import employeeAuthRouter from "./Routes/employeeAuth.js";
import vendorAuthRouter from "./Routes/vendorAuth.js";
import blogRouter from "./Routes/blogRoutes.js";
import vendorOrderRouter from "./Routes/vendorOrderRoutes.js";
import bikeProfileRoutes from "./Routes/bikeProfileRoutes.js";
import serviceAreaRoutes from "./Routes/serviceAreRoutes.js";
import notificationRouter from "./Routes/notificationsRoutes.js";
import dashboardRouter from "./Routes/dashboardRoutes.js";
import paymentRouter from "./Routes/paymentRoutes.js";
import webhookRouter from "./Routes/webhookRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import "./Utils/photoCleanCron.js";
import './jobs/upcomingBookingReminder.js';
// Socket setup
import { setupChatSockets } from "./sockets/chatSocket.js";

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("static"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/brands", brandRoutes);
app.use("/api/admin/order", orderRouter);
app.use("/api/admin/employee", employeeRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/user", userRouter);
app.use("/api/employee/auth", employeeAuthRouter);
app.use("/api/vendor/auth", vendorAuthRouter);
app.use("/api/admin/blog", blogRouter);
app.use("/api/vendor/vendororder", vendorOrderRouter);
app.use("/api/bike-profiles", bikeProfileRoutes);
app.use("/api/service-areas", serviceAreaRoutes);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin/dashboard", dashboardRouter);
app.use("/api/orders", paymentRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/chat", chatRoutes);          // <-- chat routes

app.get("/", (req, res) => {
    res.send("Welcome to the Admin API");
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => console.error("MongoDB connection error:", error.message));

// --- Create HTTP server and attach Socket.IO ---
const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: "*", // Restrict in production
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Make io accessible in routes/controllers (optional)
app.set("io", io);

// Initialize chat sockets
setupChatSockets(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});