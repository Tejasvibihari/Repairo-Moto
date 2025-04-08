import express from "express";
import { createManualOrder } from "../Controllers/orderController.js";

const router = express.Router();

router.post("/manualorder", createManualOrder);

export default router;