import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permission.js";
import {
  getAuditLogs,
  getAuditLogStats
} from "../controllers/audit-logs.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/stats",
  requirePermission("view_audit_logs"),
  getAuditLogStats
);

router.get(
  "/",
  requirePermission("view_audit_logs"),
  getAuditLogs
);

export default router;
