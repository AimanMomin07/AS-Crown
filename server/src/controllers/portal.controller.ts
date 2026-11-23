import { Response } from "express";
import pool from "../config/database.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

async function residentDashboard(userId: number) {
  const [profileRows] = await pool.execute(`
    SELECT u.id, u.first_name, u.last_name, u.email, u.mobile, u.status,
           mp.flat_number, mp.building_name, mp.wing, mp.ownership_type,
           f.id AS flat_id, f.floor_number, f.flat_type, f.area_sqft,
           b.name AS resolved_building_name, b.building_code
    FROM users u
    LEFT JOIN member_profiles mp ON mp.user_id = u.id
    LEFT JOIN flats f ON f.owner_id = u.id OR f.tenant_id = u.id
    LEFT JOIN buildings b ON b.id = f.building_id
    WHERE u.id = ? LIMIT 1
  `, [userId]);

  const [billRows] = await pool.execute(`
    SELECT mb.id, mb.bill_number, mb.billing_month, mb.total_amount, mb.due_date, mb.status,
           f.flat_number, b.name AS building_name
    FROM maintenance_bills mb
    INNER JOIN flats f ON f.id = mb.flat_id
    INNER JOIN buildings b ON b.id = f.building_id
    WHERE f.owner_id = ? OR f.tenant_id = ?
    ORDER BY mb.billing_month DESC, mb.id DESC
    LIMIT 10
  `, [userId, userId]);

  const [complaintRows] = await pool.execute(`
    SELECT id, complaint_number, title, category, priority, status, created_at, resolved_at
    FROM complaints WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
  `, [userId]);

  const [visitorRows] = await pool.execute(`
    SELECT v.id, v.visitor_name, v.phone, v.purpose, v.visitor_type, v.status, v.check_in, v.check_out,
           f.flat_number, b.name AS building_name
    FROM visitors v LEFT JOIN flats f ON f.id = v.flat_id LEFT JOIN buildings b ON b.id = f.building_id
    WHERE v.resident_id = ? ORDER BY v.created_at DESC LIMIT 10
  `, [userId]);

  const [vehicleRows] = await pool.execute(`
    SELECT id, vehicle_number, vehicle_type, brand, model, color, parking_slot, status
    FROM vehicles WHERE user_id = ? ORDER BY created_at DESC
  `, [userId]);

  const [notificationRows] = await pool.execute(`
    SELECT id, title, message, type, is_read, created_at
    FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 10
  `, [userId]);

  return {
    profile: (profileRows as any[])[0] || null,
    bills: billRows,
    complaints: complaintRows,
    visitors: visitorRows,
    vehicles: vehicleRows,
    unreadNotifications: notificationRows
  };
}

async function staffDashboard(userId: number) {
  const [staffRows] = await pool.execute(`
    SELECT s.*, u.first_name, u.last_name, u.email, u.mobile
    FROM staff s LEFT JOIN users u ON u.id = s.user_id
    WHERE s.user_id = ? LIMIT 1
  `, [userId]);
  const staff = (staffRows as any[])[0] || null;
  const staffId = staff?.id || 0;

  const [attendanceRows] = await pool.execute(`
    SELECT * FROM staff_attendance WHERE staff_id = ? ORDER BY attendance_date DESC LIMIT 15
  `, [staffId]);

  const [complaintRows] = await pool.execute(`
    SELECT id, complaint_number, title, priority, status, created_at
    FROM complaints WHERE assigned_to = ? ORDER BY created_at DESC LIMIT 10
  `, [userId]);

  return { staff, attendance: attendanceRows, assignedComplaints: complaintRows };
}

async function securityDashboard() {
  const [insideRows] = await pool.execute(`SELECT COUNT(*) AS total FROM visitors WHERE status = 'inside'`);
  const [expectedRows] = await pool.execute(`SELECT COUNT(*) AS total FROM visitors WHERE status = 'expected'`);
  const [todayRows] = await pool.execute(`
    SELECT v.id, v.visitor_name, v.phone, v.purpose, v.vehicle_number, v.visitor_type, v.check_in, v.status,
           f.flat_number, b.name AS building_name
    FROM visitors v LEFT JOIN flats f ON f.id = v.flat_id LEFT JOIN buildings b ON b.id = f.building_id
    WHERE DATE(v.created_at) = CURDATE() ORDER BY v.created_at DESC LIMIT 30
  `);
  return {
    visitorsInside: Number((insideRows as any[])[0]?.total || 0),
    expectedVisitors: Number((expectedRows as any[])[0]?.total || 0),
    todayVisitors: todayRows
  };
}

async function committeeDashboard() {
  const [complaintRows] = await pool.execute(`
    SELECT status, COUNT(*) AS total FROM complaints GROUP BY status
  `);
  const [announcementRows] = await pool.execute(`
    SELECT id, title, category, priority, status, publish_at, expires_at
    FROM announcements ORDER BY created_at DESC LIMIT 10
  `);
  const [paymentRows] = await pool.execute(`
    SELECT COALESCE(SUM(amount), 0) AS total_collected
    FROM payments WHERE payment_status = 'success' AND MONTH(paid_at) = MONTH(CURDATE()) AND YEAR(paid_at) = YEAR(CURDATE())
  `);
  return {
    complaintSummary: complaintRows,
    announcements: announcementRows,
    monthlyCollected: Number((paymentRows as any[])[0]?.total_collected || 0)
  };
}

export async function getPortalDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const userId = Number(req.user.id);
    const role = String(req.user.role);

    let data: any;
    if (role === "resident") data = await residentDashboard(userId);
    else if (role === "staff") data = await staffDashboard(userId);
    else if (role === "security") data = await securityDashboard();
    else if (role === "committee") data = await committeeDashboard();
    else return res.status(403).json({ success: false, message: "Portal dashboard is not available for this role" });

    return res.json({ success: true, data: { role, ...data } });
  } catch (error) {
    console.error("Portal dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to load portal dashboard" });
  }
}

export async function getResidentBills(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const [rows] = await pool.execute(`
      SELECT mb.*, f.flat_number, b.name AS building_name, b.building_code
      FROM maintenance_bills mb
      INNER JOIN flats f ON f.id = mb.flat_id
      INNER JOIN buildings b ON b.id = f.building_id
      WHERE f.owner_id = ? OR f.tenant_id = ?
      ORDER BY mb.billing_month DESC, mb.id DESC
    `, [req.user.id, req.user.id]);
    return res.json({ success: true, data: { bills: rows } });
  } catch (error) {
    console.error("Resident bills error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve resident bills" });
  }
}

export async function getResidentComplaints(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const [rows] = await pool.execute(`
      SELECT id, complaint_number, title, description, category, priority, status,
             resolution_notes, resolved_at, created_at, updated_at
      FROM complaints WHERE user_id = ? ORDER BY created_at DESC
    `, [req.user.id]);
    return res.json({ success: true, data: { complaints: rows } });
  } catch (error) {
    console.error("Resident complaints error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve resident complaints" });
  }
}

export async function createResidentComplaint(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const { title, description, category = "other", priority = "medium", flatId } = req.body || {};
    if (!title || !description) return res.status(400).json({ success: false, message: "Title and description are required" });
    const complaintNumber = `CMP-${Date.now()}`;
    const [result] = await pool.execute(`
      INSERT INTO complaints (complaint_number, user_id, flat_id, title, description, category, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
    `, [complaintNumber, req.user.id, flatId || null, String(title).trim(), String(description).trim(), category, priority]);
    return res.status(201).json({ success: true, message: "Complaint submitted successfully", data: { id: (result as any).insertId, complaintNumber } });
  } catch (error) {
    console.error("Resident complaint creation error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit complaint" });
  }
}

export async function getResidentVehicles(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const [rows] = await pool.execute(`SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id]);
    return res.json({ success: true, data: { vehicles: rows } });
  } catch (error) {
    console.error("Resident vehicles error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve vehicles" });
  }
}

export async function createResidentVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const body = req.body || {};
    if (!body.vehicleNumber || !body.vehicleType) return res.status(400).json({ success: false, message: "Vehicle number and type are required" });
    const allowed = ["car", "bike", "scooter", "bicycle", "other"];
    if (!allowed.includes(body.vehicleType)) return res.status(400).json({ success: false, message: "Invalid vehicle type" });
    const [result] = await pool.execute(`
      INSERT INTO vehicles (user_id, flat_id, vehicle_number, vehicle_type, brand, model, color, parking_slot, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [req.user.id, body.flatId || null, String(body.vehicleNumber).trim().toUpperCase(), body.vehicleType, body.brand || null, body.model || null, body.color || null, body.parkingSlot || null]);
    return res.status(201).json({ success: true, message: "Vehicle added successfully", data: { id: (result as any).insertId } });
  } catch (error: any) {
    console.error("Resident vehicle creation error:", error);
    if (error?.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "Vehicle number is already registered" });
    return res.status(500).json({ success: false, message: "Unable to add vehicle" });
  }
}

export async function getResidentNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const [rows] = await pool.execute(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, [req.user.id]);
    return res.json({ success: true, data: { notifications: rows } });
  } catch (error) {
    console.error("Resident notifications error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve notifications" });
  }
}
