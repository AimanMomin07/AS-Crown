import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.js";
import {
  recordMetric,
  getDashboard,
  getMetricHistory
} from "../controllers/sustainability.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getDashboard);
router.get("/:metricType/history", getMetricHistory);
router.post("/", authorize("admin", "staff"), recordMetric);

export default router;
