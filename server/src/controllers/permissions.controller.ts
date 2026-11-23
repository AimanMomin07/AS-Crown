import { Request, Response } from "express";
import pool from "../config/database.js";
import { recordAudit } from "../utils/audit-log.js";

export async function getPermissions(_req: Request, res: Response) {
  try {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.name,
        p.description,
        COALESCE(rp.allowed, 0) AS allowed,
        r.id AS role_id,
        r.name AS role_name
      FROM permissions p
      CROSS JOIN roles r
      LEFT JOIN role_permissions rp
        ON rp.permission_id = p.id
       AND rp.role_id = r.id
      ORDER BY r.name, p.name
    `);

    return res.json({
      success: true,
      data: {
        permissions: rows
      }
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load permissions"
    });
  }
}

export async function updatePermission(req: Request, res: Response) {
  try {
    const role = String(req.body?.role || "").trim();
    const permissionId = Number(req.body?.permissionId);
    const allowed = req.body?.allowed ? 1 : 0;

    if (!role || !Number.isInteger(permissionId) || permissionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid role and permission are required"
      });
    }

    if (role === "admin") {
      return res.status(400).json({
        success: false,
        message: "The admin role keeps full access"
      });
    }

    const [roleRows] = await pool.execute(
      `SELECT id FROM roles WHERE name = ? LIMIT 1`,
      [role]
    );
    const roleId = Number((roleRows as any[])[0]?.id || 0);

    if (!roleId) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    const [permissionRows] = await pool.execute(
      `SELECT id, name FROM permissions WHERE id = ? LIMIT 1`,
      [permissionId]
    );
    const permission = (permissionRows as any[])[0];

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    await pool.execute(
      `
      INSERT INTO role_permissions
      (role_id, permission_id, allowed)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        allowed = VALUES(allowed)
      `,
      [roleId, permissionId, allowed]
    );

    await recordAudit(req as any, {
      action: allowed ? "permission_granted" : "permission_revoked",
      entityType: "role_permission",
      entityId: permissionId,
      details: {
        role,
        permission: permission.name,
        allowed: Boolean(allowed)
      }
    });

    return res.json({
      success: true,
      message: `Permission ${allowed ? "granted" : "revoked"}`
    });
  } catch (error) {
    console.error("Update permission error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update permission"
    });
  }
}
