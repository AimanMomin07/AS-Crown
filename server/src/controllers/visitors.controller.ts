import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";

import {
  createUserNotification
} from "../utils/notification.js";


const visitorTypes = [
  "guest",
  "delivery",
  "service",
  "cab",
  "other"
];


const statuses = [
  "expected",
  "inside",
  "completed",
  "rejected"
];


/* =========================================================
   GET VISITORS
========================================================= */

export async function getVisitors(
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


    const search =
      String(
        req.query.search || ""
      ).trim();


    const conditions:
      string[] = [
        "1=1"
      ];


    const params:
      any[] = [];


    /* -----------------------------------------------------
       STATUS
    ----------------------------------------------------- */

    if (
      status
    ) {

      if (
        !statuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid visitor status"

        });

      }


      conditions.push(
        "v.status = ?"
      );


      params.push(
        status
      );

    }


    /* -----------------------------------------------------
       FLAT
    ----------------------------------------------------- */

    if (
      flatId
    ) {

      const parsedFlatId =
        Number(
          flatId
        );


      if (
        !Number.isInteger(
          parsedFlatId
        ) ||
        parsedFlatId <= 0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid flat ID"

        });

      }


      conditions.push(
        "v.flat_id = ?"
      );


      params.push(
        parsedFlatId
      );

    }


    /* -----------------------------------------------------
       SEARCH
    ----------------------------------------------------- */

    if (
      search
    ) {

      const searchValue =
        `%${search}%`;


      conditions.push(
        `
        (
          v.visitor_name LIKE ?
          OR v.phone LIKE ?
          OR v.vehicle_number LIKE ?
          OR v.purpose LIKE ?
          OR f.flat_number LIKE ?
          OR b.name LIKE ?
        )
        `
      );


      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );

    }


    /* -----------------------------------------------------
       QUERY
    ----------------------------------------------------- */

    const [
      rows
    ] =
      await pool.query(
        `
        SELECT

          v.id,

          v.visitor_name,

          v.phone,

          v.flat_id,

          v.resident_id,

          v.purpose,

          v.vehicle_number,

          v.parking_access,

          v.parking_slot,

          v.visitor_type,

          v.check_in,

          v.check_out,

          v.status,

          v.notes,

          v.created_at,

          f.flat_number,

          f.flat_type,

          b.name
            AS building_name,

          b.building_code,

          u.first_name
            AS resident_first_name,

          u.last_name
            AS resident_last_name

        FROM visitors v

        LEFT JOIN flats f
          ON f.id = v.flat_id

        LEFT JOIN buildings b
          ON b.id = f.building_id

        LEFT JOIN users u
          ON u.id = v.resident_id

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

        visitors:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get visitors error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve visitors"

    });

  }

}


/* =========================================================
   CREATE VISITOR
========================================================= */

export async function createVisitor(
  req: Request,
  res: Response
) {

  try {

    const body =
      req.body ?? {};


    const visitorName =
      String(
        body.visitorName || ""
      ).trim();


    const phone =
      String(
        body.phone || ""
      ).trim() ||
      null;


    const flatId =
      body.flatId
        ? Number(
            body.flatId
          )
        : null;


    const residentId =
      body.residentId
        ? Number(
            body.residentId
          )
        : null;


    const purpose =
      String(
        body.purpose || ""
      ).trim() ||
      null;


    const vehicleNumber =
      String(
        body.vehicleNumber || ""
      )
        .trim()
        .toUpperCase() ||
      null;


    const visitorType =
      String(
        body.visitorType ||
        "guest"
      ).trim();


    const parkingAccess =
      body.parkingAccess
        ? 1
        : 0;


    const parkingSlot =
      parkingAccess
        ? String(
            body.parkingSlot || ""
          ).trim() ||
          null
        : null;


    const notes =
      String(
        body.notes || ""
      ).trim() ||
      null;


    /* -----------------------------------------------------
       BASIC VALIDATION
    ----------------------------------------------------- */

    if (
      !visitorName
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Visitor name is required"

      });

    }


    if (
      !visitorTypes.includes(
        visitorType
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid visitor type"

      });

    }


    if (
      flatId !== null &&
      (
        !Number.isInteger(
          flatId
        ) ||
        flatId <= 0
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid flat ID"

      });

    }


    if (
      residentId !== null &&
      (
        !Number.isInteger(
          residentId
        ) ||
        residentId <= 0
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid resident ID"

      });

    }


    /* -----------------------------------------------------
       PARKING VALIDATION
    ----------------------------------------------------- */

    if (
      parkingAccess &&
      !vehicleNumber
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Vehicle number is required when parking access is enabled"

      });

    }


    if (
      parkingAccess &&
      !parkingSlot
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Parking slot is required when parking access is enabled"

      });

    }


    /* -----------------------------------------------------
       VERIFY FLAT
    ----------------------------------------------------- */

    if (
      flatId
    ) {

      const [
        flatRows
      ] =
        await pool.execute(
          `
          SELECT
            id,
            building_id,
            flat_number,
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

          success:
            false,

          message:
            "Flat not found"

        });

      }


      if (
        flats[0].status !==
        "active"
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Selected flat is inactive"

        });

      }

    }


    /* -----------------------------------------------------
       VERIFY RESIDENT
    ----------------------------------------------------- */

    if (
      residentId
    ) {

      const [
        residentRows
      ] =
        await pool.execute(
          `
          SELECT
            u.id,
            u.status,
            r.name AS role_name
          FROM users u
          INNER JOIN roles r
            ON r.id = u.role_id
          WHERE
            u.id = ?
          LIMIT 1
          `,
          [
            residentId
          ]
        );


      const residents =
        residentRows as any[];


      if (
        residents.length === 0
      ) {

        return res.status(404).json({

          success:
            false,

          message:
            "Resident not found"

        });

      }


      if (
        residents[0].role_name !==
        "resident"
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Selected user is not a resident"

        });

      }


      if (
        residents[0].status !==
        "active"
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Selected resident is not active"

        });

      }

    }


    /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

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
          check_in,
          check_out,
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
          CURRENT_TIMESTAMP,
          NULL,
          'expected',
          ?
        )
        `,
        [
          visitorName,
          phone,
          flatId,
          residentId,
          purpose,
          vehicleNumber,
          parkingAccess,
          parkingSlot,
          visitorType,
          notes
        ]
      );


        if (
      residentId
    ) {

      await createUserNotification(
  residentId,
  "Visitor added",
  `${visitorName} has been added to your expected visitors.`,
  "visitor"
);

    }


    return res.status(201).json({

      success:
        true,

      message:
        "Visitor created successfully",

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
      "Create visitor error:",
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


/* =========================================================
   UPDATE VISITOR STATUS
========================================================= */

export async function updateVisitorStatus(
  req: Request,
  res: Response
) {

  try {

    const id =
      Number(
        req.params.id
      );


    const status =
      String(
        req.body?.status || ""
      ).trim();


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid visitor ID"

      });

    }


    if (
      !statuses.includes(
        status
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid visitor status"

      });

    }


    /* -----------------------------------------------------
       MAKE SURE VISITOR EXISTS
    ----------------------------------------------------- */

    const [
      visitorRows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          status,
          resident_id,
          visitor_name
        FROM visitors
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          id
        ]
      );


    const visitors =
      visitorRows as any[];


    if (
      visitors.length === 0
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Visitor not found"

      });

    }


    /* -----------------------------------------------------
       CHECK-IN
    ----------------------------------------------------- */

    if (
      status ===
      "inside"
    ) {

      await pool.execute(
        `
        UPDATE visitors
        SET
          status = ?,
          check_in =
            COALESCE(
              check_in,
              CURRENT_TIMESTAMP
            )
        WHERE
          id = ?
        `,
        [
          status,
          id
        ]
      );

    }

    /* -----------------------------------------------------
       CHECK-OUT
    ----------------------------------------------------- */

    else if (
      status ===
      "completed"
    ) {

      await pool.execute(
        `
        UPDATE visitors
        SET
          status = 'completed',
          check_out =
            CURRENT_TIMESTAMP
        WHERE
          id = ?
        `,
        [
          id
        ]
      );

    }

    /* -----------------------------------------------------
       OTHER STATUS
    ----------------------------------------------------- */

    else {

      await pool.execute(
        `
        UPDATE visitors
        SET
          status = ?
        WHERE
          id = ?
        `,
        [
          status,
          id
        ]
      );

    }


        const visitor =
      visitors[0];


    if (
      Number(
        visitor.resident_id ||
        0
      ) > 0
    ) {

      let title =
        "Visitor status updated";

      let message =
        `${visitor.visitor_name} visitor status is now ${status}.`;


      if (
        status ===
        "inside"
      ) {

        title =
          "Visitor has entered";

        message =
          `${visitor.visitor_name} has entered the society.`;

      }


      if (
        status ===
        "completed"
      ) {

        title =
          "Visitor entry completed";

        message =
          `${visitor.visitor_name} has exited the society.`;

      }


      await createUserNotification(
        Number(
          visitor.resident_id
        ),
        title,
        message,
        "visitor"
      );

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
      "Update visitor status error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to update visitor status"

    });

  }

}