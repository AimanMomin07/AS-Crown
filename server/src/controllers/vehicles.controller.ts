import { Request, Response } from "express";
import pool from "../config/database.js";

const types = ["car", "bike", "scooter", "bicycle", "other"];

export async function getVehicles(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || "").trim();
    const flatId = String(req.query.flatId || "").trim();
    const conditions = ["1=1"];
    const params: unknown[] = [];
    if (userId) { conditions.push("v.user_id = ?"); params.push(Number(userId)); }
    if (flatId) { conditions.push("v.flat_id = ?"); params.push(Number(flatId)); }

   const [
  rows
] = await pool.query(
  `
    SELECT
      v.*,

      f.flat_number,

      b.name AS building_name,

      u.first_name,
      u.last_name,
      u.email,
      u.mobile

    FROM vehicles v

    LEFT JOIN flats f
      ON f.id = v.flat_id

    LEFT JOIN buildings b
      ON b.id = f.building_id

    INNER JOIN users u
      ON u.id = v.user_id

    WHERE ${conditions.join(" AND ")}

    ORDER BY
      v.created_at DESC
  `,
  params
);
    return res.json({ success: true, data: { vehicles: rows } });
  } catch (error) {
    console.error("Get vehicles error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve vehicles" });
  }
}

export async function createVehicle(req: Request, res: Response) {
  try {
    const body = req.body ?? {};
    const userId = Number(body.userId);
    const vehicleType = body.vehicleType || "car";
    if (!Number.isInteger(userId) || !body.vehicleNumber || !types.includes(vehicleType)) {
      return res.status(400).json({ success: false, message: "User, vehicle number and valid type are required" });
    }
    const [result] = await pool.execute(
      `INSERT INTO vehicles
       (user_id, flat_id, vehicle_number, vehicle_type, brand, model, color, parking_slot, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userId, body.flatId || null, String(body.vehicleNumber).trim().toUpperCase(), vehicleType, body.brand || null, body.model || null, body.color || null, body.parkingSlot || null]
    );
    return res.status(201).json({ success: true, message: "Vehicle registered successfully", data: { id: (result as any).insertId } });
  } catch (error: any) {
    console.error("Create vehicle error:", error);
    if (error?.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "Vehicle number is already registered" });
    return res.status(500).json({ success: false, message: "Unable to register vehicle" });
  }
}

export async function updateVehicle(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
    await pool.execute(
      `UPDATE vehicles SET
        vehicle_number = COALESCE(?, vehicle_number),
        vehicle_type = COALESCE(?, vehicle_type),
        brand = COALESCE(?, brand),
        model = COALESCE(?, model),
        color = COALESCE(?, color),
        parking_slot = COALESCE(?, parking_slot),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [body.vehicleNumber || null, body.vehicleType || null, body.brand || null, body.model || null, body.color || null, body.parkingSlot || null, body.status || null, id]
    );
    return res.json({ success: true, message: "Vehicle updated successfully" });
  } catch (error) {
    console.error("Update vehicle error:", error);
    return res.status(500).json({ success: false, message: "Unable to update vehicle" });
  }
}
