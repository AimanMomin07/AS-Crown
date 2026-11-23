import { Response, NextFunction } from "express";
import pool from "../config/database.js";
import type { AuthenticatedRequest } from "./auth.js";

export function requirePermission(permissionName: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Admin keeps full platform access unless a future explicit deny model is added.
      if (String(req.user.role) === "admin") {
        return next();
      }

      const [rows] = await pool.execute(
        `
        SELECT rp.allowed
        FROM role_permissions rp
        INNER JOIN roles r
          ON r.id = rp.role_id
        INNER JOIN permissions p
          ON p.id = rp.permission_id
        WHERE r.name = ?
          AND p.name = ?
        LIMIT 1
        `,
        [String(req.user.role || ""), permissionName]
      );

      const allowed = Number((rows as any[])[0]?.allowed || 0) === 1;

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${permissionName}`
        });
      }

      return next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to verify permission"
      });
    }
  };
}
