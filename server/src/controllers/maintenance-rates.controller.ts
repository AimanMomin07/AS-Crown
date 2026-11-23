import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";


const ALLOWED_FLAT_TYPES = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "Penthouse",
  "Other"
];


/* =========================================================
   GET ALL RATES
========================================================= */

export async function getMaintenanceRates(
  _req: Request,
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
          flat_type,
          maintenance_amount,
          electricity_amount,
          water_amount,
          parking_amount,
          penalty_amount,
          other_amount,
          late_fee_per_day,
          grace_days,
          status,
          created_at,
          updated_at
        FROM maintenance_rates
        ORDER BY
          FIELD(
            flat_type,
            '1BHK',
            '2BHK',
            '3BHK',
            '4BHK',
            'Penthouse'
          )
        `
      );


    return res.json({

      success:
        true,

      data: {

        rates:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get maintenance rates error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve maintenance rates"

    });

  }

}


/* =========================================================
   CREATE / UPSERT RATE
========================================================= */

export async function upsertMaintenanceRate(
  req: Request,
  res: Response
) {

  try {

    const {
      flatType,
      maintenanceAmount,
      electricityAmount,
      waterAmount,
      parkingAmount,
      penaltyAmount,
      otherAmount,
      lateFeePerDay,
      graceDays,
      status
    } =
      req.body ?? {};


    const normalizedType =
      String(
        flatType ||
        ""
      ).trim();


    if (
      !ALLOWED_FLAT_TYPES.includes(
        normalizedType
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid flat type"

      });

    }


    const maintenance =
      Number(
        maintenanceAmount || 0
      );

    const electricity =
      Number(
        electricityAmount || 0
      );

    const water =
      Number(
        waterAmount || 0
      );

    const parking =
      Number(
        parkingAmount || 0
      );

    const penalty =
      Number(
        penaltyAmount || 0
      );

    const other =
      Number(
        otherAmount || 0
      );

    const lateFee =
      Number(
        lateFeePerDay || 0
      );

    const grace =
      Number(
        graceDays || 0
      );


    const values = [
      maintenance,
      electricity,
      water,
      parking,
      penalty,
      other,
      lateFee,
      grace
    ];


    if (
      values.some(
        value =>
          !Number.isFinite(
            value
          ) ||
          value < 0
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Rate values cannot be negative"

      });

    }


    if (
      !Number.isInteger(
        grace
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Grace days must be a whole number"

      });

    }


    const normalizedStatus =
      status === "inactive"
        ? "inactive"
        : "active";


    await pool.execute(
      `
      INSERT INTO maintenance_rates
      (
        flat_type,
        maintenance_amount,
        electricity_amount,
        water_amount,
        parking_amount,
        penalty_amount,
        other_amount,
        late_fee_per_day,
        grace_days,
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
        ?,
        ?,
        ?
      )

      ON DUPLICATE KEY UPDATE

        maintenance_amount =
          VALUES(maintenance_amount),

        electricity_amount =
          VALUES(electricity_amount),

        water_amount =
          VALUES(water_amount),

        parking_amount =
          VALUES(parking_amount),

        penalty_amount =
          VALUES(penalty_amount),

        other_amount =
          VALUES(other_amount),

        late_fee_per_day =
          VALUES(late_fee_per_day),

        grace_days =
          VALUES(grace_days),

        status =
          VALUES(status),

        updated_at =
          CURRENT_TIMESTAMP
      `,
      [
        normalizedType,
        maintenance,
        electricity,
        water,
        parking,
        penalty,
        other,
        lateFee,
        grace,
        normalizedStatus
      ]
    );


    return res.json({

      success:
        true,

      message:
        "Maintenance rate saved successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Upsert maintenance rate error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to save maintenance rate"

    });

  }

}


/* =========================================================
   GET FLAT OVERRIDES
========================================================= */

export async function getMaintenanceOverrides(
  _req: Request,
  res: Response
) {

  try {

    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          o.id,

          o.flat_id,

          f.flat_number,

          f.flat_type,

          b.name AS building_name,

          o.maintenance_amount,

          o.electricity_amount,

          o.water_amount,

          o.parking_amount,

          o.penalty_amount,

          o.other_amount,

          o.late_fee_per_day,

          o.grace_days,

          o.reason,

          o.status,

          o.created_at,

          o.updated_at

        FROM maintenance_rate_overrides o

        INNER JOIN flats f
          ON f.id = o.flat_id

        INNER JOIN buildings b
          ON b.id =
            f.building_id

        ORDER BY
          b.name ASC,
          f.flat_number ASC
        `
      );


    return res.json({

      success:
        true,

      data: {

        overrides:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get maintenance overrides error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve flat overrides"

    });

  }

}


/* =========================================================
   CREATE / UPDATE FLAT OVERRIDE
========================================================= */

export async function upsertMaintenanceOverride(
  req: Request,
  res: Response
) {

  try {

    const flatId =
      Number(
        req.params.flatId
      );


    if (
      !Number.isInteger(
        flatId
      ) ||
      flatId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid flat ID"

      });

    }


    const [
      flatRows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          flat_number,
          flat_type,
          status
        FROM flats
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          flatId
        ]
      );


    const flats =
      flatRows as any[];


    if (
      flats.length ===
      0
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Flat not found"

      });

    }


    const {
      maintenanceAmount,
      electricityAmount,
      waterAmount,
      parkingAmount,
      penaltyAmount,
      otherAmount,
      lateFeePerDay,
      graceDays,
      reason,
      status
    } =
      req.body ?? {};


    const values = [

      Number(
        maintenanceAmount
      ),

      Number(
        electricityAmount
      ),

      Number(
        waterAmount
      ),

      Number(
        parkingAmount
      ),

      Number(
        penaltyAmount
      ),

      Number(
        otherAmount
      ),

      Number(
        lateFeePerDay
      ),

      Number(
        graceDays
      )

    ];


    for (
      const value of values
    ) {

      if (
        !Number.isFinite(
          value
        ) ||
        value < 0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Override values cannot be negative"

        });

      }

    }


    if (
      !Number.isInteger(
        values[7]
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Grace days must be a whole number"

      });

    }


    await pool.execute(
      `
      INSERT INTO maintenance_rate_overrides
      (
        flat_id,
        maintenance_amount,
        electricity_amount,
        water_amount,
        parking_amount,
        penalty_amount,
        other_amount,
        late_fee_per_day,
        grace_days,
        reason,
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
        ?,
        ?,
        ?,
        ?
      )

      ON DUPLICATE KEY UPDATE

        maintenance_amount =
          VALUES(maintenance_amount),

        electricity_amount =
          VALUES(electricity_amount),

        water_amount =
          VALUES(water_amount),

        parking_amount =
          VALUES(parking_amount),

        penalty_amount =
          VALUES(penalty_amount),

        other_amount =
          VALUES(other_amount),

        late_fee_per_day =
          VALUES(late_fee_per_day),

        grace_days =
          VALUES(grace_days),

        reason =
          VALUES(reason),

        status =
          VALUES(status),

        updated_at =
          CURRENT_TIMESTAMP
      `,
      [
        flatId,
        values[0],
        values[1],
        values[2],
        values[3],
        values[4],
        values[5],
        values[6],
        values[7],
        reason ||
          null,
        status ===
        "inactive"
          ? "inactive"
          : "active"
      ]
    );


    return res.json({

      success:
        true,

      message:
        "Flat maintenance override saved successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Upsert maintenance override error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to save flat maintenance override"

    });

  }

}


/* =========================================================
   DELETE FLAT OVERRIDE
========================================================= */

export async function deleteMaintenanceOverride(
  req: Request,
  res: Response
) {

  try {

    const flatId =
      Number(
        req.params.flatId
      );


    if (
      !Number.isInteger(
        flatId
      ) ||
      flatId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid flat ID"

      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        DELETE FROM
          maintenance_rate_overrides

        WHERE
          flat_id = ?
        `,
        [
          flatId
        ]
      );


    if (
      !(result as any)
        .affectedRows
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Flat override not found"

      });

    }


    return res.json({

      success:
        true,

      message:
        "Flat maintenance override removed"

    });

  } catch (
    error
  ) {

    console.error(
      "Delete maintenance override error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to remove flat override"

    });

  }

}