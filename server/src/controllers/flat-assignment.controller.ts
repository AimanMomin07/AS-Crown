import { Request, Response } from "express";
import pool from "../config/database.js";

export async function assignOwner(req: Request, res: Response) {
  try {
    const flatId = Number(req.params.id);
    const userId = Number(req.body?.userId);

    if (!Number.isInteger(flatId) || flatId <= 0 || !Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: "Valid flat ID and user ID are required" });
    }

    const [flatRows] = await pool.execute(`SELECT id, status, tenant_id FROM flats WHERE id = ? LIMIT 1`, [flatId]);
    const flat = (flatRows as any[])[0];
    if (!flat) return res.status(404).json({ success: false, message: "Flat not found" });
    if (flat.status !== "active") return res.status(400).json({ success: false, message: "Flat is inactive" });

    const [userRows] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.mobile, u.status, r.name AS role_name
      FROM users u INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ? LIMIT 1
    `, [userId]);
    const user = (userRows as any[])[0];
    if (!user) return res.status(404).json({ success: false, message: "Resident not found" });
    if (String(user.role_name).toLowerCase() !== "resident") return res.status(400).json({ success: false, message: "Only residents can be assigned to flats" });
    if (user.status !== "active") return res.status(400).json({ success: false, message: "Only active residents can be assigned" });

    await pool.execute(`
      UPDATE flats SET owner_id = ?, occupancy_status = CASE WHEN tenant_id IS NULL THEN 'occupied' ELSE 'rented' END,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [userId, flatId]);

    return res.json({ success: true, message: "Owner assigned successfully", data: { flatId, owner: user } });
  } catch (error) {
    console.error("Assign owner error:", error);
    return res.status(500).json({ success: false, message: "Unable to assign owner" });
  }
}

export async function assignTenant(req: Request, res: Response) {
  try {
    const flatId = Number(req.params.id);
    const userId = Number(req.body?.userId);

    if (!Number.isInteger(flatId) || flatId <= 0 || !Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: "Valid flat ID and user ID are required" });
    }

    const [flatRows] = await pool.execute(`SELECT id, status FROM flats WHERE id = ? LIMIT 1`, [flatId]);
    const flat = (flatRows as any[])[0];
    if (!flat) return res.status(404).json({ success: false, message: "Flat not found" });
    if (flat.status !== "active") return res.status(400).json({ success: false, message: "Flat is inactive" });

    const [userRows] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.mobile, u.status, r.name AS role_name
      FROM users u INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ? LIMIT 1
    `, [userId]);
    const user = (userRows as any[])[0];
    if (!user) return res.status(404).json({ success: false, message: "Resident not found" });
    if (String(user.role_name).toLowerCase() !== "resident") return res.status(400).json({ success: false, message: "Only residents can be assigned to flats" });
    if (user.status !== "active") return res.status(400).json({ success: false, message: "Only active residents can be assigned" });

    await pool.execute(`
      UPDATE flats SET tenant_id = ?, occupancy_status = 'rented', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [userId, flatId]);

    return res.json({ success: true, message: "Tenant assigned successfully", data: { flatId, tenant: user } });
  } catch (error) {
    console.error("Assign tenant error:", error);
    return res.status(500).json({ success: false, message: "Unable to assign tenant" });
  }
}

export async function removeOwner(req: Request, res: Response) {
  try {
    const flatId = Number(req.params.id);
    if (!Number.isInteger(flatId) || flatId <= 0) return res.status(400).json({ success: false, message: "Invalid flat ID" });
    await pool.execute(`
      UPDATE flats SET owner_id = NULL, occupancy_status = CASE WHEN tenant_id IS NULL THEN 'vacant' ELSE 'rented' END,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [flatId]);
    return res.json({ success: true, message: "Owner removed successfully" });
  } catch (error) {
    console.error("Remove owner error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove owner" });
  }
}

export async function removeTenant(req: Request, res: Response) {
  try {
    const flatId = Number(req.params.id);
    if (!Number.isInteger(flatId) || flatId <= 0) return res.status(400).json({ success: false, message: "Invalid flat ID" });
    await pool.execute(`
      UPDATE flats SET tenant_id = NULL, occupancy_status = CASE WHEN owner_id IS NULL THEN 'vacant' ELSE 'occupied' END,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [flatId]);
    return res.json({ success: true, message: "Tenant removed successfully" });
  } catch (error) {
    console.error("Remove tenant error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove tenant" });
  }
}
