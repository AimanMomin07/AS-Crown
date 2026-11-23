import { Request, Response } from "express";
import pool from "../config/database.js";

/* =========================================================
   ADMIN ANALYTICS 2.0
========================================================= */

export async function getAdminAnalytics(
  _req: Request,
  res: Response
) {
  try {
    const [
      occupancyRows,
      financeRows,
      complaintRows,
      visitorRows,
      staffRows,
      collectionRows,
      buildingRows,
      overdueRows,
      auditRows
    ] = await Promise.all([
      /* ===================================================
         OCCUPANCY
      =================================================== */
      pool.query(`
        SELECT
          COUNT(*) AS total_flats,

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
        WHERE status = 'active'
      `),

      /* ===================================================
         CURRENT MONTH FINANCE
      =================================================== */
      pool.query(`
        SELECT
          COALESCE(
            SUM(mb.total_amount),
            0
          ) AS billed_this_month,

          COALESCE(
            SUM(
              CASE
                WHEN mb.status = 'paid'
                THEN mb.total_amount
                ELSE 0
              END
            ),
            0
          ) AS paid_bills,

          COALESCE(
            SUM(
              CASE
                WHEN mb.status IN (
                  'pending',
                  'partially_paid',
                  'overdue'
                )
                THEN GREATEST(
                  mb.total_amount -
                  COALESCE(p.paid_amount, 0),
                  0
                )
                ELSE 0
              END
            ),
            0
          ) AS outstanding_bills

        FROM maintenance_bills mb

        LEFT JOIN (
          SELECT
            bill_id,
            SUM(
              CASE
                WHEN payment_status = 'success'
                THEN amount
                ELSE 0
              END
            ) AS paid_amount
          FROM payments
          GROUP BY bill_id
        ) p
          ON p.bill_id = mb.id

        WHERE
          YEAR(mb.billing_month) =
            YEAR(CURRENT_DATE)

          AND MONTH(mb.billing_month) =
            MONTH(CURRENT_DATE)
      `),

      /* ===================================================
         COMPLAINTS
      =================================================== */
      pool.query(`
        SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'open'
              THEN 1
              ELSE 0
            END
          ) AS open_count,

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
              WHEN status = 'closed'
              THEN 1
              ELSE 0
            END
          ) AS closed_count,

          SUM(
            CASE
              WHEN status = 'rejected'
              THEN 1
              ELSE 0
            END
          ) AS rejected_count

        FROM complaints
      `),

      /* ===================================================
         VISITORS TODAY
      =================================================== */
      pool.query(`
        SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'expected'
              THEN 1
              ELSE 0
            END
          ) AS expected_count,

          SUM(
            CASE
              WHEN status = 'inside'
              THEN 1
              ELSE 0
            END
          ) AS inside_count,

          SUM(
            CASE
              WHEN status = 'completed'
              THEN 1
              ELSE 0
            END
          ) AS completed_count,

          SUM(
            CASE
              WHEN status = 'rejected'
              THEN 1
              ELSE 0
            END
          ) AS rejected_count

        FROM visitors
        WHERE DATE(created_at) = CURRENT_DATE
      `),

      /* ===================================================
         STAFF ATTENDANCE TODAY
      =================================================== */
      pool.query(`
        SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'present'
              THEN 1
              ELSE 0
            END
          ) AS present_count,

          SUM(
            CASE
              WHEN status = 'absent'
              THEN 1
              ELSE 0
            END
          ) AS absent_count,

          SUM(
            CASE
              WHEN status = 'late'
              THEN 1
              ELSE 0
            END
          ) AS late_count,

          SUM(
            CASE
              WHEN status = 'half_day'
              THEN 1
              ELSE 0
            END
          ) AS half_day_count,

          SUM(
            CASE
              WHEN status = 'leave'
              THEN 1
              ELSE 0
            END
          ) AS leave_count

        FROM staff_attendance
        WHERE attendance_date = CURRENT_DATE
      `),

      /* ===================================================
         COLLECTION LAST 6 MONTHS
      =================================================== */
      pool.query(`
        SELECT
          DATE_FORMAT(
            p.created_at,
            '%Y-%m'
          ) AS month,

          COALESCE(
            SUM(p.amount),
            0
          ) AS total

        FROM payments p

        WHERE
          p.payment_status = 'success'

          AND p.created_at >=
            DATE_SUB(
              DATE_FORMAT(
                CURRENT_DATE,
                '%Y-%m-01'
              ),
              INTERVAL 5 MONTH
            )

        GROUP BY
          DATE_FORMAT(
            p.created_at,
            '%Y-%m'
          )

        ORDER BY
          month ASC
      `),

      /* ===================================================
         BUILDING OCCUPANCY
      =================================================== */
      pool.query(`
        SELECT
          b.id,
          b.name AS building_name,

          COUNT(f.id) AS total_flats,

          SUM(
            CASE
              WHEN f.occupancy_status = 'occupied'
              THEN 1
              ELSE 0
            END
          ) AS occupied_flats,

          SUM(
            CASE
              WHEN f.occupancy_status = 'vacant'
              THEN 1
              ELSE 0
            END
          ) AS vacant_flats,

          SUM(
            CASE
              WHEN f.occupancy_status = 'rented'
              THEN 1
              ELSE 0
            END
          ) AS rented_flats,

          SUM(
            CASE
              WHEN f.occupancy_status = 'maintenance'
              THEN 1
              ELSE 0
            END
          ) AS maintenance_flats

        FROM buildings b

        LEFT JOIN flats f
          ON f.building_id = b.id
         AND f.status = 'active'

        GROUP BY
          b.id,
          b.name

        ORDER BY
          b.name ASC
      `),

      /* ===================================================
         OVERDUE BILLS
      =================================================== */
      pool.query(`
        SELECT
          COUNT(*) AS overdue_count,

          COALESCE(
            SUM(
              GREATEST(
                mb.total_amount -
                COALESCE(p.paid_amount, 0),
                0
              )
            ),
            0
          ) AS overdue_amount

        FROM maintenance_bills mb

        LEFT JOIN (
          SELECT
            bill_id,
            SUM(
              CASE
                WHEN payment_status = 'success'
                THEN amount
                ELSE 0
              END
            ) AS paid_amount
          FROM payments
          GROUP BY bill_id
        ) p
          ON p.bill_id = mb.id

        WHERE
          mb.due_date < CURRENT_DATE

          AND mb.status IN (
            'pending',
            'partially_paid',
            'overdue'
          )
      `),

      /* ===================================================
         RECENT AUDIT ACTIVITY
      =================================================== */
      pool.query(`
        SELECT
          a.id,
          a.action,
          a.entity_type,
          a.entity_id,
          a.created_at,

          CONCAT_WS(
            ' ',
            u.first_name,
            u.last_name
          ) AS user_name

        FROM audit_logs a

        LEFT JOIN users u
          ON u.id = a.user_id

        ORDER BY
          a.created_at DESC,
          a.id DESC

        LIMIT 8
      `)
    ]);

    const occupancy =
      (occupancyRows as any[])[0] || {};

    const finance =
      (financeRows as any[])[0] || {};

    const complaints =
      (complaintRows as any[])[0] || {};

    const visitors =
      (visitorRows as any[])[0] || {};

    const staff =
      (staffRows as any[])[0] || {};

    const overdue =
      (overdueRows as any[])[0] || {};

    const totalFlats =
      Number(
        occupancy.total_flats || 0
      );

    const occupiedFlats =
      Number(
        occupancy.occupied_flats || 0
      );

    const rentedFlats =
      Number(
        occupancy.rented_flats || 0
      );

    const occupancyPercentage =
      totalFlats > 0
        ? Number(
            (
              (
                occupiedFlats +
                rentedFlats
              ) /
              totalFlats
            ) *
            100
          ).toFixed(1)
        : 0;

    const monthlyCollection =
      (collectionRows as any[]).map(
        item => ({
          month:
            String(
              item.month
            ),
          total:
            Number(
              item.total || 0
            )
        })
      );

    const buildings =
      (buildingRows as any[]).map(
        item => {
          const total =
            Number(
              item.total_flats || 0
            );

          const occupied =
            Number(
              item.occupied_flats || 0
            );

          const rented =
            Number(
              item.rented_flats || 0
            );

          return {
            id:
              Number(item.id),

            name:
              String(
                item.building_name ||
                "Unnamed Building"
              ),

            totalFlats:
              total,

            occupied:
              occupied,

            vacant:
              Number(
                item.vacant_flats || 0
              ),

            rented:
              rented,

            maintenance:
              Number(
                item.maintenance_flats || 0
              ),

            occupancyPercentage:
              total > 0
                ? Number(
                    (
                      (
                        occupied +
                        rented
                      ) /
                      total
                    ) *
                    100
                  ).toFixed(1)
                : 0
          };
        }
      );

    return res.json({
      success: true,

      data: {
        occupancy: {
          totalFlats,

          occupied:
            occupiedFlats,

          vacant:
            Number(
              occupancy.vacant_flats || 0
            ),

          rented:
            rentedFlats,

          maintenance:
            Number(
              occupancy.maintenance_flats || 0
            ),

          percentage:
            occupancyPercentage
        },

        finance: {
          billedThisMonth:
            Number(
              finance.billed_this_month || 0
            ),

          collectedThisMonth:
            Number(
              finance.paid_bills || 0
            ),

          outstanding:
            Number(
              finance.outstanding_bills || 0
            ),

          overdueCount:
            Number(
              overdue.overdue_count || 0
            ),

          overdueAmount:
            Number(
              overdue.overdue_amount || 0
            )
        },

        complaints: {
          total:
            Number(
              complaints.total || 0
            ),

          open:
            Number(
              complaints.open_count || 0
            ),

          inProgress:
            Number(
              complaints.in_progress_count || 0
            ),

          resolved:
            Number(
              complaints.resolved_count || 0
            ),

          closed:
            Number(
              complaints.closed_count || 0
            ),

          rejected:
            Number(
              complaints.rejected_count || 0
            )
        },

        visitors: {
          total:
            Number(
              visitors.total || 0
            ),

          expected:
            Number(
              visitors.expected_count || 0
            ),

          inside:
            Number(
              visitors.inside_count || 0
            ),

          completed:
            Number(
              visitors.completed_count || 0
            ),

          rejected:
            Number(
              visitors.rejected_count || 0
            )
        },

        staffAttendance: {
          total:
            Number(
              staff.total || 0
            ),

          present:
            Number(
              staff.present_count || 0
            ),

          absent:
            Number(
              staff.absent_count || 0
            ),

          late:
            Number(
              staff.late_count || 0
            ),

          halfDay:
            Number(
              staff.half_day_count || 0
            ),

          leave:
            Number(
              staff.leave_count || 0
            )
        },

        monthlyCollection,

        buildings,

        recentActivity:
          (auditRows as any[]).map(
            item => ({
              id:
                Number(item.id),
              action:
                String(item.action || ""),
              entityType:
                String(item.entity_type || ""),
              entityId:
                item.entity_id == null
                  ? null
                  : Number(item.entity_id),
              createdAt:
                String(item.created_at || ""),
              userName:
                item.user_name
                  ? String(item.user_name)
                  : "System"
            })
          )
      }
    });
  } catch (error) {
    console.error(
      "Admin analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load admin analytics"
    });
  }
}
