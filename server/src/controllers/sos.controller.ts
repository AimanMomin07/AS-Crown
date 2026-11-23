import { Response } from "express";

import pool from "../config/database.js";
import { createUserNotification } from "../utils/notification.js";
import { emitRealtime } from "../realtime/socket.js";

/* =========================================================
   TRIGGER SOS  (any authenticated resident/staff)
========================================================= */

export async function triggerSos(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);
    const { alertType, message, latitude, longitude } = req.body || {};

    const validTypes = ["medical", "fire", "security", "other"];
    const type = validTypes.includes(alertType) ? alertType : "other";

    const [flatRows] = await pool.execute(
      `SELECT f.id FROM flats f WHERE (f.owner_id = ? OR f.tenant_id = ?) LIMIT 1`,
      [userId, userId]
    );
    const flatId = (flatRows as any[])[0]?.id || null;

    const [userRows] = await pool.execute(
      `SELECT first_name, last_name, mobile FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );
    const user = (userRows as any[])[0] || {};

    const [result] = await pool.execute(
      `INSERT INTO sos_alerts (user_id, flat_id, alert_type, message, latitude, longitude, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        userId,
        flatId,
        type,
        message || null,
        latitude ?? null,
        longitude ?? null
      ]
    );

    const alertId = (result as any).insertId;

    // Notify every active admin and security guard
    const [staffRows] = await pool.execute(`
      SELECT u.id FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE LOWER(r.name) IN ('admin', 'security') AND u.status = 'active'
    `);

    const responderName = `${user.first_name || "A resident"} ${user.last_name || ""}`.trim();

    for (const staff of staffRows as any[]) {
      await createUserNotification(
        staff.id,
        "🚨 SOS ALERT",
        `${responderName} triggered a ${type} emergency alert. Immediate attention required.`,
        "security"
      );
    }

    emitRealtime("sos:new", {
      id: alertId,
      userId,
      userName: responderName,
      userPhone: user.mobile,
      flatId,
      alertType: type,
      message: message || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      status: "active",
      createdAt: new Date()
    });

    return res.status(201).json({ success: true, message: "SOS alert sent", data: { id: alertId } });
  } catch (error) {
    console.error("Trigger SOS error:", error);
    return res.status(500).json({ success: false, message: "Unable to send SOS alert" });
  }
}

/* =========================================================
   LIST ALERTS  (admin / security)
========================================================= */

export async function getSosAlerts(req: any, res: Response) {
  try {
    const status = String(req.query.status || "").trim();
    const conditions: string[] = ["1=1"];
    const params: any[] = [];

    if (status) {
      conditions.push("s.status = ?");
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT s.*, u.first_name, u.last_name, u.mobile,
              f.flat_number, b.name AS building_name
       FROM sos_alerts s
       LEFT JOIN users u ON u.id = s.user_id
       LEFT JOIN flats f ON f.id = s.flat_id
       LEFT JOIN buildings b ON b.id = f.building_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY s.created_at DESC
       LIMIT 100`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get SOS alerts error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch alerts" });
  }
}

/* =========================================================
   ACKNOWLEDGE  (admin / security)
========================================================= */

export async function acknowledgeSos(req: any, res: Response) {
  try {
    const responderId = Number(req.user?.id);
    const id = Number(req.params.id);

    await pool.execute(
      `UPDATE sos_alerts SET status = 'acknowledged', acknowledged_by = ?, acknowledged_at = NOW()
       WHERE id = ? AND status = 'active'`,
      [responderId, id]
    );

    emitRealtime("sos:updated", { id, status: "acknowledged" });

    return res.json({ success: true, message: "Alert acknowledged" });
  } catch (error) {
    console.error("Acknowledge SOS error:", error);
    return res.status(500).json({ success: false, message: "Unable to acknowledge alert" });
  }
}

/* =========================================================
   RESOLVE  (admin / security)
========================================================= */

export async function resolveSos(req: any, res: Response) {
  try {
    const responderId = Number(req.user?.id);
    const id = Number(req.params.id);
    const { notes, falseAlarm } = req.body || {};

    await pool.execute(
      `UPDATE sos_alerts SET status = ?, resolved_by = ?, resolved_at = NOW(), resolution_notes = ?
       WHERE id = ?`,
      [falseAlarm ? "false_alarm" : "resolved", responderId, notes || null, id]
    );

    emitRealtime("sos:updated", { id, status: falseAlarm ? "false_alarm" : "resolved" });

    return res.json({ success: true, message: "Alert closed" });
  } catch (error) {
    console.error("Resolve SOS error:", error);
    return res.status(500).json({ success: false, message: "Unable to resolve alert" });
  }
}
