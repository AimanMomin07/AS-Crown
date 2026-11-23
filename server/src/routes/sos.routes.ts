import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.js";
import {
  triggerSos,
  getSosAlerts,
  acknowledgeSos,
  resolveSos
} from "../controllers/sos.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", triggerSos);
router.get("/", authorize("admin", "security"), getSosAlerts);
router.patch("/:id/acknowledge", authorize("admin", "security"), acknowledgeSos);
router.patch("/:id/resolve", authorize("admin", "security"), resolveSos);

export default router;
