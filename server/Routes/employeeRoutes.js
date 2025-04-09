import express from "express";
import { createEmployee, deleteEmployeeById, getAllEmployee } from "../Controllers/employeeController.js";
import { employeeUpload } from "../Middleware/employeeMulter.js";


const router = express.Router();

router.post("/addemployee", employeeUpload.single('profileImage'), createEmployee);
router.get("/getallemployee", getAllEmployee);
router.delete("/deleteemployee/:id", deleteEmployeeById);
export default router;