import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { assignOwner, assignTenant, removeOwner, removeTenant } from "../controllers/flat-assignment.controller.js";

const router = Router();

router.put("/:id/owner", authenticate, authorize("admin"), assignOwner);
router.delete("/:id/owner", authenticate, authorize("admin"), removeOwner);
router.put("/:id/tenant", authenticate, authorize("admin"), assignTenant);
router.delete("/:id/tenant", authenticate, authorize("admin"), removeTenant);

export default router;
