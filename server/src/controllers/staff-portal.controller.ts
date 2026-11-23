import { Request, Response } from "express";
import pool from "../config/database.js";

function getUserId(req: any) {
  const id = Number(req.user?.id);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

async function ensureStaffProfile(userId: number) {
  const [rows] = await pool.execute(
    `SELECT * FROM staff WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  const existing = (rows as any[])[0];
  if (existing) return existing;

  const [userRows] = await pool.execute(
    `SELECT first_name, last_name FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  const user = (userRows as any[])[0];

  const employeeId = `STF-${userId}`;

  try {
    const [result] = await pool.execute(
      `
      INSERT INTO staff
      (
        user_id,
        employee_id,
        department,
        designation,
        joining_date,
        status
      )
      VALUES
      (?, ?, 'General', 'Staff', CURRENT_DATE, 'active')
      `,
      [userId, employeeId]
    );

    const [createdRows] = await pool.execute(
      `SELECT * FROM staff WHERE id = ? LIMIT 1`,
      [Number((result as any).insertId)]
    );

    return (createdRows as any[])[0] || {
      id: Number((result as any).insertId),
      user_id: userId,
      employee_id: employeeId,
      department: "General",
      designation: "Staff",
      joining_date: null,
      status: "active",
      first_name: user?.first_name || null,
      last_name: user?.last_name || null
    };
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      const [retryRows] = await pool.execute(
        `SELECT * FROM staff WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      return (retryRows as any[])[0] || null;
    }
    throw error;
  }
}

function mapStaff(staff: any) {
  return {
    id: Number(staff.id),
    employeeId: staff.employee_id,
    department: staff.department,
    designation: staff.designation,
    joiningDate: staff.joining_date,
    status: staff.status,
    firstName: staff.first_name || null,
    lastName: staff.last_name || null,
    email: staff.email || null,
    mobile: staff.mobile || null,
    profileImage: staff.profile_image || null
  };
}

export async function getStaffPortal(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const staff = await ensureStaffProfile(userId);
    if (!staff) {
      return res.status(500).json({ success: false, message: "Unable to create or find your staff profile" });
    }

    const staffId = Number(staff.id);

    const [profileRows] = await pool.execute(
      `
      SELECT s.*, u.first_name, u.last_name, u.email, u.mobile, u.profile_image
      FROM staff s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
      LIMIT 1
      `,
      [staffId]
    );

    const [todayRows] = await pool.execute(
      `
      SELECT id, attendance_date, check_in, check_out, status, remarks
      FROM staff_attendance
      WHERE staff_id = ? AND attendance_date = CURRENT_DATE
      LIMIT 1
      `,
      [staffId]
    );

    const [historyRows] = await pool.execute(
      `
      SELECT attendance_date, check_in, check_out, status, remarks
      FROM staff_attendance
      WHERE staff_id = ?
      ORDER BY attendance_date DESC
      LIMIT 7
      `,
      [staffId]
    );

    const [workRows] = await pool.execute(
      `
      SELECT
        id,
        complaint_number,
        title,
        description,
        category,
        priority,
        status,
        sla_due_at,
        created_at,
        updated_at
      FROM complaints
      WHERE assigned_to = ?
        AND status NOT IN ('closed', 'rejected')
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT 30
      `,
      [userId]
    );

    const [statsRows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS assigned,
        SUM(status = 'open') AS open_count,
        SUM(status = 'in_progress') AS in_progress_count,
        SUM(status = 'resolved') AS resolved_count,
        SUM(priority = 'urgent' AND status NOT IN ('resolved','closed','rejected')) AS urgent_count,
        SUM(
          sla_due_at IS NOT NULL
          AND sla_due_at < CURRENT_TIMESTAMP
          AND status NOT IN ('resolved','closed','rejected')
        ) AS breached_count
      FROM complaints
      WHERE assigned_to = ?
      `,
      [userId]
    );

    const [announcementRows] = await pool.execute(
      `
      SELECT id, title, content, category, priority, publish_at, created_at
      FROM announcements
      WHERE status = 'published'
      ORDER BY publish_at DESC, created_at DESC
      LIMIT 6
      `
    );

    return res.json({
      success: true,
      data: {
        profile: mapStaff((profileRows as any[])[0] || staff),
        attendance: (todayRows as any[])[0] || null,
        attendanceHistory: historyRows,
        stats: (statsRows as any[])[0] || {},
        work: workRows,
        announcements: announcementRows
      }
    });
  } catch (error) {
    console.error("Staff portal error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load staff portal"
    });
  }
}

export async function markStaffAttendance(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const staff = await ensureStaffProfile(userId);
    const staffId = Number(staff?.id || 0);
    if (!staffId) {
      return res.status(500).json({ success: false, message: "Staff profile could not be created" });
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

    const [todayRows] = await pool.execute(
      `
      SELECT id, check_in, check_out, status
      FROM staff_attendance
      WHERE staff_id = ? AND attendance_date = CURRENT_DATE
      LIMIT 1
      `,
      [staffId]
    );
    const existing = (todayRows as any[])[0];

    if (action === "check_in") {
      if (existing?.check_in) {
        return res.status(409).json({ success: false, message: "You are already checked in today" });
      }

      const now = new Date();
      const time = now.toTimeString().slice(0, 8);
      const status = now.getHours() >= 10 ? "late" : "present";

      if (existing) {
        await pool.execute(
          `
          UPDATE staff_attendance
          SET check_in = ?, status = ?, remarks = ?
          WHERE id = ?
          `,
          [time, status, "Self checked in", existing.id]
        );
      } else {
        await pool.execute(
          `
          INSERT INTO staff_attendance
          (staff_id, attendance_date, check_in, status, remarks)
          VALUES (?, CURRENT_DATE, ?, ?, ?)
          `,
          [staffId, time, status, "Self checked in"]
        );
      }

      return res.json({
        success: true,
        message: "Check-in recorded successfully",
        data: { time, status }
      });
    }

    if (!existing?.check_in) {
      return res.status(400).json({
        success: false,
        message: "Check in first before checking out"
      });
    }

    if (existing.check_out) {
      return res.status(409).json({
        success: false,
        message: "You are already checked out today"
      });
    }

    const time = new Date().toTimeString().slice(0, 8);
    await pool.execute(
      `UPDATE staff_attendance SET check_out = ?, remarks = ? WHERE id = ?`,
      [time, "Self checked out", existing.id]
    );

    return res.json({
      success: true,
      message: "Check-out recorded successfully",
      data: { time }
    });
  } catch (error) {
    console.error("Staff attendance error:", error);
    return res.status(500).json({ success: false, message: "Unable to update attendance" });
  }
}

export async function updateOwnComplaint(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const status = String(req.body?.status || "").trim();

    if (!userId || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!['in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid work status" });
    }

    const [rows] = await pool.execute(
      `SELECT id FROM complaints WHERE id = ? AND assigned_to = ? LIMIT 1`,
      [id, userId]
    );

    if (!(rows as any[]).length) {
      return res.status(404).json({ success: false, message: "This work is not assigned to you" });
    }

    await pool.execute(
      `
      UPDATE complaints
      SET
        status = ?,
        resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND assigned_to = ?
      `,
      [status, status, id, userId]
    );

    return res.json({
      success: true,
      message: `Work marked ${status === 'resolved' ? 'resolved' : 'in progress'}`
    });
  } catch (error) {
    console.error("Staff work update error:", error);
    return res.status(500).json({ success: false, message: "Unable to update assigned work" });
  }
}
