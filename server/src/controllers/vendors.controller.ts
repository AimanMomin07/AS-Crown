import { Response } from "express";

import pool from "../config/database.js";
import { createUserNotification } from "../utils/notification.js";

/* =========================================================
   LIST VENDORS  (all roles)
========================================================= */

export async function getVendors(req: any, res: Response) {
  try {
    const category = String(req.query.category || "").trim();
    const search = String(req.query.search || "").trim();
    const includeInactive = req.query.all === "true" && req.user?.role === "admin";

    const conditions: string[] = [includeInactive ? "1=1" : "status = 'active'"];
    const params: any[] = [];

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (search) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `SELECT * FROM vendors WHERE ${conditions.join(" AND ")} ORDER BY verified DESC, rating DESC, name ASC`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get vendors error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch vendors" });
  }
}

/* =========================================================
   CREATE VENDOR  (admin)
========================================================= */

export async function createVendor(req: any, res: Response) {
  try {
    const { name, category, phone, email, description, imageUrl, verified } = req.body || {};

    if (!name || !category || !phone) {
      return res.status(400).json({ success: false, message: "Name, category and phone are required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO vendors (name, category, phone, email, description, image_url, verified, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        String(name).trim(),
        String(category).trim(),
        String(phone).trim(),
        email || null,
        description || null,
        imageUrl || null,
        verified ? 1 : 0
      ]
    );

    return res.status(201).json({ success: true, data: { id: (result as any).insertId } });
  } catch (error) {
    console.error("Create vendor error:", error);
    return res.status(500).json({ success: false, message: "Unable to add vendor" });
  }
}

/* =========================================================
   UPDATE VENDOR  (admin)
========================================================= */

export async function updateVendor(req: any, res: Response) {
  try {
    const id = Number(req.params.id);
    const fields = req.body || {};

    const map: Record<string, string> = {
      name: "name",
      category: "category",
      phone: "phone",
      email: "email",
      description: "description",
      imageUrl: "image_url",
      verified: "verified",
      status: "status"
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
    await pool.execute(`UPDATE vendors SET ${sets.join(", ")} WHERE id = ?`, params);

    return res.json({ success: true, message: "Vendor updated" });
  } catch (error) {
    console.error("Update vendor error:", error);
    return res.status(500).json({ success: false, message: "Unable to update vendor" });
  }
}

/* =========================================================
   DELETE VENDOR  (admin)
========================================================= */

export async function deleteVendor(req: any, res: Response) {
  try {
    const id = Number(req.params.id);
    await pool.execute(`UPDATE vendors SET status = 'inactive' WHERE id = ?`, [id]);
    return res.json({ success: true, message: "Vendor removed" });
  } catch (error) {
    console.error("Delete vendor error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove vendor" });
  }
}

/* =========================================================
   REQUEST SERVICE  (resident)
========================================================= */

export async function requestService(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);
    const { vendorId, description, preferredDate } = req.body || {};

    if (!vendorId || !description || String(description).trim().length < 5) {
      return res.status(400).json({ success: false, message: "Vendor and a short description are required" });
    }

    const [flatRows] = await pool.execute(
      `SELECT id FROM flats WHERE owner_id = ? OR tenant_id = ? LIMIT 1`,
      [userId, userId]
    );
    const flatId = (flatRows as any[])[0]?.id || null;

    const [result] = await pool.execute(
      `INSERT INTO vendor_service_requests (vendor_id, user_id, flat_id, description, preferred_date, status)
       VALUES (?, ?, ?, ?, ?, 'requested')`,
      [vendorId, userId, flatId, String(description).trim(), preferredDate || null]
    );

    return res.status(201).json({ success: true, data: { id: (result as any).insertId } });
  } catch (error) {
    console.error("Request service error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit request" });
  }
}

/* =========================================================
   MY SERVICE REQUESTS  (resident)
========================================================= */

export async function getMyServiceRequests(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);

    const [rows] = await pool.execute(
      `SELECT vsr.*, v.name AS vendor_name, v.category, v.phone AS vendor_phone
       FROM vendor_service_requests vsr
       INNER JOIN vendors v ON v.id = vsr.vendor_id
       WHERE vsr.user_id = ?
       ORDER BY vsr.created_at DESC
       LIMIT 50`,
      [userId]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get my service requests error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch requests" });
  }
}

/* =========================================================
   ALL SERVICE REQUESTS  (admin)
========================================================= */

export async function getAllServiceRequests(req: any, res: Response) {
  try {
    const status = String(req.query.status || "").trim();
    const conditions: string[] = ["1=1"];
    const params: any[] = [];

    if (status) {
      conditions.push("vsr.status = ?");
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT vsr.*, v.name AS vendor_name, u.first_name, u.last_name, f.flat_number
       FROM vendor_service_requests vsr
       INNER JOIN vendors v ON v.id = vsr.vendor_id
       LEFT JOIN users u ON u.id = vsr.user_id
       LEFT JOIN flats f ON f.id = vsr.flat_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY vsr.created_at DESC
       LIMIT 200`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get all service requests error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch requests" });
  }
}

/* =========================================================
   UPDATE SERVICE REQUEST STATUS  (admin)
========================================================= */

export async function updateServiceRequestStatus(req: any, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    const validStatuses = ["requested", "accepted", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const [rows] = await pool.execute(
      `SELECT vsr.user_id, v.name AS vendor_name FROM vendor_service_requests vsr
       INNER JOIN vendors v ON v.id = vsr.vendor_id WHERE vsr.id = ? LIMIT 1`,
      [id]
    );
    const request = (rows as any[])[0];

    await pool.execute(`UPDATE vendor_service_requests SET status = ? WHERE id = ?`, [status, id]);

    if (request) {
      await createUserNotification(
        request.user_id,
        "Service request update",
        `Your request for ${request.vendor_name} is now "${status}".`,
        "other"
      );
    }

    return res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("Update service request error:", error);
    return res.status(500).json({ success: false, message: "Unable to update request" });
  }
}
