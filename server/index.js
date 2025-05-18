import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import nodemailer from 'nodemailer'


// Import Router 
import adminRoutes from "./Routes/adminRoutes.js";
import brandRoutes from "./Routes/brandRoutes.js"
import orderRouter from "./Routes/orderRoutes.js";
import employeeRouter from "./Routes/employeeRoutes.js"
import vendorRouter from "./Routes/vendorRoutes.js"
import userRouter from './Routes/userRoutes.js'
import employeeAuthRouter from "./Routes/employeeAuth.js"
import vendorAuthRouter from "./Routes/vendorAuth.js"
import blogRouter from "./Routes/blogRoutes.js"
import vendorOrderRouter from "./Routes/vendorOrderRoutes.js"


const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/static', express.static('static'));

const PORT = process.env.PORT || 5000;


// Routes 
app.use("/api/admin", adminRoutes);
app.use("/api/admin/brands", brandRoutes);
app.use("/api/admin/order", orderRouter);
app.use("/api/admin/employee", employeeRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/user", userRouter);
app.use("/api/employee/auth", employeeAuthRouter)
app.use("/api/vendor/auth", vendorAuthRouter)
app.use("/api/admin/blog", blogRouter);
app.use("/api/vendor/vendororder", vendorOrderRouter);


app.get("/", (req, res) => {
    res.send("Welcome to the Admin API");
})
// Mongodb Server 
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });

// Create Server 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

