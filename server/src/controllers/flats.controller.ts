import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";


/* =========================================================
   TYPES
========================================================= */

type FlatType =
  | "1BHK"
  | "2BHK"
  | "3BHK"
  | "4BHK"
  | "Penthouse"
  | "Other";


const VALID_FLAT_TYPES:
  FlatType[] = [
    "1BHK",
    "2BHK",
    "3BHK",
    "4BHK",
    "Penthouse",
    "Other"
  ];


const VALID_OCCUPANCY_STATUS = [
  "occupied",
  "vacant",
  "rented",
  "maintenance"
];


const VALID_FLAT_STATUS = [
  "active",
  "inactive"
];


/* =========================================================
   HELPER
   Mixed BHK distribution for auto-generation.

   Pattern every 20 flats:
   1,2       -> 1BHK
   3-12      -> 2BHK
   13-16     -> 3BHK
   17-19     -> 4BHK
   20        -> Penthouse
========================================================= */

function getGeneratedFlatType(
  index: number
): FlatType {

  const position =
    ((index - 1) % 20) + 1;


  if (
    position === 1 ||
    position === 2
  ) {

    return "1BHK";

  }


  if (
    position >= 3 &&
    position <= 12
  ) {

    return "2BHK";

  }


  if (
    position >= 13 &&
    position <= 16
  ) {

    return "3BHK";

  }


  if (
    position >= 17 &&
    position <= 19
  ) {

    return "4BHK";

  }


  return "Penthouse";

}


/* =========================================================
   GET ALL FLATS
========================================================= */

export async function getFlats(
  req: Request,
  res: Response
) {

  try {

    const {
      buildingId,
      occupancyStatus,
      flatType,
      status,
      search
    } = req.query;


    let query = `
      SELECT
        f.id,
        f.building_id,
        f.flat_number,
        f.floor_number,
        f.flat_type,
        f.area_sqft,

        f.owner_id,
        f.tenant_id,

        f.occupancy_status,
        f.status,

        f.created_at,
        f.updated_at,

        b.name AS building_name,
        b.building_code,

        owner.first_name
          AS owner_first_name,

        owner.last_name
          AS owner_last_name,

        owner.email
          AS owner_email,

        owner.mobile
          AS owner_mobile,

        tenant.first_name
          AS tenant_first_name,

        tenant.last_name
          AS tenant_last_name,

        tenant.email
          AS tenant_email,

        tenant.mobile
          AS tenant_mobile

      FROM flats f

      INNER JOIN buildings b
        ON b.id = f.building_id

      LEFT JOIN users owner
        ON owner.id = f.owner_id

      LEFT JOIN users tenant
        ON tenant.id = f.tenant_id

      WHERE 1 = 1
    `;


    const params:
      any[] = [];


    /* -----------------------------------------------------
       BUILDING
    ----------------------------------------------------- */

    if (
      buildingId
    ) {

      const parsedBuildingId =
        Number(
          buildingId
        );


      if (
        !Number.isInteger(
          parsedBuildingId
        ) ||
        parsedBuildingId <= 0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid building ID"

        });

      }


      query += `
        AND f.building_id = ?
      `;


      params.push(
        parsedBuildingId
      );

    }


    /* -----------------------------------------------------
       OCCUPANCY
    ----------------------------------------------------- */

    if (
      occupancyStatus
    ) {

      const occupancy =
        String(
          occupancyStatus
        );


      if (
        !VALID_OCCUPANCY_STATUS.includes(
          occupancy
        )
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid occupancy status"

        });

      }


      query += `
        AND f.occupancy_status = ?
      `;


      params.push(
        occupancy
      );

    }


    /* -----------------------------------------------------
       FLAT TYPE
    ----------------------------------------------------- */

    if (
      flatType
    ) {

      const type =
        String(
          flatType
        ) as FlatType;


      if (
        !VALID_FLAT_TYPES.includes(
          type
        )
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid flat type"

        });

      }


      query += `
        AND f.flat_type = ?
      `;


      params.push(
        type
      );

    }


    /* -----------------------------------------------------
       STATUS
    ----------------------------------------------------- */

    if (
      status
    ) {

      const flatStatus =
        String(
          status
        );


      if (
        !VALID_FLAT_STATUS.includes(
          flatStatus
        )
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid flat status"

        });

      }


      query += `
        AND f.status = ?
      `;


      params.push(
        flatStatus
      );

    }


    /* -----------------------------------------------------
       SEARCH
    ----------------------------------------------------- */

    if (
      search
    ) {

      query += `
        AND (
          f.flat_number LIKE ?
          OR b.name LIKE ?
          OR b.building_code LIKE ?
          OR owner.first_name LIKE ?
          OR owner.last_name LIKE ?
          OR tenant.first_name LIKE ?
          OR tenant.last_name LIKE ?
        )
      `;


      const searchValue =
        `%${String(search).trim()}%`;


      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );

    }


    query += `
      ORDER BY
        f.building_id ASC,
        f.floor_number ASC,
        f.flat_number ASC
    `;


    const [
      rows
    ] =
      await pool.execute(
        query,
        params
      );


    return res.json({

      success:
        true,

      data: {

        flats:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get flats error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve flats"

    });

  }

}


/* =========================================================
   GET FLAT BY ID
========================================================= */

export async function getFlatById(
  req: Request,
  res: Response
) {

  try {

    const flatId =
      Number(
        req.params.id
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
      rows
    ] =
      await pool.execute(
        `
        SELECT

          f.id,
          f.building_id,
          f.flat_number,
          f.floor_number,
          f.flat_type,
          f.area_sqft,

          f.owner_id,
          f.tenant_id,

          f.occupancy_status,
          f.status,

          f.created_at,
          f.updated_at,

          b.name AS building_name,
          b.building_code,
          b.address AS building_address,

          owner.first_name
            AS owner_first_name,

          owner.last_name
            AS owner_last_name,

          owner.email
            AS owner_email,

          owner.mobile
            AS owner_mobile,

          tenant.first_name
            AS tenant_first_name,

          tenant.last_name
            AS tenant_last_name,

          tenant.email
            AS tenant_email,

          tenant.mobile
            AS tenant_mobile

        FROM flats f

        INNER JOIN buildings b
          ON b.id = f.building_id

        LEFT JOIN users owner
          ON owner.id = f.owner_id

        LEFT JOIN users tenant
          ON tenant.id = f.tenant_id

        WHERE
          f.id = ?

        LIMIT 1
        `,
        [
          flatId
        ]
      );


    const flats =
      rows as any[];


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


    return res.json({

      success:
        true,

      data: {

        flat:
          flats[0]

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get flat error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve flat"

    });

  }

}


/* =========================================================
   CREATE SINGLE FLAT
========================================================= */

export async function createFlat(
  req: Request,
  res: Response
) {

  try {

    const {
      buildingId,
      flatNumber,
      floorNumber,
      flatType,
      areaSqft
    } =
      req.body ?? {};


    const parsedBuildingId =
      Number(
        buildingId
      );


    const parsedFloorNumber =
      Number(
        floorNumber || 0
      );


    const normalizedFlatNumber =
      String(
        flatNumber || ""
      ).trim();


    const normalizedFlatType =
      String(
        flatType || "2BHK"
      ) as FlatType;


    if (
      !Number.isInteger(
        parsedBuildingId
      ) ||
      parsedBuildingId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Valid building ID is required"

      });

    }


    if (
      !normalizedFlatNumber
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Flat number is required"

      });

    }


    if (
      parsedFloorNumber < 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid floor number"

      });

    }


    if (
      !VALID_FLAT_TYPES.includes(
        normalizedFlatType
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid flat type"

      });

    }


    /* -----------------------------------------------------
       CHECK BUILDING
    ----------------------------------------------------- */

    const [
      buildingRows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          total_floors,
          status
        FROM buildings
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          parsedBuildingId
        ]
      );


    const buildings =
      buildingRows as any[];


    if (
      buildings.length === 0
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Building not found"

      });

    }


    if (
      buildings[0].status !==
      "active"
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Cannot create a flat in an inactive building"

      });

    }


    if (
      parsedFloorNumber >
      Number(
        buildings[0].total_floors
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Floor number exceeds the building's total floors"

      });

    }


    /* -----------------------------------------------------
       DUPLICATE
    ----------------------------------------------------- */

    const [
      existingRows
    ] =
      await pool.execute(
        `
        SELECT
          id
        FROM flats
        WHERE
          building_id = ?
          AND flat_number = ?
        LIMIT 1
        `,
        [
          parsedBuildingId,
          normalizedFlatNumber
        ]
      );


    if (
      (existingRows as any[]).length >
      0
    ) {

      return res.status(409).json({

        success:
          false,

        message:
          "This flat already exists in this building"

      });

    }


    /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

    const [
      result
    ] =
      await pool.execute(
        `
        INSERT INTO flats
        (
          building_id,
          flat_number,
          floor_number,
          flat_type,
          area_sqft,
          occupancy_status,
          status
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          'vacant',
          'active'
        )
        `,
        [
          parsedBuildingId,
          normalizedFlatNumber,
          parsedFloorNumber,
          normalizedFlatType,
          areaSqft ??
            null
        ]
      );


    /* -----------------------------------------------------
       UPDATE BUILDING TOTAL
    ----------------------------------------------------- */

    await pool.execute(
      `
      UPDATE buildings
      SET
        total_flats = (
          SELECT
            COUNT(*)
          FROM flats
          WHERE
            building_id = ?
            AND status = 'active'
        ),

        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        id = ?
      `,
      [
        parsedBuildingId,
        parsedBuildingId
      ]
    );


    return res.status(201).json({

      success:
        true,

      message:
        "Flat created successfully",

      data: {

        id:
          (result as any).insertId,

        flatNumber:
          normalizedFlatNumber,

        flatType:
          normalizedFlatType,

        buildingId:
          parsedBuildingId,

        occupancyStatus:
          "vacant"

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Create flat error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to create flat"

    });

  }

}


/* =========================================================
   UPDATE FLAT
========================================================= */

export async function updateFlat(
  req: Request,
  res: Response
) {

  try {

    const flatId =
      Number(
        req.params.id
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


    const {
      flatNumber,
      floorNumber,
      flatType,
      areaSqft,
      occupancyStatus,
      status
    } =
      req.body ?? {};


    /* -----------------------------------------------------
       VALIDATE OPTIONAL INPUT
    ----------------------------------------------------- */

    const normalizedFlatType =
      flatType === undefined ||
      flatType === null ||
      flatType === ""
        ? null
        : String(
            flatType
          ) as FlatType;


    if (
      normalizedFlatType &&
      !VALID_FLAT_TYPES.includes(
        normalizedFlatType
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid flat type"

      });

    }


    if (
      occupancyStatus !==
        undefined &&
      occupancyStatus !==
        null &&
      occupancyStatus !==
        "" &&
      !VALID_OCCUPANCY_STATUS.includes(
        String(
          occupancyStatus
        )
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid occupancy status"

      });

    }


    if (
      status !==
        undefined &&
      status !==
        null &&
      status !==
        "" &&
      !VALID_FLAT_STATUS.includes(
        String(
          status
        )
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid flat status"

      });

    }


    /* -----------------------------------------------------
       LOAD EXISTING FLAT
    ----------------------------------------------------- */

    const [
      existingRows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          building_id,
          owner_id,
          tenant_id,
          floor_number
        FROM flats
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          flatId
        ]
      );


    const existingFlats =
      existingRows as any[];


    if (
      existingFlats.length === 0
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Flat not found"

      });

    }


    const existing =
      existingFlats[0];


    /* -----------------------------------------------------
       OWNER / TENANT SAFETY
    ----------------------------------------------------- */

    if (
      occupancyStatus ===
        "vacant" &&
      (
        existing.owner_id ||
        existing.tenant_id
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Cannot mark an assigned flat as vacant. Remove its owner or tenant first."

      });

    }


    if (
      occupancyStatus ===
        "occupied" &&
      !existing.owner_id
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "A flat must have an owner before it can be marked occupied."

      });

    }


    if (
      occupancyStatus ===
        "rented" &&
      !existing.tenant_id
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "A flat must have a tenant before it can be marked rented."

      });

    }


    /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

    await pool.execute(
      `
      UPDATE flats
      SET

        flat_number =
          COALESCE(
            ?,
            flat_number
          ),

        floor_number =
          COALESCE(
            ?,
            floor_number
          ),

        flat_type =
          COALESCE(
            ?,
            flat_type
          ),

        area_sqft =
          COALESCE(
            ?,
            area_sqft
          ),

        occupancy_status =
          COALESCE(
            ?,
            occupancy_status
          ),

        status =
          COALESCE(
            ?,
            status
          ),

        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        id = ?
      `,
      [
        flatNumber ??
          null,

        floorNumber ??
          null,

        normalizedFlatType,

        areaSqft ??
          null,

        occupancyStatus ??
          null,

        status ??
          null,

        flatId
      ]
    );


    return res.json({

      success:
        true,

      message:
        "Flat updated successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Update flat error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to update flat"

    });

  }

}


/* =========================================================
   DELETE / DEACTIVATE FLAT
========================================================= */

export async function deleteFlat(
  req: Request,
  res: Response
) {

  try {

    const flatId =
      Number(
        req.params.id
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
          building_id,
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

        success:
          false,

        message:
          "Flat not found"

      });

    }


    if (
      flats[0].owner_id ||
      flats[0].tenant_id
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Cannot deactivate a flat that has an owner or tenant"

      });

    }


    await pool.execute(
      `
      UPDATE flats
      SET

        status =
          'inactive',

        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        id = ?
      `,
      [
        flatId
      ]
    );


    /* Keep building totals accurate */

    await pool.execute(
      `
      UPDATE buildings
      SET

        total_flats = (
          SELECT
            COUNT(*)
          FROM flats
          WHERE
            building_id = ?
            AND status = 'active'
        ),

        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        id = ?
      `,
      [
        flats[0].building_id,
        flats[0].building_id
      ]
    );


    return res.json({

      success:
        true,

      message:
        "Flat deactivated successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Delete flat error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to deactivate flat"

    });

  }

}


/* =========================================================
   FLAT STATISTICS
========================================================= */

export async function getFlatStats(
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

        WHERE
          status = 'active'
        `
      );


    const [
      bhkRows
    ] =
      await pool.execute(
        `
        SELECT
          flat_type,
          COUNT(*) AS total
        FROM flats
        WHERE
          status = 'active'
        GROUP BY
          flat_type
        ORDER BY
          flat_type
        `
      );


    return res.json({

      success:
        true,

      data: {

        stats:
          (rows as any[])[0],

        byFlatType:
          bhkRows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Flat stats error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve flat statistics"

    });

  }

}


/* =========================================================
   AUTO GENERATE FLATS
========================================================= */

export async function generateFlats(
  req: Request,
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

    connection =
      await pool.getConnection();


    const {
      buildingId,
      flatsPerFloor
    } =
      req.body ?? {};


    const parsedBuildingId =
      Number(
        buildingId
      );


    const perFloor =
      Number(
        flatsPerFloor
      );


    if (
      !Number.isInteger(
        parsedBuildingId
      ) ||
      parsedBuildingId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Valid building ID is required"

      });

    }


    if (
      !Number.isInteger(
        perFloor
      ) ||
      perFloor < 1 ||
      perFloor > 20
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Flats per floor must be between 1 and 20"

      });

    }


    /* -----------------------------------------------------
       GET BUILDING
    ----------------------------------------------------- */

    const [
      buildingRows
    ] =
      await connection.execute(
        `
        SELECT
          id,
          name,
          building_code,
          total_floors,
          status
        FROM buildings
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          parsedBuildingId
        ]
      );


    const buildings =
      buildingRows as any[];


    if (
      buildings.length === 0
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Building not found"

      });

    }


    const building =
      buildings[0];


    if (
      building.status !==
      "active"
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Cannot generate flats for an inactive building"

      });

    }


    const totalFloors =
      Number(
        building.total_floors
      );


    if (
      !Number.isInteger(
        totalFloors
      ) ||
      totalFloors < 1
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Building has an invalid floor configuration"

      });

    }


    const expectedFlats =
      totalFloors *
      perFloor;


    /* -----------------------------------------------------
       CHECK EXISTING FLATS
    ----------------------------------------------------- */

    const [
      existingRows
    ] =
      await connection.execute(
        `
        SELECT
          COUNT(*) AS total
        FROM flats
        WHERE
          building_id = ?
        `,
        [
          parsedBuildingId
        ]
      );


    const existingCount =
      Number(
        (existingRows as any[])[0]
          ?.total ||
        0
      );


    if (
      existingCount > 0
    ) {

      return res.status(409).json({

        success:
          false,

        message:
          `This building already has ${existingCount} flats. Generation cancelled to prevent duplicates.`

      });

    }


    /* -----------------------------------------------------
       TRANSACTION
    ----------------------------------------------------- */

    await connection.beginTransaction();


    const generatedFlats:
      any[] = [];


    /* -----------------------------------------------------
       BUILDING PREFIX

       TOWER-A → A
       TOWER-B → B

       Otherwise use the last
       alphabetic character.
    ----------------------------------------------------- */

    let prefix =
      String(
        building.building_code ||
        ""
      )
        .replace(
          /[^A-Za-z]/g,
          ""
        )
        .slice(-1)
        .toUpperCase();


    if (
      !prefix
    ) {

      prefix =
        "F";

    }


    /* -----------------------------------------------------
       GENERATE MIXED BHK FLATS
    ----------------------------------------------------- */

    let generatedIndex =
      0;


    for (
      let floor = 1;
      floor <= totalFloors;
      floor++
    ) {

      for (
        let number = 1;
        number <= perFloor;
        number++
      ) {

        generatedIndex++;


        const flatNumber =
          `${prefix}-${floor}${String(
            number
          ).padStart(
            2,
            "0"
          )}`;


        const flatType =
          getGeneratedFlatType(
            generatedIndex
          );


        await connection.execute(
          `
          INSERT INTO flats
          (
            building_id,
            flat_number,
            floor_number,
            flat_type,
            area_sqft,
            occupancy_status,
            status
          )
          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            'vacant',
            'active'
          )
          `,
          [
            parsedBuildingId,
            flatNumber,
            floor,
            flatType,
            null
          ]
        );


        generatedFlats.push({

          flatNumber,

          floorNumber:
            floor,

          flatType,

          occupancyStatus:
            "vacant"

        });

      }

    }


    /* -----------------------------------------------------
       UPDATE BUILDING
    ----------------------------------------------------- */

    await connection.execute(
      `
      UPDATE buildings
      SET

        total_flats = ?,

        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        id = ?
      `,
      [
        expectedFlats,
        parsedBuildingId
      ]
    );


    await connection.commit();


    /* -----------------------------------------------------
       SUMMARY
    ----------------------------------------------------- */

    const distribution:
      Record<
        string,
        number
      > = {};


    for (
      const flat
      of generatedFlats
    ) {

      distribution[
        flat.flatType
      ] =
        (
          distribution[
            flat.flatType
          ] ||
          0
        ) + 1;

    }


    return res.status(201).json({

      success:
        true,

      message:
        `${generatedFlats.length} flats generated successfully`,

      data: {

        building: {

          id:
            building.id,

          name:
            building.name,

          buildingCode:
            building.building_code

        },

        totalFloors,

        flatsPerFloor:
          perFloor,

        totalGenerated:
          generatedFlats.length,

        distribution,

        flats:
          generatedFlats

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
          "Rollback error:",
          rollbackError
        );

      }

    }


    console.error(
      "Generate flats error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to generate flats"

    });

  } finally {

    if (
      connection
    ) {

      connection.release();

    }

  }

}