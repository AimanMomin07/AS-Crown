import { Response } from "express";

import pool from "../config/database.js";

/* =========================================================
   LIST AMENITIES  (all roles)
========================================================= */

export async function getAmenities(req: any, res: Response) {
  try {
    const includeInactive = req.query.all === "true" && req.user?.role === "admin";

    const [rows] = await pool.execute(
      `SELECT * FROM amenities ${includeInactive ? "" : "WHERE status = 'active'"} ORDER BY name ASC`
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get amenities error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch amenities" });
  }
}

/* =========================================================
   CREATE AMENITY  (admin)
========================================================= */

export async function createAmenity(req: any, res: Response) {
  try {
    const {
      name, description, category, capacity,
      openTime, closeTime, slotMinutes, bookingFee, maxAdvanceDays
    } = req.body || {};

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ success: false, message: "Amenity name is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO amenities
       (name, description, category, capacity, open_time, close_time, slot_minutes, booking_fee, max_advance_days, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        String(name).trim(),
        description || null,
        category || null,
        Number(capacity) || 1,
        openTime || "06:00:00",
        closeTime || "22:00:00",
        Number(slotMinutes) || 60,
        Number(bookingFee) || 0,
        Number(maxAdvanceDays) || 14
      ]
    );

    return res.status(201).json({ success: true, data: { id: (result as any).insertId } });
  } catch (error) {
    console.error("Create amenity error:", error);
    return res.status(500).json({ success: false, message: "Unable to create amenity" });
  }
}

/* =========================================================
   UPDATE AMENITY  (admin)
========================================================= */

export async function updateAmenity(req: any, res: Response) {
  try {
    const id = Number(req.params.id);
    const fields = req.body || {};

    const map: Record<string, string> = {
      name: "name",
      description: "description",
      category: "category",
      capacity: "capacity",
      openTime: "open_time",
      closeTime: "close_time",
      slotMinutes: "slot_minutes",
      bookingFee: "booking_fee",
      maxAdvanceDays: "max_advance_days",
      status: "status",
      imageUrl: "image_url"
    };

    const sets: string[] = [];
    const params: any[] = [];

    for (const key of Object.keys(map)) {
      if (fields[key] !== undefined) {
        sets.push(`${map[key]} = ?`);
        params.push(fields[key]);
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    params.push(id);

    await pool.execute(`UPDATE amenities SET ${sets.join(", ")} WHERE id = ?`, params);

    return res.json({ success: true, message: "Amenity updated" });
  } catch (error) {
    console.error("Update amenity error:", error);
    return res.status(500).json({ success: false, message: "Unable to update amenity" });
  }
}

/* =========================================================
   DELETE AMENITY  (admin)
========================================================= */

export async function deleteAmenity(req: any, res: Response) {
  try {
    const id = Number(req.params.id);
    await pool.execute(`UPDATE amenities SET status = 'inactive' WHERE id = ?`, [id]);
    return res.json({ success: true, message: "Amenity deactivated" });
  } catch (error) {
    console.error("Delete amenity error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove amenity" });
  }
}
