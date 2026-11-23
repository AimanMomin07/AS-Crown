import { Request, Response } from "express";
import pool from "../config/database.js";
import { createUserNotification } from "../utils/notification.js";

function getUserId(req: any) {
  const id = Number(req.user?.id);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

function hoursBetween(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / 3600000);
}

export async function getSecurityPortal(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const [attendanceRows] = await pool.execute(
      `
      SELECT *
      FROM security_attendance
      WHERE security_user_id = ?
        AND attendance_date = CURRENT_DATE
      LIMIT 1
      `,
      [userId]
    );

    const [historyRows] = await pool.execute(
      `
      SELECT *
      FROM security_attendance
      WHERE security_user_id = ?
      ORDER BY attendance_date DESC, id DESC
      LIMIT 7
      `,
      [userId]
    );

    const [expectedRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM visitors WHERE status = 'expected' AND DATE(created_at) = CURRENT_DATE`
    );

    const [insideRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM visitors WHERE status = 'inside'`
    );

    const [completedRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM visitors WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE`
    );

    const [visitorRows] = await pool.execute(
      `
      SELECT
        v.id,
        v.visitor_name,
        v.phone,
        v.purpose,
        v.vehicle_number,
        v.parking_slot,
        v.visitor_type,
        v.check_in,
        v.check_out,
        v.status,
        v.created_at,
        f.flat_number,
        b.name AS building_name,
        b.building_code,
        CONCAT_WS(' ', u.first_name, u.last_name) AS resident_name
      FROM visitors v
      LEFT JOIN flats f ON f.id = v.flat_id
      LEFT JOIN buildings b ON b.id = f.building_id
      LEFT JOIN users u ON u.id = v.resident_id
      WHERE v.status IN ('expected','inside')
      ORDER BY v.created_at DESC
      LIMIT 50
      `
    );

    return res.json({
      success: true,
      data: {
        attendance: (attendanceRows as any[])[0] || null,
        attendanceHistory: historyRows,
        stats: {
          expected: Number((expectedRows as any[])[0]?.total || 0),
          inside: Number((insideRows as any[])[0]?.total || 0),
          completedToday: Number((completedRows as any[])[0]?.total || 0)
        },
        visitors: visitorRows
      }
    });
  } catch (error) {
    console.error("Security portal error:", error);
    return res.status(500).json({ success: false, message: "Unable to load security command center" });
  }
}

export async function markSecurityAttendance(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawAction =
      String(
        req.body?.action ||
        req.body?.attendanceAction ||
        ""
      )
        .trim()
        .toLowerCase();

    const action =
      rawAction === "checkin" ||
      rawAction === "check-in"
        ? "check_in"
        : rawAction === "checkout" ||
          rawAction === "check-out"
          ? "check_out"
          : rawAction;
    if (action !== "check_in" && action !== "check_out") {
      return res.status(400).json({ success: false, message: "Invalid attendance action" });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM security_attendance WHERE security_user_id = ? AND attendance_date = CURRENT_DATE LIMIT 1`,
      [userId]
    );
    const existing = (rows as any[])[0];

    if (action === "check_in") {
      if (existing?.check_in) {
        return res.status(409).json({ success: false, message: "You are already checked in for this shift" });
      }

      const now = new Date();
      const hour = now.getHours();
      const shift = hour >= 6 && hour < 18 ? "day" : "night";
      const expectedEnd = new Date(now.getTime() + 12 * 3600000);
      const checkIn = now.toTimeString().slice(0, 8);

      if (existing) {
        await pool.execute(
          `
          UPDATE security_attendance
          SET
            shift_type = ?,
            check_in = ?,
            shift_start_at = ?,
            expected_end_at = ?,
            status = 'present',
            remarks = ?
          WHERE id = ?
          `,
          [shift, checkIn, now, expectedEnd, `Self check-in · ${shift} shift · 12 hours`, existing.id]
        );
      } else {
        await pool.execute(
          `
          INSERT INTO security_attendance
          (
            security_user_id,
            attendance_date,
            shift_type,
            check_in,
            shift_start_at,
            expected_end_at,
            status,
            remarks
          )
          VALUES (?, CURRENT_DATE, ?, ?, ?, ?, 'present', ?)
          `,
          [userId, shift, checkIn, now, expectedEnd, `Self check-in · ${shift} shift · 12 hours`]
        );
      }

      return res.json({
        success: true,
        message: `${shift === 'day' ? 'Day' : 'Night'} shift started. Expected duration: 12 hours.`,
        data: {
          shiftType: shift,
          checkIn,
          expectedEndAt: expectedEnd.toISOString(),
          targetHours: 12
        }
      });
    }

    if (!existing?.check_in) {
      return res.status(400).json({ success: false, message: "Check in first before checking out" });
    }

    if (existing.check_out) {
      return res.status(409).json({ success: false, message: "You are already checked out for this shift" });
    }

    const now = new Date();
    const start = existing.shift_start_at
      ? new Date(existing.shift_start_at)
      : new Date(`${String(existing.attendance_date).slice(0, 10)}T${existing.check_in}`);
    const actualHours = Math.round(hoursBetween(start, now) * 100) / 100;
    const checkout = now.toTimeString().slice(0, 8);

    await pool.execute(
      `
      UPDATE security_attendance
      SET
        check_out = ?,
        actual_end_at = ?,
        actual_hours = ?,
        remarks = ?
      WHERE id = ?
      `,
      [checkout, now, actualHours, `Self check-out · worked ${actualHours.toFixed(2)} hours`, existing.id]
    );

    return res.json({
      success: true,
      message: `Shift completed. Worked ${actualHours.toFixed(2)} hours out of 12.`,
      data: {
        checkOut: checkout,
        actualHours,
        targetHours: 12
      }
    });
  } catch (error) {
    console.error("Security attendance error:", error);
    return res.status(500).json({ success: false, message: "Unable to update security attendance" });
  }
}

export async function updateSecurityVisitorStatus(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const visitorId = Number(req.params.id);
    const status = String(req.body?.status || "").trim();

    if (!userId || !Number.isInteger(visitorId) || visitorId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid visitor request" });
    }

    if (!['inside','completed','rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid visitor status" });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        resident_id,
        visitor_name,
        status
      FROM visitors
      WHERE id = ?
      LIMIT 1
      `,
      [visitorId]
    );

    const visitor = (rows as any[])[0];
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    if (!['expected','inside'].includes(visitor.status)) {
      return res.status(409).json({
        success: false,
        message: `Visitor is already ${visitor.status}`
      });
    }

    const now = new Date();

    await pool.execute(
      `
      UPDATE visitors
      SET
        status = ?,
        check_in = CASE WHEN ? = 'inside' THEN CURRENT_TIMESTAMP ELSE check_in END,
        check_out = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE check_out END
      WHERE id = ?
      `,
      [status, status, status, visitorId]
    );

    if (visitor.resident_id) {
      const actionText =
        status === 'inside'
          ? 'has been checked in at security.'
          : status === 'completed'
            ? 'has completed the visit.'
            : 'was rejected by security.';

      await createUserNotification({
        userId: Number(visitor.resident_id),
        title: "Visitor status updated",
        message: `${visitor.visitor_name} ${actionText}`,
        type: "visitor"
      });
    }

    return res.json({
      success: true,
      message: `Visitor marked ${status}`,
      data: { updatedAt: now.toISOString() }
    });
  } catch (error) {
    console.error("Security visitor update error:", error);
    return res.status(500).json({ success: false, message: "Unable to update visitor status" });
  }
}
