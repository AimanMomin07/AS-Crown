import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";


const allowedCategories = [
  "Police",
  "Fire",
  "Ambulance",
  "Security",
  "Society Office",
  "Other"
];


/* =========================================================
   GET ACTIVE CONTACTS
========================================================= */

export async function getEmergencyContacts(
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
          name,
          phone,
          category,
          priority,
          is_active,
          created_at,
          updated_at

        FROM emergency_contacts

        WHERE
          is_active = 1

        ORDER BY
          priority ASC,
          id ASC
        `
      );


    return res.json({
      success: true,
      data: {
        contacts: rows
      }
    });

  } catch (
    error
  ) {

    console.error(
      "Get emergency contacts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve emergency contacts"
    });

  }

}


/* =========================================================
   ADMIN → GET ALL
========================================================= */

export async function getAllEmergencyContacts(
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
          name,
          phone,
          category,
          priority,
          is_active,
          created_at,
          updated_at

        FROM emergency_contacts

        ORDER BY
          priority ASC,
          id ASC
        `
      );


    return res.json({
      success: true,
      data: {
        contacts: rows
      }
    });

  } catch (
    error
  ) {

    console.error(
      "Get all emergency contacts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve emergency contacts"
    });

  }

}


/* =========================================================
   CREATE
========================================================= */

export async function createEmergencyContact(
  req: Request,
  res: Response
) {

  try {

    const name =
      String(
        req.body?.name ||
        ""
      ).trim();

    const phone =
      String(
        req.body?.phone ||
        ""
      ).trim();

    const category =
      String(
        req.body?.category ||
        "General"
      ).trim();

    const priority =
      Math.max(
        1,
        Number(
          req.body?.priority
        ) || 1
      );


    if (
      !name ||
      !phone
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Name and phone are required"
      });

    }


    if (
      !allowedCategories.includes(
        category
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid emergency contact category"
      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        INSERT INTO emergency_contacts
        (
          name,
          phone,
          category,
          priority,
          is_active
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          1
        )
        `,
        [
          name,
          phone,
          category,
          priority
        ]
      );


    return res.status(201).json({
      success: true,
      message:
        "Emergency contact created successfully",
      data: {
        id:
          Number(
            (result as any)
              .insertId
          )
      }
    });

  } catch (
    error
  ) {

    console.error(
      "Create emergency contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create emergency contact"
    });

  }

}


/* =========================================================
   UPDATE
========================================================= */

export async function updateEmergencyContact(
  req: Request,
  res: Response
) {

  try {

    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid emergency contact ID"
      });

    }


    const name =
      String(
        req.body?.name ||
        ""
      ).trim();

    const phone =
      String(
        req.body?.phone ||
        ""
      ).trim();

    const category =
      String(
        req.body?.category ||
        "General"
      ).trim();

    const priority =
      Math.max(
        1,
        Number(
          req.body?.priority
        ) || 1
      );

    const isActive =
      req.body?.isActive === false
        ? 0
        : 1;


    if (
      !name ||
      !phone
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Name and phone are required"
      });

    }


    if (
      !allowedCategories.includes(
        category
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid emergency contact category"
      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        UPDATE emergency_contacts

        SET
          name = ?,
          phone = ?,
          category = ?,
          priority = ?,
          is_active = ?,
          updated_at =
            CURRENT_TIMESTAMP

        WHERE
          id = ?
        `,
        [
          name,
          phone,
          category,
          priority,
          isActive,
          id
        ]
      );


    if (
      !(result as any)
        .affectedRows
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Emergency contact not found"
      });

    }


    return res.json({
      success: true,
      message:
        "Emergency contact updated successfully"
    });

  } catch (
    error
  ) {

    console.error(
      "Update emergency contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update emergency contact"
    });

  }

}


/* =========================================================
   DELETE
========================================================= */

export async function deleteEmergencyContact(
  req: Request,
  res: Response
) {

  try {

    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid emergency contact ID"
      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        DELETE FROM emergency_contacts

        WHERE
          id = ?
        `,
        [
          id
        ]
      );


    if (
      !(result as any)
        .affectedRows
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Emergency contact not found"
      });

    }


    return res.json({
      success: true,
      message:
        "Emergency contact deleted successfully"
    });

  } catch (
    error
  ) {

    console.error(
      "Delete emergency contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete emergency contact"
    });

  }

}
