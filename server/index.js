import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";


// Import Router 
import adminRoutes from "./Routes/adminRoutes.js";
import brandRoutes from "./Routes/brandRoutes.js"
import orderRouter from "./Routes/orderRoutes.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;


// Routes 
app.use("/api/admin", adminRoutes);
app.use("/api/admin/brands", brandRoutes);
app.use("/api/admin/order", orderRouter);
// app.use("/api/vendor")
// app.use("/api/employee")


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

