import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getPortalDashboard,
  getResidentBills,
  getResidentComplaints,
  createResidentComplaint,
  getResidentVehicles,
  createResidentVehicle,
  getResidentNotifications
} from "../controllers/portal.controller.js";

const router = Router();

router.get("/dashboard", authenticate, authorize("resident", "staff", "security", "committee"), getPortalDashboard);
router.get("/resident/bills", authenticate, authorize("resident"), getResidentBills);
router.get("/resident/complaints", authenticate, authorize("resident"), getResidentComplaints);
router.post("/resident/complaints", authenticate, authorize("resident"), createResidentComplaint);
router.get("/resident/vehicles", authenticate, authorize("resident"), getResidentVehicles);
router.post("/resident/vehicles", authenticate, authorize("resident"), createResidentVehicle);
router.get("/resident/notifications", authenticate, authorize("resident"), getResidentNotifications);

export default router;
