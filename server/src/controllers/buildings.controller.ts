import { Request, Response } from "express";
import pool from "../config/database.js";


// ============================================================
// GET ALL BUILDINGS
// ============================================================

export async function getBuildings(
  _req: Request,
  res: Response
) {
  try {

    const [rows] = await pool.execute(`
      SELECT
        b.id,
        b.name,
        b.building_code,
        b.total_floors,
        b.total_flats,
        b.address,
        b.status,
        b.created_at,
        b.updated_at,

        COUNT(
          CASE
            WHEN f.status = 'active'
            THEN f.id
          END
        ) AS active_flats,

        COUNT(
          CASE
            WHEN f.occupancy_status = 'occupied'
            THEN f.id
          END
        ) AS occupied_flats,

        COUNT(
          CASE
            WHEN f.occupancy_status = 'vacant'
            THEN f.id
          END
        ) AS vacant_flats,

        COUNT(
          CASE
            WHEN f.occupancy_status = 'rented'
            THEN f.id
          END
        ) AS rented_flats

      FROM buildings b

      LEFT JOIN flats f
        ON f.building_id = b.id

      GROUP BY
        b.id,
        b.name,
        b.building_code,
        b.total_floors,
        b.total_flats,
        b.address,
        b.status,
        b.created_at,
        b.updated_at

      ORDER BY b.id DESC
    `);

    return res.json({
      success: true,
      data: {
        buildings: rows
      }
    });

  } catch (error) {

    console.error(
      "Get buildings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve buildings"
    });
  }
}


// ============================================================
// GET SINGLE BUILDING
// ============================================================

export async function getBuildingById(
  req: Request,
  res: Response
) {
  try {

    const buildingId =
      Number(req.params.id);

    if (
      !Number.isInteger(buildingId) ||
      buildingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid building ID"
      });
    }

    const [rows] =
      await pool.execute(
        `
        SELECT
          b.id,
          b.name,
          b.building_code,
          b.total_floors,
          b.total_flats,
          b.address,
          b.status,
          b.created_at,
          b.updated_at,

          COUNT(
            CASE
              WHEN f.occupancy_status = 'occupied'
              THEN f.id
            END
          ) AS occupied_flats,

          COUNT(
            CASE
              WHEN f.occupancy_status = 'vacant'
              THEN f.id
            END
          ) AS vacant_flats,

          COUNT(
            CASE
              WHEN f.occupancy_status = 'rented'
              THEN f.id
            END
          ) AS rented_flats

        FROM buildings b

        LEFT JOIN flats f
          ON f.building_id = b.id

        WHERE b.id = ?

        GROUP BY
          b.id,
          b.name,
          b.building_code,
          b.total_floors,
          b.total_flats,
          b.address,
          b.status,
          b.created_at,
          b.updated_at

        LIMIT 1
        `,
        [buildingId]
      );

    const buildings =
      rows as any[];

    if (
      buildings.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Building not found"
      });
    }

    return res.json({
      success: true,
      data: {
        building:
          buildings[0]
      }
    });

  } catch (error) {

    console.error(
      "Get building error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve building"
    });
  }
}


// ============================================================
// CREATE BUILDING
// ============================================================

export async function createBuilding(
  req: Request,
  res: Response
) {
  try {

    const {
      name,
      buildingCode,
      totalFloors,
      totalFlats,
      address,
      status
    } = req.body;

    if (
      !name ||
      !buildingCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Building name and building code are required"
      });
    }

    const floors =
      Number(totalFloors ?? 1);

    const flats =
      Number(totalFlats ?? 0);

    if (
      !Number.isInteger(floors) ||
      floors < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total floors must be at least 1"
      });
    }

    if (
      !Number.isInteger(flats) ||
      flats < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total flats cannot be negative"
      });
    }

    const [existing] =
      await pool.execute(
        `
        SELECT id
        FROM buildings
        WHERE building_code = ?
        LIMIT 1
        `,
        [buildingCode]
      );

    if (
      (existing as any[]).length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Building code already exists"
      });
    }

    const [result] =
      await pool.execute(
        `
        INSERT INTO buildings
        (
          name,
          building_code,
          total_floors,
          total_flats,
          address,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          name.trim(),
          buildingCode.trim(),
          floors,
          flats,
          address ||
            null,
          status === "inactive"
            ? "inactive"
            : "active"
        ]
      );

    const insertId =
      (result as any).insertId;

    return res.status(201).json({
      success: true,
      message:
        "Building created successfully",
      data: {
        id: insertId
      }
    });

  } catch (error) {

    console.error(
      "Create building error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create building"
    });
  }
}


// ============================================================
// UPDATE BUILDING
// ============================================================

export async function updateBuilding(
  req: Request,
  res: Response
) {
  try {

    const buildingId =
      Number(req.params.id);

    if (
      !Number.isInteger(buildingId) ||
      buildingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid building ID"
      });
    }

    const {
      name,
      buildingCode,
      totalFloors,
      totalFlats,
      address,
      status
    } = req.body;

    if (
      !name ||
      !buildingCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Building name and building code are required"
      });
    }

    const floors =
      Number(totalFloors ?? 1);

    const flats =
      Number(totalFlats ?? 0);

    const [duplicate] =
      await pool.execute(
        `
        SELECT id
        FROM buildings
        WHERE building_code = ?
          AND id != ?
        LIMIT 1
        `,
        [
          buildingCode,
          buildingId
        ]
      );

    if (
      (duplicate as any[]).length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Another building already uses this building code"
      });
    }

    await pool.execute(
      `
      UPDATE buildings
      SET
        name = ?,
        building_code = ?,
        total_floors = ?,
        total_flats = ?,
        address = ?,
        status = ?
      WHERE id = ?
      `,
      [
        name.trim(),
        buildingCode.trim(),
        floors,
        flats,
        address ||
          null,
        status === "inactive"
          ? "inactive"
          : "active",
        buildingId
      ]
    );

    return res.json({
      success: true,
      message:
        "Building updated successfully"
    });

  } catch (error) {

    console.error(
      "Update building error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update building"
    });
  }
}


// ============================================================
// DELETE BUILDING
// ============================================================

export async function deleteBuilding(
  req: Request,
  res: Response
) {
  try {

    const buildingId =
      Number(req.params.id);

    if (
      !Number.isInteger(buildingId) ||
      buildingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid building ID"
      });
    }

    const [flats] =
      await pool.execute(
        `
        SELECT id
        FROM flats
        WHERE building_id = ?
        LIMIT 1
        `,
        [buildingId]
      );

    if (
      (flats as any[]).length > 0
    ) {

      return res.status(409).json({
        success: false,
        message:
          "Cannot delete a building that contains flats. Deactivate it instead."
      });
    }

    const [result] =
      await pool.execute(
        `
        DELETE FROM buildings
        WHERE id = ?
        `,
        [buildingId]
      );

    if (
      (result as any).affectedRows === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Building not found"
      });
    }

    return res.json({
      success: true,
      message:
        "Building deleted successfully"
    });

  } catch (error) {

    console.error(
      "Delete building error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete building"
    });
  }
}