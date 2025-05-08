import express from "express";
import { createEmployee, deleteEmployeeById, getAllEmployee, updateEmployeeById } from "../Controllers/employeeController.js";
import { employeeUpload } from "../Middleware/employeeMulter.js";
import authAdmin from "../Middleware/authAdmin.js";


const router = express.Router();

router.post("/addemployee", authAdmin, employeeUpload.single('profileImage'), createEmployee);
router.get("/getallemployee", getAllEmployee);
router.delete("/deleteemployee/:id", authAdmin, deleteEmployeeById);
router.put("/updateemployee/:id", employeeUpload.single("profileImage"), updateEmployeeById);


export default router;