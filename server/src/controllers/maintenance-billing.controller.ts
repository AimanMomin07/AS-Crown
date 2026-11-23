import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";

import {
  createUserNotification
} from "../utils/notification.js";


interface BillingRequest
  extends Request {

  user?: {
    id?: number | string;
    role?: string;
  };

}


const SUPPORTED_FLAT_TYPES = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "Penthouse",
  "Other"
];


/* =========================================================
   GENERATE MAINTENANCE BILLS
========================================================= */

export async function generateMaintenanceBills(
  req: BillingRequest,
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

    const {
      billingMonth,
      dueDate,
      buildingId
    } =
      req.body ?? {};


    /* =====================================================
       VALIDATE BILLING MONTH
    ===================================================== */

    const monthText =
      String(
        billingMonth ||
        ""
      ).trim();


    if (
      !/^\d{4}-\d{2}$/.test(
        monthText
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Billing month must be in YYYY-MM format"

      });

    }


    const [
      yearText,
      monthTextPart
    ] =
      monthText.split("-");


    const year =
      Number(
        yearText
      );

    const month =
      Number(
        monthTextPart
      );


    if (
      year < 2020 ||
      year > 2100 ||
      month < 1 ||
      month > 12
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid billing month"

      });

    }


    const billingMonthDate =
      `${monthText}-01`;


    /* =====================================================
       VALIDATE DUE DATE
    ===================================================== */

    const dueDateText =
      String(
        dueDate ||
        ""
      ).trim();


    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        dueDateText
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Due date must be in YYYY-MM-DD format"

      });

    }


    /* =====================================================
       BUILDING FILTER
    ===================================================== */

    const parsedBuildingId =
      buildingId ===
      undefined ||
      buildingId ===
      null ||
      buildingId ===
      ""
        ? null
        : Number(
            buildingId
          );


    if (
      parsedBuildingId !==
        null &&
      (
        !Number.isInteger(
          parsedBuildingId
        ) ||
        parsedBuildingId <=
          0
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid building ID"

      });

    }


    connection =
      await pool.getConnection();


    await connection.beginTransaction();


    /* =====================================================
       FETCH ACTIVE FLATS
    ===================================================== */

    let flatQuery = `
      SELECT

        f.id,
        f.flat_number,
        f.flat_type,
        f.building_id,
        f.owner_id,
        f.tenant_id,

        b.name AS building_name,
        b.building_code,

        r.id AS rate_id,

        r.maintenance_amount AS rate_maintenance,
        r.electricity_amount AS rate_electricity,
        r.water_amount AS rate_water,
        r.parking_amount AS rate_parking,
        r.penalty_amount AS rate_penalty,
        r.other_amount AS rate_other,
        r.status AS rate_status,

        o.id AS override_id,

        o.maintenance_amount AS override_maintenance,
        o.electricity_amount AS override_electricity,
        o.water_amount AS override_water,
        o.parking_amount AS override_parking,
        o.penalty_amount AS override_penalty,
        o.other_amount AS override_other,
        o.status AS override_status

      FROM flats f

      INNER JOIN buildings b
        ON b.id =
          f.building_id

      LEFT JOIN maintenance_rates r
        ON r.flat_type =
          f.flat_type

        AND r.status =
          'active'

      LEFT JOIN maintenance_rate_overrides o
        ON o.flat_id =
          f.id

        AND o.status =
          'active'

      WHERE
        f.status =
          'active'

        AND b.status =
          'active'
    `;


    const flatParams:
      any[] = [];


    if (
      parsedBuildingId !==
      null
    ) {

      flatQuery += `
        AND f.building_id = ?
      `;

      flatParams.push(
        parsedBuildingId
      );

    }


    flatQuery += `
      ORDER BY
        b.name ASC,
        f.flat_number ASC
    `;


    const [
      flatRows
    ] =
      await connection.execute(
        flatQuery,
        flatParams
      );


    const flats =
      flatRows as any[];


    if (
      flats.length ===
      0
    ) {

      await connection.rollback();


      return res.status(404).json({

        success:
          false,

        message:
          "No active flats found for the selected building"

      });

    }


    /* =====================================================
       PROCESS FLATS
    ===================================================== */

    const generated:
      any[] = [];

    const skipped:
      any[] = [];

    const failed:
      any[] = [];


    for (
      const flat
      of flats
    ) {

      try {

        /* =================================================
           VALIDATE FLAT TYPE
        ================================================= */

        const flatType =
          String(
            flat.flat_type ||
            "Other"
          );


        if (
          !SUPPORTED_FLAT_TYPES.includes(
            flatType
          )
        ) {

          skipped.push({

            flatId:
              flat.id,

            flatNumber:
              flat.flat_number,

            reason:
              `Unsupported flat type: ${flatType}`

          });

          continue;

        }


        /* =================================================
           RATE CHECK
        ================================================= */

        if (
          !flat.rate_id
        ) {

          skipped.push({

            flatId:
              flat.id,

            flatNumber:
              flat.flat_number,

            reason:
              `No active maintenance rate configured for ${flatType}`

          });

          continue;

        }


        /* =================================================
           DUPLICATE CHECK
        ================================================= */

        const [
          existingRows
        ] =
          await connection.execute(
            `
            SELECT
              id,
              bill_number,
              status

            FROM maintenance_bills

            WHERE
              flat_id = ?

              AND billing_month = ?

            LIMIT 1
            `,
            [
              flat.id,
              billingMonthDate
            ]
          );


        const existing =
          (existingRows as any[])[0];


        if (
          existing
        ) {

          skipped.push({

            flatId:
              flat.id,

            flatNumber:
              flat.flat_number,

            reason:
              `Bill already exists for ${monthText}`,

            existingBillId:
              existing.id,

            existingBillNumber:
              existing.bill_number

          });

          continue;

        }


        /* =================================================
           CALCULATE COMPONENTS
        ================================================= */

        const maintenance =
          flat.override_id
            ? flat.override_maintenance !==
                null
              ? Number(
                  flat.override_maintenance
                )
              : Number(
                  flat.rate_maintenance ||
                  0
                )
            : Number(
                flat.rate_maintenance ||
                0
              );


        const electricity =
          flat.override_id
            ? flat.override_electricity !==
                null
              ? Number(
                  flat.override_electricity
                )
              : Number(
                  flat.rate_electricity ||
                  0
                )
            : Number(
                flat.rate_electricity ||
                0
              );


        const water =
          flat.override_id
            ? flat.override_water !==
                null
              ? Number(
                  flat.override_water
                )
              : Number(
                  flat.rate_water ||
                  0
                )
            : Number(
                flat.rate_water ||
                0
              );


        const parking =
          flat.override_id
            ? flat.override_parking !==
                null
              ? Number(
                  flat.override_parking
                )
              : Number(
                  flat.rate_parking ||
                  0
                )
            : Number(
                flat.rate_parking ||
                0
              );


        const penalty =
          flat.override_id
            ? flat.override_penalty !==
                null
              ? Number(
                  flat.override_penalty
                )
              : Number(
                  flat.rate_penalty ||
                  0
                )
            : Number(
                flat.rate_penalty ||
                0
              );


        const other =
          flat.override_id
            ? flat.override_other !==
                null
              ? Number(
                  flat.override_other
                )
              : Number(
                  flat.rate_other ||
                  0
                )
            : Number(
                flat.rate_other ||
                0
              );


        const values = [
          maintenance,
          electricity,
          water,
          parking,
          penalty,
          other
        ];


        if (
          values.some(
            value =>
              !Number.isFinite(
                value
              ) ||
              value <
                0
          )
        ) {

          skipped.push({

            flatId:
              flat.id,

            flatNumber:
              flat.flat_number,

            reason:
              "Invalid maintenance rate values"

          });

          continue;

        }


        const total =
          Number(
            (
              maintenance +
              electricity +
              water +
              parking +
              penalty +
              other
            ).toFixed(
              2
            )
          );


        /* =================================================
           BILL NUMBER
        ================================================= */

        const billNumber =
          `MB-${year}${String(
            month
          ).padStart(
            2,
            "0"
          )}-${String(
            flat.id
          ).padStart(
            5,
            "0"
          )}`;


        /* =================================================
           RESIDENT
        ================================================= */

        const residentId =
          flat.owner_id ||
          flat.tenant_id ||
          null;


        /* =================================================
           INSERT BILL
        ================================================= */

        const [
          result
        ] =
          await connection.execute(
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
              ?,
              'pending',
              ?
            )
            `,
            [
              billNumber,

              flat.id,

              billingMonthDate,

              maintenance,

              electricity,

              water,

              parking,

              penalty,

              other,

              total,

              dueDateText,

              `Generated automatically for ${flatType}.`
            ]
          );


        const billId =
          Number(
            (result as any)
              .insertId
          );


        generated.push({

          id:
            billId,

          billNumber,

          flatId:
            flat.id,

          flatNumber:
            flat.flat_number,

          buildingName:
            flat.building_name,

          flatType,

          maintenance,
          electricity,
          water,
          parking,
          penalty,
          other,
          total,

          dueDate:
            dueDateText,

          residentId

        });


        /* =================================================
           RESIDENT NOTIFICATION
        ================================================= */

        if (
          residentId
        ) {

          await createUserNotification(

            Number(
              residentId
            ),

            "New maintenance bill generated",

            `Your ${flatType} maintenance bill ${billNumber} for ${monthText} is ₹${total.toLocaleString(
              "en-IN"
            )}. Due date: ${dueDateText}.`,

            "payment"

          );

        }

      } catch (
        flatError
      ) {

        console.error(
          "Bill generation error for flat:",
          flat.id,
          flatError
        );


        failed.push({

          flatId:
            flat.id,

          flatNumber:
            flat.flat_number,

          reason:
            "Unable to generate bill"

        });

      }

    }


    await connection.commit();


    return res.status(201).json({

      success:
        true,

      message:
        "Maintenance bill generation completed",

      data: {

        billingMonth:
          billingMonthDate,

        dueDate:
          dueDateText,

        totalFlats:
          flats.length,

        generatedCount:
          generated.length,

        skippedCount:
          skipped.length,

        failedCount:
          failed.length,

        generated,

        skipped,

        failed

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
          "Bill generation rollback error:",
          rollbackError
        );

      }

    }


    console.error(
      "Generate maintenance bills error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to generate maintenance bills"

    });

  } finally {

    if (
      connection
    ) {

      connection.release();

    }

  }

}