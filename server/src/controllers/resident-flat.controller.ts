import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";


/* =========================================================
   ASSIGN REGISTERED FLAT
========================================================= */

export async function assignResidentFlat(
  req: Request,
  res: Response
) {

  try {

    const userId =
      Number(
        req.params.userId
      );

    const flatId =
      Number(
        req.body?.flatId
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid resident ID"
      });

    }


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


    /* -----------------------------------------------------
       VERIFY RESIDENT
    ----------------------------------------------------- */

    const [
      userRows
    ] = await pool.execute(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        r.name AS role_name,
        u.status
      FROM users u
      INNER JOIN roles r
        ON r.id = u.role_id
      WHERE
        u.id = ?
      LIMIT 1
      `,
      [
        userId
      ]
    );


    const users =
      userRows as any[];


    if (
      users.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Resident not found"
      });

    }


    if (
      users[0].role_name !==
      "resident"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Selected user is not a resident"
      });

    }


    if (
      users[0].status !==
      "active"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Only active residents can be assigned"
      });

    }


    /* -----------------------------------------------------
       VERIFY FLAT
    ----------------------------------------------------- */

    const [
      flatRows
    ] = await pool.execute(
      `
      SELECT
        id,
        flat_number,
        flat_type,
        owner_id,
        tenant_id,
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
          "Selected flat is inactive"
      });

    }


    if (
      flats[0].owner_id &&
      Number(
        flats[0].owner_id
      ) !== userId
    ) {

      return res.status(409).json({
        success: false,
        message:
          "This flat already has an owner"
      });

    }


    /* -----------------------------------------------------
       ASSIGN
    ----------------------------------------------------- */

    await pool.execute(
      `
      UPDATE flats
      SET
        owner_id = ?,
        occupancy_status =
          CASE
            WHEN tenant_id IS NOT NULL
              THEN 'rented'
            ELSE 'occupied'
          END,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        userId,
        flatId
      ]
    );


    return res.json({
      success: true,
      message:
        "Resident assigned to flat successfully",
      data: {
        residentId:
          userId,
        flatId,
        flatNumber:
          flats[0].flat_number
      }
    });

  } catch (error) {

    console.error(
      "Assign resident flat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to assign resident to flat"
    });

  }

}


/* =========================================================
   REMOVE RESIDENT FROM FLAT
========================================================= */

export async function removeResidentFlat(
  req: Request,
  res: Response
) {

  try {

    const userId =
      Number(
        req.params.userId
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid resident ID"
      });

    }


    await pool.execute(
      `
      UPDATE flats
      SET
        owner_id = NULL,
        occupancy_status =
          CASE
            WHEN tenant_id IS NOT NULL
              THEN 'rented'
            ELSE 'vacant'
          END,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE owner_id = ?
      `,
      [
        userId
      ]
    );


    return res.json({
      success: true,
      message:
        "Resident removed from assigned flat"
    });

  } catch (error) {

    console.error(
      "Remove resident flat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove resident from flat"
    });

  }

}


/* =========================================================
   DELETE / DEACTIVATE RESIDENT ACCOUNT
========================================================= */

export async function removeResident(
  req: Request,
  res: Response
) {

  try {

    const userId =
      Number(
        req.params.userId
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid resident ID"
      });

    }


    /* First release their flat */

    await pool.execute(
      `
      UPDATE flats
      SET
        owner_id = NULL,
        occupancy_status =
          CASE
            WHEN tenant_id IS NOT NULL
              THEN 'rented'
            ELSE 'vacant'
          END,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE owner_id = ?
      `,
      [
        userId
      ]
    );


    /* Then deactivate account */

    await pool.execute(
      `
      UPDATE users
      SET
        status = 'inactive',
        updated_at =
          CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        userId
      ]
    );


    return res.json({
      success: true,
      message:
        "Resident removed successfully"
    });

  } catch (error) {

    console.error(
      "Remove resident error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove resident"
    });

  }

}