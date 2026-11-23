import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";


function getUserId(
  req: any
) {
  const id =
    Number(
      req.user?.id
    );

  return Number.isInteger(id) &&
    id > 0
    ? id
    : 0;
}


/* =========================================================
   STAFF DASHBOARD
========================================================= */

export async function getStaffDashboard(
  req: Request,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    if (!userId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });

    }


    const [
      staffRows,
      attendanceRows,
      complaintRows,
      overdueRows
    ] =
      await Promise.all([

        /* -----------------------------------------------
           STAFF PROFILE
        ----------------------------------------------- */

        pool.execute(
          `
          SELECT
            s.id,
            s.employee_id,
            s.department,
            s.designation,
            s.joining_date,
            s.status,

            u.first_name,
            u.last_name,
            u.email,
            u.mobile,
            u.profile_image

          FROM staff s

          INNER JOIN users u
            ON u.id = s.user_id

          WHERE
            s.user_id = ?

          LIMIT 1
          `,
          [
            userId
          ]
        ),


        /* -----------------------------------------------
           TODAY ATTENDANCE
        ----------------------------------------------- */

        pool.execute(
          `
          SELECT
            id,
            attendance_date,
            status,
            check_in,
            check_out,
            notes

          FROM staff_attendance

          WHERE
            staff_id = (
              SELECT
                id
              FROM staff
              WHERE
                user_id = ?
              LIMIT 1
            )

            AND attendance_date =
              CURRENT_DATE

          LIMIT 1
          `,
          [
            userId
          ]
        ),


        /* -----------------------------------------------
           ASSIGNED COMPLAINTS
        ----------------------------------------------- */

        pool.execute(
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

          WHERE
            assigned_to = ?

            AND status NOT IN (
              'closed',
              'rejected'
            )

          ORDER BY
            CASE priority
              WHEN 'urgent' THEN 1
              WHEN 'high' THEN 2
              WHEN 'medium' THEN 3
              ELSE 4
            END,

            created_at DESC

          LIMIT 20
          `,
          [
            userId
          ]
        ),


        /* -----------------------------------------------
           SLA / ACTIVE WORK COUNT
        ----------------------------------------------- */

        pool.execute(
          `
          SELECT

            COUNT(*) AS total,

            SUM(
              CASE
                WHEN priority = 'urgent'
                THEN 1
                ELSE 0
              END
            ) AS urgent_count,

            SUM(
              CASE
                WHEN status = 'in_progress'
                THEN 1
                ELSE 0
              END
            ) AS in_progress_count,

            SUM(
              CASE
                WHEN status = 'resolved'
                THEN 1
                ELSE 0
              END
            ) AS resolved_count,

            SUM(
              CASE
                WHEN
                  sla_due_at IS NOT NULL
                  AND sla_due_at <
                    CURRENT_TIMESTAMP
                  AND status NOT IN (
                    'resolved',
                    'closed',
                    'rejected'
                  )
                THEN 1
                ELSE 0
              END
            ) AS breached_count

          FROM complaints

          WHERE
            assigned_to = ?
          `,
          [
            userId
          ]
        )

      ]);


    const staff =
      (staffRows as any[])[0] ||
      null;


    if (!staff) {

      return res.status(404).json({
        success: false,
        message:
          "Staff profile not found for this login account"
      });

    }


    const attendance =
      (attendanceRows as any[])[0] ||
      null;


    const complaints =
      (complaintRows as any[]).map(
        item => ({
          id:
            Number(item.id),

          complaintNumber:
            item.complaint_number,

          title:
            item.title,

          description:
            item.description,

          category:
            item.category,

          priority:
            item.priority,

          status:
            item.status,

          slaDueAt:
            item.sla_due_at,

          createdAt:
            item.created_at,

          updatedAt:
            item.updated_at
        })
      );


    const stats =
      (overdueRows as any[])[0] ||
      {};


    return res.json({

      success:
        true,

      data: {

        profile: {

          id:
            Number(
              staff.id
            ),

          employeeId:
            staff.employee_id,

          firstName:
            staff.first_name,

          lastName:
            staff.last_name,

          email:
            staff.email,

          mobile:
            staff.mobile,

          profileImage:
            staff.profile_image,

          department:
            staff.department,

          designation:
            staff.designation,

          joiningDate:
            staff.joining_date,

          status:
            staff.status

        },


        attendance: attendance
          ? {

              id:
                Number(
                  attendance.id
                ),

              date:
                attendance.attendance_date,

              status:
                attendance.status,

              checkIn:
                attendance.check_in,

              checkOut:
                attendance.check_out,

              notes:
                attendance.notes

            }

          : null,


        stats: {

          total:
            Number(
              stats.total ||
              0
            ),

          urgent:
            Number(
              stats.urgent_count ||
              0
            ),

          inProgress:
            Number(
              stats.in_progress_count ||
              0
            ),

          resolved:
            Number(
              stats.resolved_count ||
              0
            ),

          breached:
            Number(
              stats.breached_count ||
              0
            )

        },


        complaints

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Staff dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load staff dashboard"
    });

  }

}
