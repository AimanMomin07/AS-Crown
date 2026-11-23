import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";

import {
  createUserNotification
} from "../utils/notification.js";


const VALID_CATEGORIES = [
  "maintenance",
  "electricity",
  "water",
  "security",
  "cleaning",
  "parking",
  "noise",
  "staff",
  "other"
] as const;


const VALID_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent"
] as const;


const VALID_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "rejected"
] as const;


function getActorId(
  req: any
): number | null {

  const value =
    Number(
      req.user?.id
    );

  return Number.isInteger(
    value
  ) &&
    value > 0
    ? value
    : null;

}


/* =========================================================
   GET ALL COMPLAINTS
========================================================= */

export async function getComplaints(
  req: Request,
  res: Response
) {

  try {

    const {
      search,
      status,
      category,
      priority,
      flatId
    } = req.query;


    let sql = `
      SELECT

        c.id,

        c.complaint_number,

        c.user_id,

        c.flat_id,

        c.title,

        c.description,

        c.category,

        c.priority,

        c.status,

        c.assigned_to,

        c.sla_due_at,

        c.ai_category,

        c.ai_priority,

        c.resolution_notes,

        c.resolved_at,

        c.acknowledged_at,

        c.created_at,

        c.updated_at,

        u.first_name AS user_first_name,

        u.last_name AS user_last_name,

        u.email AS user_email,

        u.mobile AS user_mobile,

        f.flat_number,

        b.name AS building_name,

        b.building_code,

        staff.first_name AS staff_first_name,

        staff.last_name AS staff_last_name

      FROM complaints c

      INNER JOIN users u
        ON u.id = c.user_id

      LEFT JOIN flats f
        ON f.id = c.flat_id

      LEFT JOIN buildings b
        ON b.id = f.building_id

      LEFT JOIN users staff
        ON staff.id = c.assigned_to

      WHERE 1 = 1
    `;


    const params:
      any[] = [];


    if (
      search
    ) {

      const value =
        `%${String(search)}%`;


      sql += `
        AND (
          c.complaint_number LIKE ?
          OR c.title LIKE ?
          OR c.description LIKE ?
          OR u.first_name LIKE ?
          OR u.last_name LIKE ?
          OR f.flat_number LIKE ?
        )
      `;


      params.push(
        value,
        value,
        value,
        value,
        value,
        value
      );

    }


    if (
      status
    ) {

      sql += `
        AND c.status = ?
      `;

      params.push(
        String(status)
      );

    }


    if (
      category
    ) {

      sql += `
        AND c.category = ?
      `;

      params.push(
        String(category)
      );

    }


    if (
      priority
    ) {

      sql += `
        AND c.priority = ?
      `;

      params.push(
        String(priority)
      );

    }


    if (
      flatId
    ) {

      sql += `
        AND c.flat_id = ?
      `;

      params.push(
        Number(flatId)
      );

    }


    sql += `
      ORDER BY c.created_at DESC
    `;


    const [
      rows
    ] =
      await pool.execute(
        sql,
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
      "Get complaints error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve complaints"

    });

  }

}


/* =========================================================
   GET COMPLAINT BY ID
========================================================= */

export async function getComplaintById(
  req: Request,
  res: Response
) {

  try {

    const complaintId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        complaintId
      ) ||
      complaintId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint ID"

      });

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          c.*,

          u.first_name AS user_first_name,

          u.last_name AS user_last_name,

          u.email AS user_email,

          u.mobile AS user_mobile,

          f.flat_number,

          b.name AS building_name,

          b.building_code,

          staff.first_name AS staff_first_name,

          staff.last_name AS staff_last_name

        FROM complaints c

        INNER JOIN users u
          ON u.id = c.user_id

        LEFT JOIN flats f
          ON f.id = c.flat_id

        LEFT JOIN buildings b
          ON b.id = f.building_id

        LEFT JOIN users staff
          ON staff.id = c.assigned_to

        WHERE c.id = ?

        LIMIT 1
        `,
        [
          complaintId
        ]
      );


    const complaint =
      (rows as any[])[0];


    if (
      !complaint
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Complaint not found"

      });

    }


    const [
      statusRows
    ] =
      await pool.execute(
        `
        SELECT

          h.id,

          h.old_status,

          h.new_status,

          h.changed_by,

          h.notes,

          h.created_at,

          u.first_name,

          u.last_name

        FROM complaint_status_history h

        LEFT JOIN users u
          ON u.id = h.changed_by

        WHERE
          h.complaint_id = ?

        ORDER BY
          h.created_at DESC
        `,
        [
          complaintId
        ]
      );


    const [
      assignmentRows
    ] =
      await pool.execute(
        `
        SELECT

          h.id,

          h.old_assigned_to,

          h.new_assigned_to,

          h.assigned_by,

          h.notes,

          h.created_at,

          old_user.first_name
            AS old_staff_first_name,

          old_user.last_name
            AS old_staff_last_name,

          new_user.first_name
            AS new_staff_first_name,

          new_user.last_name
            AS new_staff_last_name,

          assigner.first_name
            AS assigner_first_name,

          assigner.last_name
            AS assigner_last_name

        FROM complaint_assignment_history h

        LEFT JOIN users old_user
          ON old_user.id =
             h.old_assigned_to

        LEFT JOIN users new_user
          ON new_user.id =
             h.new_assigned_to

        LEFT JOIN users assigner
          ON assigner.id =
             h.assigned_by

        WHERE
          h.complaint_id = ?

        ORDER BY
          h.created_at DESC
        `,
        [
          complaintId
        ]
      );


    return res.json({

      success:
        true,

      data: {

        complaint,

        statusHistory:
          statusRows,

        assignmentHistory:
          assignmentRows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get complaint error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve complaint"

    });

  }

}


/* =========================================================
   CREATE COMPLAINT
========================================================= */

export async function createComplaint(
  req: Request,
  res: Response
) {

  try {

    const {
      userId,
      flatId,
      title,
      description,
      category = "other",
      priority = "medium"
    } =
      req.body;


    if (
      !userId ||
      !title ||
      !description
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "User, title and description are required"

      });

    }


    if (
      !VALID_CATEGORIES.includes(
        category
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint category"

      });

    }


    if (
      !VALID_PRIORITIES.includes(
        priority
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint priority"

      });

    }


    const [
      userRows
    ] =
      await pool.execute(
        `
        SELECT id

        FROM users

        WHERE id = ?

        LIMIT 1
        `,
        [
          Number(userId)
        ]
      );


    if (
      (userRows as any[]).length ===
      0
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "User not found"

      });

    }


    if (
      flatId
    ) {

      const [
        flatRows
      ] =
        await pool.execute(
          `
          SELECT id

          FROM flats

          WHERE id = ?

          LIMIT 1
          `,
          [
            Number(flatId)
          ]
        );


      if (
        (flatRows as any[]).length ===
        0
      ) {

        return res.status(404).json({

          success:
            false,

          message:
            "Flat not found"

        });

      }

    }


    const complaintNumber =
      `CMP-${Date.now()}`;


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

          Number(userId),

          flatId
            ? Number(flatId)
            : null,

          String(title).trim(),

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
        "Complaint created successfully",

      data: {

        id:
          (result as any).insertId,

        complaintNumber

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Create complaint error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to create complaint"

    });

  }

}


/* =========================================================
   UPDATE COMPLAINT
========================================================= */

export async function updateComplaint(
  req: any,
  res: Response
) {

  try {

    const complaintId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        complaintId
      ) ||
      complaintId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint ID"

      });

    }


    const {
      category,
      priority,
      status,
      assignedTo,
      slaDueAt,
      resolutionNotes,
      aiCategory,
      aiPriority,
      historyNote
    } =
      req.body;


    if (
      category !== undefined &&
      !VALID_CATEGORIES.includes(
        category
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint category"

      });

    }


    if (
      priority !== undefined &&
      !VALID_PRIORITIES.includes(
        priority
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint priority"

      });

    }


    if (
      status !== undefined &&
      !VALID_STATUSES.includes(
        status
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint status"

      });

    }


    const [
      existingRows
    ] =
      await pool.execute(
        `
        SELECT *

        FROM complaints

        WHERE id = ?

        LIMIT 1
        `,
        [
          complaintId
        ]
      );


    const existing =
      (existingRows as any[])[0];


    if (
      !existing
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Complaint not found"

      });

    }


    /* -------------------------------------------------------
       DETERMINE NEXT VALUES
    ------------------------------------------------------- */

    const nextCategory =
      category !== undefined
        ? category
        : existing.category;


    const nextPriority =
      priority !== undefined
        ? priority
        : existing.priority;


    const nextStatus =
      status !== undefined
        ? status
        : existing.status;


    const nextAssignedTo =
      assignedTo !== undefined
        ? (
            assignedTo === null ||
            assignedTo === ""
              ? null
              : Number(
                  assignedTo
                )
          )
        : existing.assigned_to;


    const nextSlaDueAt =
      slaDueAt !== undefined
        ? (
            slaDueAt
              ? slaDueAt
              : null
          )
        : existing.sla_due_at;


    const nextResolutionNotes =
      resolutionNotes !== undefined
        ? (
            resolutionNotes === null
              ? null
              : String(
                  resolutionNotes
                )
          )
        : existing.resolution_notes;


    const nextAiCategory =
      aiCategory !== undefined
        ? aiCategory || null
        : existing.ai_category;


    const nextAiPriority =
      aiPriority !== undefined
        ? aiPriority || null
        : existing.ai_priority;


    /* -------------------------------------------------------
       ASSIGNEE VALIDATION
    ------------------------------------------------------- */

    if (
      nextAssignedTo !== null
    ) {

      const [
        staffRows
      ] =
        await pool.execute(
          `
          SELECT

            u.id,

            r.name AS role_name

          FROM users u

          INNER JOIN roles r
            ON r.id = u.role_id

          WHERE
            u.id = ?

            AND r.name IN (
              'admin',
              'staff',
              'security'
            )

          LIMIT 1
          `,
          [
            nextAssignedTo
          ]
        );


      if (
        (staffRows as any[]).length ===
        0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Assigned user is not an eligible staff member"

        });

      }

    }


    const actorId =
      getActorId(
        req
      );


    const assignmentChanged =
      Number(
        existing.assigned_to || 0
      ) !==
      Number(
        nextAssignedTo || 0
      );


    const statusChanged =
      existing.status !==
      nextStatus;


    /* -------------------------------------------------------
       UPDATE
    ------------------------------------------------------- */

    await pool.execute(
      `
      UPDATE complaints

      SET

        category = ?,

        priority = ?,

        status = ?,

        assigned_to = ?,

        sla_due_at = ?,

        resolution_notes = ?,

        ai_category = ?,

        ai_priority = ?,

        resolved_at =
          CASE

            WHEN ? = 'resolved'
              AND status <> 'resolved'
              THEN CURRENT_TIMESTAMP

            WHEN ? IN (
              'open',
              'in_progress',
              'rejected'
            )
              THEN NULL

            ELSE resolved_at

          END,

        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [

        nextCategory,

        nextPriority,

        nextStatus,

        nextAssignedTo,

        nextSlaDueAt,

        nextResolutionNotes,

        nextAiCategory,

        nextAiPriority,

        nextStatus,

        nextStatus,

        complaintId

      ]
    );


    /* -------------------------------------------------------
       STATUS HISTORY
    ------------------------------------------------------- */

    if (
      statusChanged
    ) {

      await pool.execute(
        `
        INSERT INTO complaint_status_history
        (
          complaint_id,

          old_status,

          new_status,

          changed_by,

          notes
        )

        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [

          complaintId,

          existing.status,

          nextStatus,

          actorId,

          historyNote ||
            null

        ]
      );

    }


    /* -------------------------------------------------------
       ASSIGNMENT HISTORY
    ------------------------------------------------------- */

    if (
      assignmentChanged
    ) {

      await pool.execute(
        `
        INSERT INTO complaint_assignment_history
        (
          complaint_id,

          old_assigned_to,

          new_assigned_to,

          assigned_by,

          notes
        )

        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [

          complaintId,

          existing.assigned_to ||
            null,

          nextAssignedTo,

          actorId,

          historyNote ||
            null

        ]
      );

    }


    /* -------------------------------------------------------
       RESIDENT NOTIFICATION
    ------------------------------------------------------- */

    if (
      statusChanged ||
      assignmentChanged ||
      resolutionNotes !== undefined
    ) {

      let title =
        "Complaint updated";


      let message =
        `Complaint ${existing.complaint_number} was updated.`;


      if (
        statusChanged
      ) {

        title =
          "Complaint status updated";

        message =
          `Your complaint ${existing.complaint_number} is now ${String(
            nextStatus
          ).replace(
            "_",
            " "
          )}.`;

      }


      if (
        nextStatus ===
        "resolved"
      ) {

        title =
          "Complaint resolved";

        message =
          `Your complaint ${existing.complaint_number} has been resolved. Please review it and acknowledge the resolution.`;

      }


      await createUserNotification(
        Number(
          existing.user_id
        ),
        title,
        message,
        "complaint"
      );

    }


    return res.json({

      success:
        true,

      message:
        "Complaint updated successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Update complaint error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to update complaint"

    });

  }

}


/* =========================================================
   RESIDENT ACKNOWLEDGE RESOLUTION
========================================================= */

export async function acknowledgeComplaint(
  req: any,
  res: Response
) {

  try {

    const complaintId =
      Number(
        req.params.id
      );


    const userId =
      Number(
        req.user?.id
      );


    if (
      !Number.isInteger(
        complaintId
      ) ||
      complaintId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid complaint ID"

      });

    }


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Authentication required"

      });

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          id,

          user_id,

          complaint_number,

          status,

          acknowledged_at

        FROM complaints

        WHERE id = ?

        LIMIT 1
        `,
        [
          complaintId
        ]
      );


    const complaint =
      (rows as any[])[0];


    if (
      !complaint
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "Complaint not found"

      });

    }


    if (
      Number(
        complaint.user_id
      ) !==
      userId
    ) {

      return res.status(403).json({

        success:
          false,

        message:
          "You are not allowed to acknowledge this complaint"

      });

    }


    if (
      complaint.status !==
      "resolved"
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Only resolved complaints can be acknowledged"

      });

    }


    if (
      complaint.acknowledged_at
    ) {

      return res.json({

        success:
          true,

        message:
          "Complaint was already acknowledged"

      });

    }


    await pool.execute(
      `
      UPDATE complaints

      SET

        status = 'closed',

        acknowledged_at =
          CURRENT_TIMESTAMP,

        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [
        complaintId
      ]
    );


    await pool.execute(
      `
      INSERT INTO complaint_status_history
      (
        complaint_id,

        old_status,

        new_status,

        changed_by,

        notes
      )

      VALUES
      (
        ?,
        'resolved',
        'closed',
        ?,
        'Resident acknowledged the resolution'
      )
      `,
      [
        complaintId,

        userId

      ]
    );


    return res.json({

      success:
        true,

      message:
        "Complaint resolution acknowledged"

    });

  } catch (
    error
  ) {

    console.error(
      "Acknowledge complaint error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to acknowledge complaint"

    });

  }

}


/* =========================================================
   COMPLAINT STATISTICS
========================================================= */

export async function getComplaintStats(
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

          COUNT(*) AS total_complaints,

          SUM(
            CASE
              WHEN status = 'open'
              THEN 1
              ELSE 0
            END
          ) AS open_complaints,

          SUM(
            CASE
              WHEN status = 'in_progress'
              THEN 1
              ELSE 0
            END
          ) AS in_progress_complaints,

          SUM(
            CASE
              WHEN status = 'resolved'
              THEN 1
              ELSE 0
            END
          ) AS resolved_complaints,

          SUM(
            CASE
              WHEN status = 'closed'
              THEN 1
              ELSE 0
            END
          ) AS closed_complaints,

          SUM(
            CASE
              WHEN priority = 'urgent'
              THEN 1
              ELSE 0
            END
          ) AS urgent_complaints,

          SUM(
            CASE
              WHEN
                sla_due_at IS NOT NULL
                AND sla_due_at < CURRENT_TIMESTAMP
                AND status NOT IN (
                  'resolved',
                  'closed',
                  'rejected'
                )
              THEN 1
              ELSE 0
            END
          ) AS breached_sla

        FROM complaints
        `
      );


    return res.json({

      success:
        true,

      data: {

        stats:
          (rows as any[])[0]

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Complaint statistics error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve complaint statistics"

    });

  }

}