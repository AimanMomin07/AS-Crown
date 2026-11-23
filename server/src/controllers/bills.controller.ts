import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";

import {
  createUserNotification
} from "../utils/notification.js";


/* =========================================================
   GET ALL BILLS
========================================================= */

export async function getBills(
  req: Request,
  res: Response
) {
  try {

    const status =
      String(
        req.query.status || ""
      ).trim();

    const flatId =
      String(
        req.query.flatId || ""
      ).trim();

    const month =
      String(
        req.query.month || ""
      ).trim();


    const conditions: string[] = [
      "1 = 1"
    ];

    const params: any[] = [];


    if (status) {

      conditions.push(
        "mb.status = ?"
      );

      params.push(
        status
      );

    }


    if (flatId) {

      conditions.push(
        "mb.flat_id = ?"
      );

      params.push(
        Number(flatId)
      );

    }


    if (month) {

      conditions.push(
        "DATE_FORMAT(mb.billing_month, '%Y-%m') = ?"
      );

      params.push(
        month
      );

    }


    const [
      rows
    ] = await pool.query(
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

        mb.created_at,
        mb.updated_at,

        f.flat_number,
        f.floor_number,

        b.name AS building_name,
        b.building_code

      FROM maintenance_bills mb

      INNER JOIN flats f
        ON f.id = mb.flat_id

      INNER JOIN buildings b
        ON b.id = f.building_id

      WHERE ${conditions.join(
        " AND "
      )}

      ORDER BY
        mb.billing_month DESC,
        mb.id DESC
      `,
      params
    );


    return res.json({

      success: true,

      data: {
        bills: rows
      }

    });

  } catch (error) {

    console.error(
      "Get bills error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to retrieve bills"

    });

  }
}


/* =========================================================
   GET BILL BY ID
========================================================= */

export async function getBillById(
  req: Request,
  res: Response
) {
  try {

    const billId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        billId
      ) ||
      billId <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid bill ID"

      });

    }


    const [
      rows
    ] = await pool.execute(
      `
      SELECT

        mb.*,

        f.flat_number,
        f.floor_number,

        b.name AS building_name,
        b.building_code,

        owner.first_name
          AS owner_first_name,

        owner.last_name
          AS owner_last_name,

        owner.email
          AS owner_email,

        owner.mobile
          AS owner_mobile

      FROM maintenance_bills mb

      INNER JOIN flats f
        ON f.id = mb.flat_id

      INNER JOIN buildings b
        ON b.id = f.building_id

      LEFT JOIN users owner
        ON owner.id = f.owner_id

      WHERE mb.id = ?

      LIMIT 1
      `,
      [
        billId
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

      success: true,

      data: {
        bill:
          bills[0]
      }

    });

  } catch (error) {

    console.error(
      "Get bill error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to retrieve bill"

    });

  }
}


/* =========================================================
   CREATE SINGLE BILL
========================================================= */

export async function createBill(
  req: Request,
  res: Response
) {
  try {

    const body =
      req.body ?? {};


    const flatId =
      Number(
        body.flatId
      );


    const billingMonth =
      String(
        body.billingMonth || ""
      ).trim();


    const dueDate =
      String(
        body.dueDate || ""
      ).trim();


    if (
      !Number.isInteger(
        flatId
      ) ||
      flatId <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Valid flat ID is required"

      });

    }


    if (!billingMonth) {

      return res.status(400).json({

        success: false,

        message:
          "Billing month is required"

      });

    }


    if (!dueDate) {

      return res.status(400).json({

        success: false,

        message:
          "Due date is required"

      });

    }


    const maintenanceAmount =
      Number(
        body.maintenanceAmount || 0
      );

    const electricityAmount =
      Number(
        body.electricityAmount || 0
      );

    const waterAmount =
      Number(
        body.waterAmount || 0
      );

    const parkingAmount =
      Number(
        body.parkingAmount || 0
      );

    const penaltyAmount =
      Number(
        body.penaltyAmount || 0
      );

    const otherAmount =
      Number(
        body.otherAmount || 0
      );


    const totalAmount =
      maintenanceAmount +
      electricityAmount +
      waterAmount +
      parkingAmount +
      penaltyAmount +
      otherAmount;


    if (
      totalAmount <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Bill total must be greater than zero"

      });

    }


    /* -----------------------------------------------------
       CHECK FLAT
    ----------------------------------------------------- */

    const [
      flatRows
    ] = await pool.execute(
      `
      SELECT
        id,
        status,
        owner_id
      FROM flats
      WHERE id = ?
      LIMIT 1
      `,
      [
        flatId
      ]
    );


    const flats =
      flatRows as any[];


    if (
      flats.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Flat not found"

      });

    }


    if (
      flats[0].status !==
      "active"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Cannot create a bill for an inactive flat"

      });

    }


    /* -----------------------------------------------------
       DUPLICATE CHECK
    ----------------------------------------------------- */

    const [
      existingRows
    ] = await pool.execute(
      `
      SELECT id
      FROM maintenance_bills

      WHERE
        flat_id = ?
        AND billing_month = ?

      LIMIT 1
      `,
      [
        flatId,
        billingMonth
      ]
    );


    if (
      (existingRows as any[])
        .length > 0
    ) {

      return res.status(409).json({

        success: false,

        message:
          "A bill already exists for this flat and billing month"

      });

    }


    const billNumber =
      `AS-${Date.now()}-${flatId}`;


    const [
      result
    ] = await pool.execute(
      `
      INSERT INTO maintenance_bills
      (
        bill_number,
        flat_id,
        billing_month,

        maintenance_amount,
        electricity_amount,
        water_amount,
        parking_amount,
        penalty_amount,
        other_amount,

        total_amount,
        due_date,
        status,
        notes
      )

      VALUES
      (
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        'pending',
        ?
      )
      `,
      [
        billNumber,
        flatId,
        billingMonth,

        maintenanceAmount,
        electricityAmount,
        waterAmount,
        parkingAmount,
        penaltyAmount,
        otherAmount,

        totalAmount,
        dueDate,

        body.notes ||
          null
      ]
    );


        const residentId =
      Number(
        flats[0].owner_id ||
        0
      );


    if (
      residentId > 0
    ) {

      await createUserNotification(
  residentId,
  "New maintenance bill",
  `Your maintenance bill ${billNumber} of ₹${totalAmount.toFixed(2)} has been generated. Due date: ${dueDate}.`,
  "payment"
);

    }


return res.status(201).json({

      success: true,

      message:
        "Maintenance bill created successfully",

      data: {

        id:
          (result as any)
            .insertId,

        billNumber,

        totalAmount

      }

    });

  } catch (error) {

    console.error(
      "Create bill error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to create maintenance bill"

    });

  }
}


/* =========================================================
   GENERATE BILLS FOR AN ENTIRE BUILDING
========================================================= */

export async function generateBills(
  req: Request,
  res: Response
) {
  try {

    const body =
      req.body ?? {};


    const buildingId =
      Number(
        body.buildingId
      );


    const billingMonth =
      String(
        body.billingMonth || ""
      ).trim();


    const dueDate =
      String(
        body.dueDate || ""
      ).trim();


    if (
      !Number.isInteger(
        buildingId
      ) ||
      buildingId <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Valid building ID is required"

      });

    }


    if (!billingMonth) {

      return res.status(400).json({

        success: false,

        message:
          "Billing month is required"

      });

    }


    if (!dueDate) {

      return res.status(400).json({

        success: false,

        message:
          "Due date is required"

      });

    }


    /* -----------------------------------------------------
       AMOUNTS
    ----------------------------------------------------- */

    const maintenanceAmount =
      Number(
        body.maintenanceAmount || 0
      );

    const electricityAmount =
      Number(
        body.electricityAmount || 0
      );

    const waterAmount =
      Number(
        body.waterAmount || 0
      );

    const parkingAmount =
      Number(
        body.parkingAmount || 0
      );

    const penaltyAmount =
      Number(
        body.penaltyAmount || 0
      );

    const otherAmount =
      Number(
        body.otherAmount || 0
      );


    const totalAmount =
      maintenanceAmount +
      electricityAmount +
      waterAmount +
      parkingAmount +
      penaltyAmount +
      otherAmount;


    if (
      totalAmount <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Bill amount must be greater than zero"

      });

    }


    /* -----------------------------------------------------
       CHECK BUILDING
    ----------------------------------------------------- */

    const [
      buildingRows
    ] = await pool.execute(
      `
      SELECT
        id,
        name,
        building_code,
        status
      FROM buildings
      WHERE id = ?
      LIMIT 1
      `,
      [
        buildingId
      ]
    );


    const buildings =
      buildingRows as any[];


    if (
      buildings.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Building not found"

      });

    }


    if (
      buildings[0].status !==
      "active"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Cannot generate bills for an inactive building"

      });

    }


    /* -----------------------------------------------------
       GET ACTIVE FLATS
    ----------------------------------------------------- */

    const [
      flatRows
    ] = await pool.execute(
      `
      SELECT
        id,
        flat_number,
        owner_id
      FROM flats

      WHERE
        building_id = ?
        AND status = 'active'

      ORDER BY
        floor_number ASC,
        flat_number ASC
      `,
      [
        buildingId
      ]
    );


    const flats =
      flatRows as any[];


    if (
      flats.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "No active flats found in this building"

      });

    }


    /* -----------------------------------------------------
       GENERATE
       We deliberately avoid getConnection()
       so it works with your current database pool.
    ----------------------------------------------------- */

    let created =
      0;

    let skipped =
      0;


    for (
      const flat
      of flats
    ) {

      const [
        existingRows
      ] = await pool.execute(
        `
        SELECT id
        FROM maintenance_bills

        WHERE
          flat_id = ?
          AND billing_month = ?

        LIMIT 1
        `,
        [
          flat.id,
          billingMonth
        ]
      );


      if (
        (existingRows as any[])
          .length > 0
      ) {

        skipped++;

        continue;

      }


      const billNumber =
        `AS-${Date.now()}-${flat.id}`;


      await pool.execute(
        `
        INSERT INTO maintenance_bills
        (
          bill_number,
          flat_id,
          billing_month,

          maintenance_amount,
          electricity_amount,
          water_amount,
          parking_amount,
          penalty_amount,
          other_amount,

          total_amount,
          due_date,
          status
        )

        VALUES
        (
          ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?,
          'pending'
        )
        `,
        [
          billNumber,
          flat.id,
          billingMonth,

          maintenanceAmount,
          electricityAmount,
          waterAmount,
          parkingAmount,
          penaltyAmount,
          otherAmount,

          totalAmount,
          dueDate
        ]
      );


      const residentId =
        Number(
          flat.owner_id ||
          0
        );


      if (
        residentId > 0
      ) {

        await createUserNotification(
  residentId,
  "New maintenance bill",
  `Your maintenance bill ${billNumber} of ₹${totalAmount.toFixed(2)} has been generated. Due date: ${dueDate}.`,
  "payment"
);

      }


      created++;

    }


    return res.status(201).json({

      success: true,

      message:
        `${created} bills generated successfully`,

      data: {

        building: {

          id:
            buildings[0].id,

          name:
            buildings[0].name,

          buildingCode:
            buildings[0]
              .building_code

        },

        totalFlats:
          flats.length,

        created,

        skipped,

        amountPerFlat:
          totalAmount,

        totalGeneratedAmount:
          created *
          totalAmount

      }

    });

  } catch (error) {

    console.error(
      "Generate bills error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to generate maintenance bills"

    });

  }
}