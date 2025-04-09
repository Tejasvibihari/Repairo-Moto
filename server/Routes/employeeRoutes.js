import express from "express";
import { createEmployee, getAllEmployee } from "../Controllers/employeeController.js";
import { employeeUpload } from "../Middleware/employeeMulter.js";


const router = express.Router();

router.post("/addemployee", employeeUpload.single('profileImage'), createEmployee);
router.get("/getallemployee", getAllEmployee);
export default router;