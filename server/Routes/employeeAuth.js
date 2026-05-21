import express from "express";
import { employeeSignIn } from "../Controllers/employeeController.js";
import { employeeUpload } from "../Middleware/employeeMulter.js";
import authAdmin from "../Middleware/authAdmin.js";
import { authenticateEmployee } from "../Middleware/employeeAuth.js";

const router = express.Router();

router.post("/employee-sign-in", employeeSignIn);
router.get("/me", authenticateEmployee, (req, res) => {
    res.status(200).json({
        success: true,
        employee: req.employee
    });
});
export default router;