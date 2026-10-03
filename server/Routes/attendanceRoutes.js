import express from "express";
import {
    getToday,
    checkIn,
    checkOut,
    getMyAttendance,
    getAttendanceSettings,
    updateAttendanceSettings,
} from "../Controllers/attendanceController.js";
import { authenticateEmployee } from "../Middleware/employeeAuth.js";
import authAdmin from "../Middleware/authAdmin.js";
import requireAdminRole from "../Middleware/requireAdminRole.js";

// ── Employee side — mounted at /api/employee/attendance ──
export const attendanceRouter = express.Router();
attendanceRouter.get("/today", authenticateEmployee, getToday);
attendanceRouter.post("/check-in", authenticateEmployee, checkIn);
attendanceRouter.post("/check-out", authenticateEmployee, checkOut);
attendanceRouter.get("/", authenticateEmployee, getMyAttendance);

// ── Admin side — mounted at /api/admin/attendance ──
export const attendanceAdminRouter = express.Router();
attendanceAdminRouter.get("/settings", authAdmin, requireAdminRole, getAttendanceSettings);
attendanceAdminRouter.put("/settings", authAdmin, requireAdminRole, updateAttendanceSettings);
