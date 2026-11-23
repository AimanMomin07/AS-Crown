import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permission.js";
import {
  getPermissions,
  updatePermission
} from "../controllers/permissions.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission("manage_permissions"),
  getPermissions
);

router.put(
  "/",
  requirePermission("manage_permissions"),
  updatePermission
);

export default router;
