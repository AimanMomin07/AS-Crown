import {
  Request,
  Response
} from "express";

import pool
  from "../config/database.js";


export async function getDashboardStats(
  _req: Request,
  res: Response
) {

  try {

    /* =====================================================
       USERS
    ===================================================== */

    const [
      userRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_users,

        SUM(
          CASE
            WHEN status = 'active'
            THEN 1
            ELSE 0
          END
        ) AS active_users,

        SUM(
          CASE
            WHEN status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pending_users,

        SUM(
          CASE
            WHEN status = 'blocked'
            THEN 1
            ELSE 0
          END
        ) AS blocked_users

      FROM users
    `);


    /* =====================================================
       RESIDENTS
    ===================================================== */

    const [
      residentRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_residents

      FROM users u

      INNER JOIN roles r
        ON r.id = u.role_id

      WHERE r.name = 'resident'
    `);


    /* =====================================================
       BUILDINGS
    ===================================================== */

    const [
      buildingRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_buildings

      FROM buildings

      WHERE status = 'active'
    `);


    /* =====================================================
       FLATS
    ===================================================== */

    const [
      flatRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_flats,

        SUM(
          CASE
            WHEN status = 'active'
            THEN 1
            ELSE 0
          END
        ) AS active_flats,

        SUM(
          CASE
            WHEN occupancy_status = 'occupied'
            THEN 1
            ELSE 0
          END
        ) AS occupied_flats,

        SUM(
          CASE
            WHEN occupancy_status = 'vacant'
            THEN 1
            ELSE 0
          END
        ) AS vacant_flats,

        SUM(
          CASE
            WHEN occupancy_status = 'rented'
            THEN 1
            ELSE 0
          END
        ) AS rented_flats,

        SUM(
          CASE
            WHEN occupancy_status = 'maintenance'
            THEN 1
            ELSE 0
          END
        ) AS maintenance_flats

      FROM flats
    `);


    /* =====================================================
       COMPLAINTS
    ===================================================== */

    const [
      complaintRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_complaints,

        SUM(
          CASE
            WHEN status = 'open'
            THEN 1
            ELSE 0
          END
        ) AS open_complaints,

        SUM(
          CASE
            WHEN status = 'in_progress'
            THEN 1
            ELSE 0
          END
        ) AS in_progress_complaints,

        SUM(
          CASE
            WHEN status = 'resolved'
            THEN 1
            ELSE 0
          END
        ) AS resolved_complaints,

        SUM(
          CASE
            WHEN status = 'closed'
            THEN 1
            ELSE 0
          END
        ) AS closed_complaints

      FROM complaints
    `);


    /* =====================================================
       MAINTENANCE BILLS
    ===================================================== */

    const [
      billRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_bills,

        COALESCE(
          SUM(total_amount),
          0
        ) AS total_billed,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'paid'
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS total_paid,

        COALESCE(
          SUM(
            CASE
              WHEN status IN (
                'pending',
                'partially_paid',
                'overdue'
              )
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS total_pending

      FROM maintenance_bills
    `);


    /* =====================================================
       PAYMENTS
    ===================================================== */

    const [
      paymentRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_payments,

        COALESCE(
          SUM(
            CASE
              WHEN payment_status = 'success'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_payment_amount,

        COUNT(
          CASE
            WHEN payment_status = 'success'
            THEN 1
          END
        ) AS successful_payments,

        COUNT(
          CASE
            WHEN payment_status = 'failed'
            THEN 1
          END
        ) AS failed_payments

      FROM payments
    `);


    /* =====================================================
       VISITORS
    ===================================================== */

    const [
      visitorRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_visitors,

        SUM(
          CASE
            WHEN status = 'inside'
            THEN 1
            ELSE 0
          END
        ) AS visitors_inside,

        SUM(
          CASE
            WHEN status = 'expected'
            THEN 1
            ELSE 0
          END
        ) AS visitors_expected

      FROM visitors
    `);


    /* =====================================================
       STAFF
    ===================================================== */

    const [
      staffRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_staff

      FROM staff

      WHERE status = 'active'
    `);


    /* =====================================================
       ANNOUNCEMENTS
    ===================================================== */

    const [
      announcementRows
    ] = await pool.execute(`
      SELECT

        COUNT(*) AS total_announcements,

        SUM(
          CASE
            WHEN status = 'published'
            THEN 1
            ELSE 0
          END
        ) AS published_announcements

      FROM announcements
    `);


    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({

      success: true,

      data: {

        users:
          (userRows as any[])[0],

        residents:
          (residentRows as any[])[0],

        buildings:
          (buildingRows as any[])[0],

        flats:
          (flatRows as any[])[0],

        complaints:
          (complaintRows as any[])[0],

        bills:
          (billRows as any[])[0],

        payments:
          (paymentRows as any[])[0],

        visitors:
          (visitorRows as any[])[0],

        staff:
          (staffRows as any[])[0],

        announcements:
          (announcementRows as any[])[0]

      }

    });

  } catch (error) {

    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to load admin dashboard statistics"

    });

  }

}