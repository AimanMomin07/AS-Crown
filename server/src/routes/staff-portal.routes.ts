import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getStaffPortal, markStaffAttendance, updateOwnComplaint } from "../controllers/staff-portal.controller.js";

const router = Router();
router.use(authenticate, authorize("staff"));
router.get("/", getStaffPortal);
router.post("/attendance", markStaffAttendance);
router.patch("/complaints/:id/status", updateOwnComplaint);
export default router;
