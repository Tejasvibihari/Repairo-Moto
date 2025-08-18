import express from "express";
import { createEmployee, deleteEmployeeById, getAllEmployee, getEmployeeById, updateEmployeeById } from "../Controllers/employeeController.js";
import { employeeUpload } from "../Middleware/employeeMulter.js";
import authAdmin from "../Middleware/authAdmin.js";
import { attachReferralCode } from "../Middleware/referralMiddleware.js";


const router = express.Router();

router.post("/addemployee", employeeUpload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'dlImage', maxCount: 1 }
]), createEmployee);
router.get("/getallemployee", getAllEmployee);
router.get("/getemployee/id/:id", getEmployeeById);
router.delete("/deleteemployee/:id", deleteEmployeeById);
router.put("/updateemployee/:id", employeeUpload.single("profileImage"), updateEmployeeById);


export default router;