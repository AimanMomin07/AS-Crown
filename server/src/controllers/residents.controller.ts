import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";


interface ResidentRequest
  extends Request {
  user?: {
    id?: number | string;
    role?: string;
  };
}


/* =========================================================
   HELPER
========================================================= */

function getUserId(
  req: ResidentRequest
): number {

  return Number(
    req.user?.id
  );

}


/* =========================================================
   DASHBOARD
========================================================= */

export async function getResidentDashboard(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });

    }


    /* -----------------------------------------------------
       PROFILE
    ----------------------------------------------------- */

    const [
      profileRows
    ] =
      await pool.execute(
        `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.mobile,
          u.phone,
          u.profile_image,
          u.status,
          u.created_at,
          r.name AS role_name
        FROM users u

        INNER JOIN roles r
          ON r.id = u.role_id

        WHERE
          u.id = ?

        LIMIT 1
        `,
        [userId]
      );


    const profile =
      (profileRows as any[])[0];


    if (
      !profile
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Resident profile not found"
      });

    }


    /* -----------------------------------------------------
       HOME
    ----------------------------------------------------- */

    const [
      homeRows
    ] =
      await pool.execute(
        `
        SELECT

          f.id AS flat_id,
          f.flat_number,
          f.floor_number,
          f.flat_type,
          f.occupancy_status,

          f.owner_id,
          f.tenant_id,

          b.id AS building_id,
          b.name AS building_name,
          b.building_code,

          mp.ownership_type,
          mp.lease_start_date,
          mp.lease_end_date

        FROM flats f

        INNER JOIN buildings b
          ON b.id = f.building_id

        LEFT JOIN member_profiles mp
          ON mp.user_id = ?

        WHERE
          (
            f.owner_id = ?
            OR f.tenant_id = ?
          )

          AND f.status = 'active'

        LIMIT 1
        `,
        [
          userId,
          userId,
          userId
        ]
      );


    const home =
      (homeRows as any[])[0] ||
      null;


    /* -----------------------------------------------------
       OUTSTANDING BILL
    ----------------------------------------------------- */

    let currentBill:
      any = null;

    let outstandingAmount =
      0;


    if (
      home?.flat_id
    ) {

      const [
        billRows
      ] =
        await pool.execute(
          `
          SELECT

            mb.id,
            mb.bill_number,
            mb.billing_month,
            mb.maintenance_amount,
            mb.electricity_amount,
            mb.water_amount,
            mb.parking_amount,
            mb.penalty_amount,
            mb.other_amount,
            mb.total_amount,
            mb.due_date,
            mb.status

          FROM maintenance_bills mb

          WHERE
            mb.flat_id = ?

            AND mb.status IN
            (
              'pending',
              'partially_paid',
              'overdue'
            )

          ORDER BY
            mb.billing_month DESC,
            mb.id DESC

          LIMIT 1
          `,
          [
            home.flat_id
          ]
        );


      currentBill =
        (billRows as any[])[0] ||
        null;


      if (
        currentBill
      ) {

        outstandingAmount =
          Number(
            currentBill.total_amount ||
            0
          );

      }

    }


    /* -----------------------------------------------------
       RECENT PAYMENTS
    ----------------------------------------------------- */

    const [
      paymentRows
    ] =
      await pool.execute(
        `
        SELECT

          p.id,
          p.amount,
          p.payment_method,
          p.payment_status,
          p.transaction_id,
          p.created_at

        FROM payments p

        WHERE
          p.user_id = ?

        ORDER BY
          p.created_at DESC

        LIMIT 5
        `,
        [
          userId
        ]
      );


    const recentPayments =
      (
        paymentRows as any[]
      ).map(
        payment => ({

          id:
            payment.id,

          amount:
            Number(
              payment.amount
            ),

          paymentMethod:
            payment.payment_method,

          paymentStatus:
            payment.payment_status,

          transactionId:
            payment.transaction_id,

          createdAt:
            payment.created_at

        })
      );


    const [
      paidRows
    ] =
      await pool.execute(
        `
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS total_paid

        FROM payments

        WHERE
          user_id = ?

          AND payment_status =
            'success'
        `,
        [
          userId
        ]
      );


    const totalPaid =
      Number(
        (paidRows as any[])[0]
          ?.total_paid ||
        0
      );


    /* -----------------------------------------------------
       VISITORS
    ----------------------------------------------------- */

    const [
      visitorRows
    ] =
      await pool.execute(
        `
        SELECT

          COUNT(*) AS today_count,

          SUM(
            CASE
              WHEN status = 'inside'
              THEN 1
              ELSE 0
            END
          ) AS inside_count

        FROM visitors

        WHERE
          resident_id = ?

          AND DATE(
            created_at
          ) = CURRENT_DATE
        `,
        [
          userId
        ]
      );


    const visitorStats =
      (visitorRows as any[])[0] ||
      {};


    /* -----------------------------------------------------
       COMPLAINTS
    ----------------------------------------------------- */

    const [
      complaintRows
    ] =
      await pool.execute(
        `
        SELECT

          SUM(
            CASE
              WHEN status = 'open'
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
          ) AS progress_count

        FROM complaints

        WHERE
          user_id = ?
        `,
        [
          userId
        ]
      );


    const complaintStats =
      (complaintRows as any[])[0] ||
      {};


    /* -----------------------------------------------------
       ANNOUNCEMENTS
    ----------------------------------------------------- */

    const [
      announcementRows
    ] =
      await pool.execute(
        `
        SELECT

          id,
          title,
          content,
          created_at

        FROM announcements

        WHERE
          status = 'published'

          AND (
            publish_at IS NULL
            OR publish_at <= NOW()
          )

          AND (
            expires_at IS NULL
            OR expires_at >= NOW()
          )

        ORDER BY
          created_at DESC

        LIMIT 5
        `,
        []
      );


    const announcements =
      (
        announcementRows as any[]
      ).map(
        item => ({

          id:
            item.id,

          title:
            item.title,

          message:
            item.content,

          createdAt:
            item.created_at

        })
      );


    return res.json({

      success:
        true,

      data: {

        profile: {

          id:
            profile.id,

          firstName:
            profile.first_name,

          lastName:
            profile.last_name,

          email:
            profile.email,

          mobile:
            profile.mobile ||
            profile.phone,

          profileImage:
            profile.profile_image,

          status:
            profile.status,

          role:
            profile.role_name,

          createdAt:
            profile.created_at

        },

        home: home
          ? {

              flatId:
                home.flat_id,

              flatNumber:
                home.flat_number,

              floorNumber:
                home.floor_number,

              flatType:
                home.flat_type,

              occupancyStatus:
                home.occupancy_status,

              buildingId:
                home.building_id,

              buildingName:
                home.building_name,

              buildingCode:
                home.building_code,

              ownershipType:
                home.ownership_type,

              leaseStartDate:
                home.lease_start_date,

              leaseEndDate:
                home.lease_end_date

            }
          : null,

        maintenance: {

          outstandingAmount,

          currentBill:
            currentBill
              ? {

                  id:
                    currentBill.id,

                  billNumber:
                    currentBill.bill_number,

                  totalAmount:
                    Number(
                      currentBill.total_amount
                    ),

                  dueDate:
                    currentBill.due_date,

                  status:
                    currentBill.status

                }
              : null

        },

        payments: {

          totalPaid,

          recent:
            recentPayments

        },

        visitors: {

          today:
            Number(
              visitorStats.today_count ||
              0
            ),

          inside:
            Number(
              visitorStats.inside_count ||
              0
            )

        },

        complaints: {

          open:
            Number(
              complaintStats.open_count ||
              0
            ),

          inProgress:
            Number(
              complaintStats.progress_count ||
              0
            )

        },

        announcements

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load resident dashboard"
    });

  }

}


/* =========================================================
   HOME
========================================================= */

export async function getResidentHome(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          f.id,
          f.flat_number,
          f.floor_number,
          f.flat_type,
          f.area_sqft,
          f.occupancy_status,

          b.id AS building_id,
          b.name AS building_name,
          b.building_code,
          b.address AS building_address,

          mp.ownership_type,
          mp.lease_start_date,
          mp.lease_end_date

        FROM flats f

        INNER JOIN buildings b
          ON b.id = f.building_id

        LEFT JOIN member_profiles mp
          ON mp.user_id = ?

        WHERE
          (
            f.owner_id = ?
            OR f.tenant_id = ?
          )

          AND f.status = 'active'

        LIMIT 1
        `,
        [
          userId,
          userId,
          userId
        ]
      );


    const home =
      (rows as any[])[0] ||
      null;


    return res.json({

      success:
        true,

      data: {

        home: home
          ? {

              id:
                home.id,

              buildingId:
                home.building_id,

              buildingName:
                home.building_name,

              buildingCode:
                home.building_code,

              buildingAddress:
                home.building_address,

              flatNumber:
                home.flat_number,

              floorNumber:
                home.floor_number,

              flatType:
                home.flat_type,

              areaSqft:
                home.area_sqft,

              occupancyStatus:
                home.occupancy_status,

              ownershipType:
                home.ownership_type,

              leaseStartDate:
                home.lease_start_date,

              leaseEndDate:
                home.lease_end_date

            }
          : null

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident home error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load home details"
    });

  }

}


/* =========================================================
   BILLS
========================================================= */

export async function getResidentBills(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          mb.id,
          mb.bill_number,
          mb.flat_id,
          mb.billing_month,
          mb.maintenance_amount,
          mb.electricity_amount,
          mb.water_amount,
          mb.parking_amount,
          mb.penalty_amount,
          mb.other_amount,
          mb.total_amount,
          mb.due_date,
          mb.status,
          mb.notes,
          mb.created_at

        FROM maintenance_bills mb

        INNER JOIN flats f
          ON f.id = mb.flat_id

        WHERE
          (
            f.owner_id = ?
            OR f.tenant_id = ?
          )

        ORDER BY
          mb.billing_month DESC,
          mb.id DESC
        `,
        [
          userId,
          userId
        ]
      );


    return res.json({

      success:
        true,

      data: {

        bills:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident bills error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load maintenance bills"
    });

  }

}


/* =========================================================
   BILL BY ID
========================================================= */

export async function getResidentBillById(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);

    const billId =
      Number(
        req.params.id
      );


    if (
      !billId
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid bill ID"
      });

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          mb.*,

          f.flat_number,

          b.name AS building_name

        FROM maintenance_bills mb

        INNER JOIN flats f
          ON f.id = mb.flat_id

        INNER JOIN buildings b
          ON b.id = f.building_id

        WHERE

          mb.id = ?

          AND (
            f.owner_id = ?
            OR f.tenant_id = ?
          )

        LIMIT 1
        `,
        [
          billId,
          userId,
          userId
        ]
      );


    const bills =
      rows as any[];


    if (
      bills.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Bill not found"
      });

    }


    return res.json({

      success:
        true,

      data: {

        bill:
          bills[0]

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident bill detail error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load bill"
    });

  }

}


/* =========================================================
   PAYMENTS
========================================================= */

export async function getResidentPayments(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          p.id,
          p.payment_number,
          p.bill_id,
          p.user_id,
          p.amount,
          p.payment_method,
          p.transaction_id,
          p.payment_status,
          p.paid_at,
          p.notes,
          p.created_at,

          mb.bill_number

        FROM payments p

        LEFT JOIN maintenance_bills mb
          ON mb.id = p.bill_id

        WHERE
          p.user_id = ?

        ORDER BY
          p.created_at DESC
        `,
        [
          userId
        ]
      );


    return res.json({

      success:
        true,

      data: {

        payments:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load payments"
    });

  }

}


/* =========================================================
   CREATE PAYMENT
========================================================= */

export async function createResidentPayment(
  req: ResidentRequest,
  res: Response
) {

  let connection:
    Awaited<
      ReturnType<
        typeof pool.getConnection
      >
    > | null =
      null;


  try {

    const userId =
      getUserId(req);


    const {
      billId,
      amount,
      paymentMethod,
      transactionId,
      notes
    } =
      req.body ?? {};


    const parsedBillId =
      Number(
        billId
      );


    const parsedAmount =
      Number(
        amount
      );


    const methods = [
      "upi",
      "card",
      "net_banking",
      "bank_transfer",
      "cash",
      "other"
    ];


    if (
      !parsedBillId ||
      parsedAmount <= 0 ||
      !methods.includes(
        paymentMethod
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Valid bill, amount and payment method are required"
      });

    }


    connection =
      await pool.getConnection();


    await connection.beginTransaction();


    /* -----------------------------------------------------
       VERIFY BILL BELONGS TO RESIDENT
    ----------------------------------------------------- */

    const [
      billRows
    ] =
      await connection.execute(
        `
        SELECT

          mb.id,
          mb.total_amount,
          mb.status,
          mb.flat_id

        FROM maintenance_bills mb

        INNER JOIN flats f
          ON f.id = mb.flat_id

        WHERE

          mb.id = ?

          AND (
            f.owner_id = ?
            OR f.tenant_id = ?
          )

        LIMIT 1
        `,
        [
          parsedBillId,
          userId,
          userId
        ]
      );


    const bills =
      billRows as any[];


    if (
      bills.length === 0
    ) {

      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Bill not found"
      });

    }


    if (
      bills[0].status ===
      "paid"
    ) {

      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This bill is already paid"
      });

    }


    /* -----------------------------------------------------
       PAYMENT NUMBER
    ----------------------------------------------------- */

    const paymentNumber =
      `PAY-${Date.now()}`;


    await connection.execute(
      `
      INSERT INTO payments
      (
        payment_number,
        bill_id,
        user_id,
        amount,
        payment_method,
        transaction_id,
        payment_status,
        paid_at,
        notes
      )
      VALUES
      (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'success',
        CURRENT_TIMESTAMP,
        ?
      )
      `,
      [
        paymentNumber,
        parsedBillId,
        userId,
        parsedAmount,
        paymentMethod,
        transactionId ||
          null,
        notes ||
          null
      ]
    );


    /* -----------------------------------------------------
       CALCULATE TOTAL SUCCESSFUL PAYMENTS
       This prevents partial-payment status from resetting
       based only on the latest payment.
    ----------------------------------------------------- */

    const [
      paidRows
    ] =
      await connection.execute(
        `
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS total_paid
        FROM payments
        WHERE
          bill_id = ?
          AND payment_status = 'success'
        `,
        [
          parsedBillId
        ]
      );


    const totalPaid =
      Number(
        (paidRows as any[])[0]
          ?.total_paid ||
        0
      );


    /* -----------------------------------------------------
       CALCULATE REMAINING BALANCE
    ----------------------------------------------------- */

    const billTotal =
      Number(
        bills[0].total_amount
      );


    const remaining =
      billTotal -
      totalPaid;


    /* -----------------------------------------------------
       DETERMINE BILL STATUS
    ----------------------------------------------------- */

    const newStatus =
      remaining <= 0
        ? "paid"
        : totalPaid > 0
          ? "partially_paid"
          : "pending";


    /* -----------------------------------------------------
       UPDATE BILL STATUS
    ----------------------------------------------------- */

    await connection.execute(
      `
      UPDATE maintenance_bills
      SET
        status = ?,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE
        id = ?
      `,
      [
        newStatus,
        parsedBillId
      ]
    );


    await connection.commit();


    return res.status(201).json({

      success:
        true,

      message:
        "Payment recorded successfully",

      data: {

        paymentNumber,

        billStatus:
          newStatus

      }

    });

  } catch (
    error
  ) {

    if (
      connection
    ) {

      try {

        await connection.rollback();

      } catch (
        rollbackError
      ) {

        console.error(
          "Payment rollback error:",
          rollbackError
        );

      }

    }


    console.error(
      "Resident payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to record payment"
    });

  } finally {

    if (
      connection
    ) {

      connection.release();

    }

  }

}


/* =========================================================
   VISITORS
========================================================= */

export async function getResidentVisitors(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          v.*,

          f.flat_number,

          b.name AS building_name

        FROM visitors v

        LEFT JOIN flats f
          ON f.id = v.flat_id

        LEFT JOIN buildings b
          ON b.id =
            f.building_id

        WHERE
          v.resident_id = ?

        ORDER BY
          v.created_at DESC
        `,
        [
          userId
        ]
      );


    return res.json({

      success:
        true,

      data: {

        visitors:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident visitors error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load visitors"
    });

  }

}


export async function createResidentVisitor(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const {
      visitorName,
      phone,
      purpose,
      vehicleNumber,
      visitorType,
      parkingAccess,
      parkingSlot,
      expectedAt,
      notes
    } =
      req.body ?? {};


    const visitorTypes = [
      "guest",
      "delivery",
      "service",
      "cab",
      "other"
    ];


    if (
      !String(
        visitorName || ""
      ).trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Visitor name is required"
      });

    }


    if (
      !visitorTypes.includes(
        String(
          visitorType || ""
        )
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid visitor type"
      });

    }


    const [
      flatRows
    ] =
      await pool.execute(
        `
        SELECT
          f.id,
          f.flat_number,
          b.name AS building_name
        FROM flats f

        INNER JOIN buildings b
          ON b.id = f.building_id

        WHERE
          (
            f.owner_id = ?
            OR f.tenant_id = ?
          )

          AND f.status = 'active'

        LIMIT 1
        `,
        [
          userId,
          userId
        ]
      );


    const flat =
      (flatRows as any[])[0];


    if (
      !flat
    ) {

      return res.status(400).json({
        success: false,
        message:
          "You do not have an active flat assigned"
      });

    }


    const useParking =
      Boolean(
        parkingAccess
      );


    if (
      useParking &&
      !String(
        parkingSlot || ""
      ).trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Parking slot is required when parking access is enabled"
      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        INSERT INTO visitors
        (
          visitor_name,
          phone,
          flat_id,
          resident_id,
          purpose,
          vehicle_number,
          parking_access,
          parking_slot,
          visitor_type,
          expected_at,
          status,
          notes
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'expected',
          ?
        )
        `,
        [
          String(
            visitorName
          ).trim(),

          phone ||
            null,

          flat.id,

          userId,

          purpose ||
            null,

          vehicleNumber ||
            null,

          useParking
            ? 1
            : 0,

          useParking
            ? String(
                parkingSlot
              ).trim()
            : null,

          visitorType,

          expectedAt ||
            null,

          notes ||
            null
        ]
      );


    /*
     * Notify security/admin users.
     */
    const [
      securityUsers
    ] =
      await pool.execute(
        `
        SELECT
          u.id

        FROM users u

        INNER JOIN roles r
          ON r.id = u.role_id

        WHERE
          r.name IN
          (
            'admin',
            'security'
          )

          AND u.status = 'active'
        `,
        []
      );


    const {
      createManyUserNotifications
    } =
      await import(
        "../utils/notification.js"
      );


    await createManyUserNotifications(
      (
        securityUsers as any[]
      ).map(
        user =>
          Number(
            user.id
          )
      ),

      "New visitor expected",

      `${String(
        visitorName
      ).trim()} is expected at ${flat.building_name}, Flat ${flat.flat_number}.`,

      "visitor"
    );


    return res.status(201).json({

      success:
        true,

      message:
        "Visitor pre-approval created successfully",

      data: {

        id:
          (result as any)
            .insertId

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident create visitor error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to create visitor"

    });

  }

}


export async function updateResidentVisitorStatus(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);

    const id =
      Number(
        req.params.id
      );

    const status =
      String(
        req.body?.status ||
        ""
      );


    const allowed = [
      "expected",
      "inside",
      "completed",
      "rejected"
    ];


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid visitor ID"
      });

    }


    if (
      !allowed.includes(
        status
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid visitor status"
      });

    }


    const [
      visitorRows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          visitor_name,
          resident_id

        FROM visitors

        WHERE
          id = ?
          AND resident_id = ?

        LIMIT 1
        `,
        [
          id,
          userId
        ]
      );


    const visitor =
      (visitorRows as any[])[0];


    if (
      !visitor
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Visitor not found"
      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        UPDATE visitors

        SET
          status = ?,

          check_in =
            CASE

              WHEN
                ? = 'inside'
                AND check_in IS NULL

              THEN
                CURRENT_TIMESTAMP

              ELSE
                check_in

            END,

          check_out =
            CASE

              WHEN
                ? = 'completed'

              THEN
                CURRENT_TIMESTAMP

              ELSE
                check_out

            END

        WHERE
          id = ?
          AND resident_id = ?
        `,
        [
          status,
          status,
          status,
          id,
          userId
        ]
      );


    if (
      !(result as any)
        .affectedRows
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Visitor not found"
      });

    }


    return res.json({

      success:
        true,

      message:
        "Visitor status updated successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Resident visitor status error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to update visitor"

    });

  }

}

/* =========================================================
   COMPLAINTS
========================================================= */

export async function getResidentComplaints(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const search =
      String(
        req.query.search ||
        ""
      ).trim();


    const status =
      String(
        req.query.status ||
        ""
      ).trim();


    const priority =
      String(
        req.query.priority ||
        ""
      ).trim();


    const conditions:
      string[] = [
        "c.user_id = ?"
      ];


    const params:
      any[] = [
        userId
      ];


    if (
      search
    ) {

      const value =
        `%${search}%`;


      conditions.push(
        `
        (
          c.complaint_number LIKE ?
          OR c.title LIKE ?
          OR c.description LIKE ?
        )
        `
      );


      params.push(
        value,
        value,
        value
      );

    }


    if (
      status
    ) {

      conditions.push(
        "c.status = ?"
      );

      params.push(
        status
      );

    }


    if (
      priority
    ) {

      conditions.push(
        "c.priority = ?"
      );

      params.push(
        priority
      );

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          c.*

        FROM complaints c

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

        complaints:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident complaints error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load complaints"
    });

  }

}


export async function getResidentComplaintById(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);

    const id =
      Number(
        req.params.id
      );


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          c.*
        FROM complaints c
        WHERE
          c.id = ?
          AND c.user_id = ?
        LIMIT 1
        `,
        [
          id,
          userId
        ]
      );


    const complaints =
      rows as any[];


    if (
      complaints.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Complaint not found"
      });

    }


    return res.json({

      success:
        true,

      data: {

        complaint:
          complaints[0]

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident complaint detail error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load complaint"
    });

  }

}


export async function createResidentComplaint(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const {
      title,
      description,
      category,
      priority
    } =
      req.body ?? {};


    const categories = [
      "maintenance",
      "electricity",
      "water",
      "security",
      "cleaning",
      "parking",
      "noise",
      "staff",
      "other"
    ];


    const priorities = [
      "low",
      "medium",
      "high",
      "urgent"
    ];


    if (
      !String(
        title ||
        ""
      ).trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Complaint title is required"
      });

    }


    if (
      !String(
        description ||
        ""
      ).trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Complaint description is required"
      });

    }


    if (
      !categories.includes(
        category
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid complaint category"
      });

    }


    if (
      !priorities.includes(
        priority
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid complaint priority"
      });

    }


    const complaintNumber =
      `CMP-${Date.now()}`;


    /* -----------------------------------------------------
       FLAT
    ----------------------------------------------------- */

    const [
      flatRows
    ] =
      await pool.execute(
        `
        SELECT
          id
        FROM flats

        WHERE
          (
            owner_id = ?
            OR tenant_id = ?
          )

          AND status = 'active'

        LIMIT 1
        `,
        [
          userId,
          userId
        ]
      );


    const flat =
      (flatRows as any[])[0];


    const [
      result
    ] =
      await pool.execute(
        `
        INSERT INTO complaints
        (
          complaint_number,
          user_id,
          flat_id,
          title,
          description,
          category,
          priority,
          status
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'open'
        )
        `,
        [
          complaintNumber,
          userId,
          flat?.id ||
            null,
          String(
            title
          ).trim(),
          String(
            description
          ).trim(),
          category,
          priority
        ]
      );


    return res.status(201).json({

      success:
        true,

      message:
        "Complaint submitted successfully",

      data: {

        id:
          (result as any)
            .insertId,

        complaintNumber

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Create resident complaint error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create complaint"
    });

  }

}


/* =========================================================
   FAMILY
========================================================= */

export async function getResidentFamily(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          user_id,
          name,
          relationship,
          date_of_birth,
          gender,
          phone,
          emergency_contact,
          created_at,
          updated_at
        FROM family_members
        WHERE
          user_id = ?
        ORDER BY
          created_at DESC
        `,
        [
          userId
        ]
      );


    return res.json({

      success:
        true,

      data: {

        members:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident family error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load family members"
    });

  }

}


export async function createResidentFamilyMember(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const {
      name,
      relationship,
      dateOfBirth,
      gender,
      phone,
      emergencyContact
    } =
      req.body ?? {};


    if (
      !String(
        name ||
        ""
      ).trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Name is required"
      });

    }


    if (
      !String(
        relationship ||
        ""
      ).trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Relationship is required"
      });

    }


    const genders = [
      "male",
      "female",
      "other"
    ];


    const normalizedGender =
      gender &&
      genders.includes(
        gender
      )
        ? gender
        : null;


    const [
      result
    ] =
      await pool.execute(
        `
        INSERT INTO family_members
        (
          user_id,
          name,
          relationship,
          date_of_birth,
          gender,
          phone,
          emergency_contact
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          userId,
          String(
            name
          ).trim(),
          String(
            relationship
          ).trim(),
          dateOfBirth ||
            null,
          normalizedGender,
          phone ||
            null,
          emergencyContact
            ? 1
            : 0
        ]
      );


    return res.status(201).json({

      success:
        true,

      message:
        "Family member added successfully",

      data: {

        id:
          (result as any)
            .insertId

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Create family member error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add family member"
    });

  }

}


export async function removeResidentFamilyMember(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);

    const id =
      Number(
        req.params.id
      );


    const [
      result
    ] =
      await pool.execute(
        `
        DELETE FROM family_members

        WHERE
          id = ?
          AND user_id = ?
        `,
        [
          id,
          userId
        ]
      );


    if (
      !(result as any)
        .affectedRows
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Family member not found"
      });

    }


    return res.json({

      success:
        true,

      message:
        "Family member removed successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Remove family member error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove family member"
    });

  }

}


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

export async function getResidentAnnouncements(
  _req: ResidentRequest,
  res: Response
) {

  try {

    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          id,
          title,
          content,
          category,
          priority,
          publish_at,
          expires_at,
          created_at

        FROM announcements

        WHERE
          status = 'published'

          AND (
            publish_at IS NULL
            OR publish_at <= NOW()
          )

          AND (
            expires_at IS NULL
            OR expires_at >= NOW()
          )

        ORDER BY
          publish_at DESC,
          created_at DESC
        `,
        []
      );


    return res.json({

      success:
        true,

      data: {

        announcements:
          (
            rows as any[]
          ).map(
            item => ({

              id:
                item.id,

              title:
                item.title,

              message:
                item.content,

              category:
                item.category,

              priority:
                item.priority,

              createdAt:
                item.created_at

            })
          )

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident announcements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load announcements"
    });

  }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

export async function getResidentNotifications(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          user_id,
          title,
          message,
          type,
          is_read,
          read_at,
          created_at
        FROM notifications
        WHERE
          user_id = ?
        ORDER BY
          created_at DESC
        `,
        [
          userId
        ]
      );


    return res.json({

      success:
        true,

      data: {

        notifications:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load notifications"
    });

  }

}


export async function markResidentNotificationRead(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);

    const id =
      Number(
        req.params.id
      );


    const [
      result
    ] =
      await pool.execute(
        `
        UPDATE notifications

        SET
          is_read = 1,
          read_at =
            CURRENT_TIMESTAMP

        WHERE
          id = ?

          AND user_id = ?
        `,
        [
          id,
          userId
        ]
      );


    if (
      !(result as any)
        .affectedRows
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Notification not found"
      });

    }


    return res.json({

      success:
        true,

      message:
        "Notification marked as read"

    });

  } catch (
    error
  ) {

    console.error(
      "Mark notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update notification"
    });

  }

}


/* =========================================================
   RESIDENT PROFILE
========================================================= */

export async function getResidentProfile(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.mobile,
          u.phone,
          u.profile_image,
          u.status,
          u.created_at,

          r.name AS role_name,

          mp.ownership_type,
          mp.lease_start_date,
          mp.lease_end_date

        FROM users u

        INNER JOIN roles r
          ON r.id = u.role_id

        LEFT JOIN member_profiles mp
          ON mp.user_id = u.id

        WHERE
          u.id = ?

        LIMIT 1
        `,
        [
          userId
        ]
      );


    const profiles =
      rows as any[];


    if (
      profiles.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Profile not found"
      });

    }


    const profile =
      profiles[0];


    return res.json({

      success:
        true,

      data: {

        profile: {

          id:
            profile.id,

          firstName:
            profile.first_name,

          lastName:
            profile.last_name,

          email:
            profile.email,

          mobile:
            profile.mobile ||
            profile.phone,

          phone:
            profile.phone,

          profileImage:
            profile.profile_image,

          status:
            profile.status,

          role:
            profile.role_name,

          createdAt:
            profile.created_at,

          ownershipType:
            profile.ownership_type,

          leaseStartDate:
            profile.lease_start_date,

          leaseEndDate:
            profile.lease_end_date

        }

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load profile"
    });

  }

}


export async function updateResidentProfile(
  req: ResidentRequest,
  res: Response
) {

  try {

    const userId =
      getUserId(req);


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });

    }


    const firstName =
      String(
        req.body?.firstName ||
        ""
      ).trim();


    const lastName =
      String(
        req.body?.lastName ||
        ""
      ).trim();


    const mobile =
      String(
        req.body?.mobile ||
        ""
      ).trim();


    if (
      !firstName
    ) {

      return res.status(400).json({
        success: false,
        message:
          "First name is required"
      });

    }


    /* =====================================================
       UPDATE DATABASE
    ===================================================== */

    await pool.execute(
      `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        mobile = ?,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE
        id = ?
      `,
      [
        firstName,
        lastName || null,
        mobile || null,
        userId
      ]
    );


    /* =====================================================
       FETCH FRESH USER
       This is important because the frontend
       needs the newly saved values immediately.
    ===================================================== */

    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          first_name,
          last_name,
          email,
          mobile,
          phone,
          profile_image,
          status
        FROM users
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          userId
        ]
      );


    const updatedUser =
      (rows as any[])[0];


    if (
      !updatedUser
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Updated user could not be loaded"
      });

    }


    /* =====================================================
       RETURN FRESH DATA
    ===================================================== */

    return res.json({

      success:
        true,

      message:
        "Resident profile updated successfully",

      data: {

        user: {

          id:
            updatedUser.id,

          firstName:
            updatedUser.first_name,

          lastName:
            updatedUser.last_name,

          email:
            updatedUser.email,

          mobile:
            updatedUser.mobile ||
            updatedUser.phone ||
            "",

          phone:
            updatedUser.phone,

          profileImage:
            updatedUser.profile_image,

          status:
            updatedUser.status

        }

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Resident profile update error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to update resident profile"

    });

  }

}