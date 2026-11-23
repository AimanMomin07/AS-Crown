import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getAttendance, upsertAttendance } from "../controllers/staff.controller.js";

const router = Router();
router.use(authenticate, authorize("admin"));
router.get("/", getAttendance);
router.post("/", upsertAttendance);
export default router;
