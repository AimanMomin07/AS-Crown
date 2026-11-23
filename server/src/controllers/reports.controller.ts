import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";


/* =========================================================
   ADMIN REPORTS
========================================================= */

export async function getAdminReports(
  req: Request,
  res: Response
) {

  try {

    const reportType =
      String(
        req.query.type ||
        "overview"
      ).trim();

    const from =
      String(
        req.query.from ||
        ""
      ).trim();

    const to =
      String(
        req.query.to ||
        ""
      ).trim();


    const validTypes = [
      "overview",
      "financial",
      "occupancy",
      "complaints",
      "visitors",
      "attendance"
    ];


    if (
      !validTypes.includes(
        reportType
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid report type"

      });

    }


    /* =====================================================
       FINANCIAL
    ===================================================== */

    if (
      reportType ===
      "financial"
    ) {

      const conditions:
        string[] = [
          "1 = 1"
        ];

      const params:
        any[] = [];


      if (
        from
      ) {

        conditions.push(
          "DATE(p.created_at) >= ?"
        );

        params.push(
          from
        );

      }


      if (
        to
      ) {

        conditions.push(
          "DATE(p.created_at) <= ?"
        );

        params.push(
          to
        );

      }


      const [
        rows
      ] =
        await pool.execute(
          `
          SELECT

            p.payment_number,

            p.amount,

            p.payment_method,

            p.payment_status,

            p.transaction_id,

            p.paid_at,

            p.created_at,

            mb.bill_number,

            mb.billing_month,

            f.flat_number,

            b.name AS building_name,

            u.first_name,

            u.last_name

          FROM payments p

          LEFT JOIN maintenance_bills mb
            ON mb.id =
              p.bill_id

          LEFT JOIN flats f
            ON f.id =
              mb.flat_id

          LEFT JOIN buildings b
            ON b.id =
              f.building_id

          LEFT JOIN users u
            ON u.id =
              p.user_id

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY
            p.created_at DESC
          `,
          params
        );


      return res.json({

        success:
          true,

        data: {

          type:
            reportType,

          rows

        }

      });

    }


    /* =====================================================
       OCCUPANCY
    ===================================================== */

    if (
      reportType ===
      "occupancy"
    ) {

      const [
        rows
      ] =
        await pool.execute(
          `
          SELECT

            b.name AS building_name,

            b.building_code,

            COUNT(
              f.id
            ) AS total_flats,

            SUM(
              CASE
                WHEN f.occupancy_status =
                  'occupied'
                THEN 1
                ELSE 0
              END
            ) AS occupied_flats,

            SUM(
              CASE
                WHEN f.occupancy_status =
                  'rented'
                THEN 1
                ELSE 0
              END
            ) AS rented_flats,

            SUM(
              CASE
                WHEN f.occupancy_status =
                  'vacant'
                THEN 1
                ELSE 0
              END
            ) AS vacant_flats,

            SUM(
              CASE
                WHEN f.occupancy_status =
                  'maintenance'
                THEN 1
                ELSE 0
              END
            ) AS maintenance_flats

          FROM buildings b

          LEFT JOIN flats f
            ON f.building_id =
              b.id

            AND f.status =
              'active'

          GROUP BY
            b.id,
            b.name,
            b.building_code

          ORDER BY
            b.name ASC
          `
        );


      return res.json({

        success:
          true,

        data: {

          type:
            reportType,

          rows

        }

      });

    }


    /* =====================================================
       COMPLAINTS
    ===================================================== */

    if (
      reportType ===
      "complaints"
    ) {

      const conditions:
        string[] = [
          "1 = 1"
        ];

      const params:
        any[] = [];


      if (
        from
      ) {

        conditions.push(
          "DATE(c.created_at) >= ?"
        );

        params.push(
          from
        );

      }


      if (
        to
      ) {

        conditions.push(
          "DATE(c.created_at) <= ?"
        );

        params.push(
          to
        );

      }


      const [
        rows
      ] =
        await pool.execute(
          `
          SELECT

            c.complaint_number,

            c.title,

            c.description,

            c.category,

            c.priority,

            c.status,

            c.created_at,

            c.updated_at,

            f.flat_number,

            b.name AS building_name,

            u.first_name,

            u.last_name

          FROM complaints c

          LEFT JOIN flats f
            ON f.id =
              c.flat_id

          LEFT JOIN buildings b
            ON b.id =
              f.building_id

          LEFT JOIN users u
            ON u.id =
              c.user_id

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY
            c.created_at DESC
          `,
          params
        );


      return res.json({

        success:
          true,

        data: {

          type:
            reportType,

          rows

        }

      });

    }


    /* =====================================================
       VISITORS
    ===================================================== */

    if (
      reportType ===
      "visitors"
    ) {

      const conditions:
        string[] = [
          "1 = 1"
        ];

      const params:
        any[] = [];


      if (
        from
      ) {

        conditions.push(
          "DATE(v.created_at) >= ?"
        );

        params.push(
          from
        );

      }


      if (
        to
      ) {

        conditions.push(
          "DATE(v.created_at) <= ?"
        );

        params.push(
          to
        );

      }


      const [
        rows
      ] =
        await pool.execute(
          `
          SELECT

            v.id,

            v.visitor_name,

            v.phone,

            v.purpose,

            v.vehicle_number,

            v.parking_access,

            v.parking_slot,

            v.visitor_type,

            v.expected_at,

            v.status,

            v.check_in,

            v.check_out,

            v.created_at,

            f.flat_number,

            b.name AS building_name,

            u.first_name AS resident_first_name,

            u.last_name AS resident_last_name

          FROM visitors v

          LEFT JOIN flats f
            ON f.id =
              v.flat_id

          LEFT JOIN buildings b
            ON b.id =
              f.building_id

          LEFT JOIN users u
            ON u.id =
              v.resident_id

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY
            v.created_at DESC
          `,
          params
        );


      return res.json({

        success:
          true,

        data: {

          type:
            reportType,

          rows

        }

      });

    }


    /* =====================================================
       ATTENDANCE
    ===================================================== */

    if (
      reportType ===
      "attendance"
    ) {

      const conditions:
        string[] = [
          "1 = 1"
        ];

      const params:
        any[] = [];


      if (
        from
      ) {

        conditions.push(
          "sa.attendance_date >= ?"
        );

        params.push(
          from
        );

      }


      if (
        to
      ) {

        conditions.push(
          "sa.attendance_date <= ?"
        );

        params.push(
          to
        );

      }


      const [
        rows
      ] =
        await pool.execute(
          `
          SELECT

            sa.attendance_date,

            sa.status,

            sa.check_in,

            sa.check_out,

            sa.notes,

            s.employee_id,

            s.department,

            s.designation,

            u.first_name,

            u.last_name

          FROM staff_attendance sa

          INNER JOIN staff s
            ON s.id =
              sa.staff_id

          LEFT JOIN users u
            ON u.id =
              s.user_id

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY

            sa.attendance_date DESC,

            u.first_name ASC
          `,
          params
        );


      return res.json({

        success:
          true,

        data: {

          type:
            reportType,

          rows

        }

      });

    }


    /* =====================================================
       OVERVIEW
    ===================================================== */

    const [

      financialRows,

      occupancyRows,

      complaintRows,

      visitorRows

    ] =
      await Promise.all([

        pool.execute(
          `
          SELECT

            COUNT(*) AS payment_count,

            COALESCE(
              SUM(
                CASE
                  WHEN payment_status =
                    'success'
                  THEN amount
                  ELSE 0
                END
              ),
              0
            ) AS collected

          FROM payments
          `
        ),

        pool.execute(
          `
          SELECT

            COUNT(*) AS total,

            SUM(
              CASE
                WHEN occupancy_status =
                  'occupied'
                THEN 1
                ELSE 0
              END
            ) AS occupied,

            SUM(
              CASE
                WHEN occupancy_status =
                  'vacant'
                THEN 1
                ELSE 0
              END
            ) AS vacant,

            SUM(
              CASE
                WHEN occupancy_status =
                  'rented'
                THEN 1
                ELSE 0
              END
            ) AS rented

          FROM flats

          WHERE
            status =
              'active'
          `
        ),

        pool.execute(
          `
          SELECT

            COUNT(*) AS total,

            SUM(
              CASE
                WHEN status =
                  'open'
                THEN 1
                ELSE 0
              END
            ) AS open_count,

            SUM(
              CASE
                WHEN status =
                  'in_progress'
                THEN 1
                ELSE 0
              END
            ) AS in_progress_count,

            SUM(
              CASE
                WHEN status =
                  'resolved'
                THEN 1
                ELSE 0
              END
            ) AS resolved_count

          FROM complaints
          `
        ),

        pool.execute(
          `
          SELECT

            COUNT(*) AS total,

            SUM(
              CASE
                WHEN status =
                  'inside'
                THEN 1
                ELSE 0
              END
            ) AS inside_count

          FROM visitors

          WHERE
            DATE(created_at) =
              CURRENT_DATE
          `
        )

      ]);


    return res.json({

      success:
        true,

      data: {

        type:
          "overview",

        financial:
          (financialRows as any[])[0],

        occupancy:
          (occupancyRows as any[])[0],

        complaints:
          (complaintRows as any[])[0],

        visitors:
          (visitorRows as any[])[0]

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Admin reports error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to generate report"

    });

  }

}