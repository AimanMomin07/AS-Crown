import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getAnnouncements, createAnnouncement, updateAnnouncementStatus } from "../controllers/announcements.controller.js";

const router = Router();
router.use(authenticate, authorize("admin", "resident", "staff", "security", "committee"));
router.get("/", getAnnouncements);
router.post("/", authenticate, authorize("admin"), createAnnouncement);
router.patch("/:id/status", authenticate, authorize("admin"), updateAnnouncementStatus);
export default router;
