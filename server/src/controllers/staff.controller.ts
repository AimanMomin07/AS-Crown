import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";
import { ensureRoleCommunityMembership } from "../utils/community-groups.js";


/* =========================================================
   GET STAFF
========================================================= */
/* removeStaff exported later in file */
export async function getStaff(
  req: Request,
  res: Response
) {

  try {

    const search =
      String(
        req.query.search || ""
      ).trim();


    const conditions: string[] = [
      "s.status = 'active'"
    ];


    const params: any[] = [];


    if (search) {

      conditions.push(`
        (
          s.employee_id LIKE ?
          OR s.department LIKE ?
          OR s.designation LIKE ?
          OR u.first_name LIKE ?
          OR u.last_name LIKE ?
          OR u.mobile LIKE ?
        )
      `);


      const value =
        `%${search}%`;


      params.push(
        value,
        value,
        value,
        value,
        value,
        value
      );

    }


    const [
      rows
    ] = await pool.query(
      `
      SELECT
        s.*,

        u.first_name,
        u.last_name,
        u.email,
        u.mobile,
        u.phone,
        u.profile_image

      FROM staff s

      LEFT JOIN users u
        ON u.id = s.user_id

      WHERE ${conditions.join(
        " AND "
      )}

      ORDER BY
        s.created_at DESC
      `,
      params
    );


    return res.json({

      success: true,

      data: {
        staff: rows
      }

    });

  } catch (error) {

    console.error(
      "Get staff error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to retrieve staff"

    });

  }

}


/* =========================================================
   CREATE STAFF
========================================================= */

export async function createStaff(
  req: Request,
  res: Response
) {

  try {

    const body =
      req.body ?? {};


    if (!body.employeeId) {

      return res.status(400).json({

        success: false,

        message:
          "Employee ID is required"

      });

    }


    const [
      result
    ] = await pool.execute(
      `
      INSERT INTO staff
      (
        user_id,
        employee_id,
        department,
        designation,
        joining_date,
        salary,
        emergency_contact_name,
        emergency_contact_phone,
        status
      )

      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        body.userId ||
          null,

        body.employeeId,

        body.department ||
          null,

        body.designation ||
          null,

        body.joiningDate ||
          null,

        body.salary ||
          null,

        body.emergencyContactName ||
          null,

        body.emergencyContactPhone ||
          null
      ]
    );

    if (body.userId) {
      await ensureRoleCommunityMembership(
        Number(body.userId),
        "staff"
      );
    }


    return res.status(201).json({

      success: true,

      message:
        "Staff member created successfully",

      data: {
        id:
          (result as any)
            .insertId
      }

    });

  } catch (
    error: any
  ) {

    console.error(
      "Create staff error:",
      error
    );


    if (
      error?.code ===
      "ER_DUP_ENTRY"
    ) {

      return res.status(409).json({

        success: false,

        message:
          "Employee ID already exists"

      });

    }


    return res.status(500).json({

      success: false,

      message:
        "Unable to create staff member"

    });

  }

}


/* =========================================================
   GET ATTENDANCE
========================================================= */

export async function getAttendance(
  req: Request,
  res: Response
) {

  try {

    const date =
      String(
        req.query.date || ""
      ).trim();


    const staffId =
      String(
        req.query.staffId || ""
      ).trim();


    const conditions: string[] = [
      "1=1"
    ];


    const params: any[] = [];


    if (date) {

      conditions.push(
        "sa.attendance_date = ?"
      );

      params.push(
        date
      );

    }


    if (staffId) {

      conditions.push(
        "sa.staff_id = ?"
      );

      params.push(
        Number(staffId)
      );

    }


    const [
      rows
    ] = await pool.query(
      `
      SELECT

        sa.*,

        s.employee_id,
        s.department,
        s.designation,

        u.first_name,
        u.last_name

      FROM staff_attendance sa

      INNER JOIN staff s
        ON s.id = sa.staff_id

      LEFT JOIN users u
        ON u.id = s.user_id

      WHERE ${conditions.join(
        " AND "
      )}

      ORDER BY
        sa.attendance_date DESC,
        sa.staff_id ASC
      `,
      params
    );


    return res.json({

      success: true,

      data: {
        attendance: rows
      }

    });

  } catch (error) {

    console.error(
      "Get attendance error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to retrieve attendance"

    });

  }

}

export async function removeStaff(
  req: Request,
  res: Response
) {

  try {

    const staffId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        staffId
      ) ||
      staffId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid staff ID"

      });

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          employee_id,
          user_id,
          status
        FROM staff
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          staffId
        ]
      );


    const staff =
      rows as any[];


    if (
      staff.length === 0
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Staff member not found"

      });

    }


    await pool.execute(
      `
      UPDATE staff
      SET
        status = 'inactive',
        updated_at =
          CURRENT_TIMESTAMP
      WHERE
        id = ?
      `,
      [
        staffId
      ]
    );


    /*
     * Do NOT delete the linked user automatically.
     * The employee's historical records should remain.
     *
     * If the employee has a linked login account,
     * simply disable that account.
     */

    if (
      staff[0].user_id
    ) {

      await pool.execute(
        `
        UPDATE users
        SET
          status = 'inactive',
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          id = ?
        `,
        [
          staff[0].user_id
        ]
      );

    }


    return res.json({

      success:
        true,

      message:
        "Staff member removed successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Remove staff error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to remove staff member"

    });

  }

}

/* =========================================================
   UPSERT ATTENDANCE
========================================================= */

export async function upsertAttendance(
  req: Request,
  res: Response
) {

  try {

    const body =
      req.body ?? {};


    const staffId =
      Number(
        body.staffId
      );


    const attendanceDate =
      body.attendanceDate;


    const status =
      body.status ||
      "present";


    const allowed = [
      "present",
      "absent",
      "late",
      "half_day",
      "leave"
    ];


    if (
      !Number.isInteger(
        staffId
      ) ||
      !attendanceDate ||
      !allowed.includes(
        status
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Staff, date and valid attendance status are required"

      });

    }


    await pool.execute(
      `
      INSERT INTO staff_attendance
      (
        staff_id,
        attendance_date,
        check_in,
        check_out,
        status,
        remarks
      )

      VALUES
      (?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE

        check_in =
          VALUES(check_in),

        check_out =
          VALUES(check_out),

        status =
          VALUES(status),

        remarks =
          VALUES(remarks)
      `,
      [
        staffId,

        attendanceDate,

        body.checkIn ||
          null,

        body.checkOut ||
          null,

        status,

        body.remarks ||
          null
      ]
    );


    return res.json({

      success: true,

      message:
        "Attendance saved successfully"

    });

  } catch (error) {

    console.error(
      "Upsert attendance error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to save attendance"

    });

  }

}