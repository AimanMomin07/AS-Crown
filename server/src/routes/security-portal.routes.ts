import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getSecurityPortal, markSecurityAttendance, updateSecurityVisitorStatus } from "../controllers/security-portal.controller.js";

const router = Router();
router.use(authenticate, authorize("security"));
router.get("/", getSecurityPortal);
router.post("/attendance", markSecurityAttendance);
router.patch("/visitors/:id/status", updateSecurityVisitorStatus);
export default router;
