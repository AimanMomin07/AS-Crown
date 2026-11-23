import { Request, Response } from "express";
import pool from "../config/database.js";

/* =========================================================
   AUDIT LOG TYPES
========================================================= */

type AuditQueryParams = Array<string | number>;

/* =========================================================
   GET AUDIT LOGS
========================================================= */

export async function getAuditLogs(
  req: Request,
  res: Response
) {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 50, 1),
      200
    );

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const offset =
      (page - 1) * limit;

    const action = String(
      req.query.action || ""
    ).trim();

    const entityType = String(
      req.query.entityType || ""
    ).trim();

    const search = String(
      req.query.search || ""
    ).trim();

    const conditions: string[] = [
      "1 = 1"
    ];

    const params: AuditQueryParams = [];

    /* -------------------------------------------------------
       ACTION FILTER
    ------------------------------------------------------- */

    if (action) {
      conditions.push(
        "a.action = ?"
      );

      params.push(action);
    }

    /* -------------------------------------------------------
       ENTITY TYPE FILTER
    ------------------------------------------------------- */

    if (entityType) {
      conditions.push(
        "a.entity_type = ?"
      );

      params.push(entityType);
    }

    /* -------------------------------------------------------
       SEARCH FILTER
    ------------------------------------------------------- */

    if (search) {
      const value =
        `%${search}%`;

      conditions.push(`
        (
          a.action LIKE ?
          OR a.entity_type LIKE ?
          OR a.details LIKE ?
          OR CONCAT_WS(
            ' ',
            u.first_name,
            u.last_name
          ) LIKE ?
          OR u.email LIKE ?
        )
      `);

      params.push(
        value,
        value,
        value,
        value,
        value
      );
    }

    const whereClause =
      conditions.join(" AND ");

    /* =====================================================
       TOTAL COUNT
    ===================================================== */

    const [countRows] =
      await pool.execute(
        `
        SELECT
          COUNT(*) AS total

        FROM audit_logs a

        LEFT JOIN users u
          ON u.id = a.user_id

        WHERE
          ${whereClause}
        `,
        params
      );

    const total = Number(
      (countRows as any[])[0]
        ?.total || 0
    );

    /* =====================================================
       PAGINATED DATA

       LIMIT/OFFSET are supplied as mysql2 parameters instead
       of being interpolated into the SQL string.
    ===================================================== */

    const dataParams:
      AuditQueryParams = [
        ...params,
        limit,
        offset
      ];

    const [rows] =
      await pool.execute(
        `
        SELECT
          a.id,
          a.user_id,
          a.action,
          a.entity_type,
          a.entity_id,
          a.details,
          a.ip_address,
          a.created_at,

          CONCAT_WS(
            ' ',
            u.first_name,
            u.last_name
          ) AS user_name,

          u.email

        FROM audit_logs a

        LEFT JOIN users u
          ON u.id = a.user_id

        WHERE
          ${whereClause}

        ORDER BY
          a.created_at DESC,
          a.id DESC

        LIMIT ?
        OFFSET ?
        `,
        dataParams
      );

    return res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages:
            Math.max(
              Math.ceil(
                total / limit
              ),
              1
            )
        }
      }
    });
  } catch (error) {
    console.error(
      "Get audit logs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load audit logs"
    });
  }
}

/* =========================================================
   AUDIT LOG STATISTICS
========================================================= */

export async function getAuditLogStats(
  _req: Request,
  res: Response
) {
  try {
    const [rows] =
      await pool.execute(
        `
        SELECT
          COUNT(*) AS total,

          COUNT(
            DISTINCT user_id
          ) AS activeUsers,

          COUNT(
            DISTINCT action
          ) AS actionTypes,

          COUNT(
            DISTINCT entity_type
          ) AS entityTypes,

          SUM(
            CASE
              WHEN created_at >=
                CURRENT_TIMESTAMP -
                INTERVAL 24 HOUR
              THEN 1
              ELSE 0
            END
          ) AS last24Hours

        FROM audit_logs
        `
      );

    return res.json({
      success: true,
      data: {
        stats:
          (rows as any[])[0]
      }
    });
  } catch (error) {
    console.error(
      "Audit log stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load audit log statistics"
    });
  }
}