import express from "express";
import { employeeSignIn } from "../Controllers/employeeController.js";
import { employeeUpload } from "../Middleware/employeeMulter.js";
import authAdmin from "../Middleware/authAdmin.js";
import { authenticateEmployee } from "../Middleware/employeeAuth.js";
import { getMyStatus, setMyStatus, postMyLocation } from "../Controllers/mechanicTrackingController.js";

const router = express.Router();

router.post("/employee-sign-in", employeeSignIn);
router.get("/me", authenticateEmployee, (req, res) => {
    res.status(200).json({
        success: true,
        employee: req.employee
    });
});
// ── Mechanic duty switch + live location ──
router.get("/status", authenticateEmployee, getMyStatus);
router.patch("/status", authenticateEmployee, setMyStatus);
router.post("/location", authenticateEmployee, postMyLocation);

export default router;