import express from "express";
import { createEmployee } from "../Controllers/employeeController.js";
import { employeeUpload } from "../Middleware/employeeMulter.js";


const router = express.Router();

router.post("/addemployee", employeeUpload.single('profileImage'), createEmployee);

export default router;