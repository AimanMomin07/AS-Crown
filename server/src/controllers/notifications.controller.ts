import {
  Request,
  Response
} from "express";

import pool from "../config/database.js";

import {
  createUserNotification
} from "../utils/notification.js";


/* =========================================================
   AUTH USER
========================================================= */

function getUserId(
  req: any
): number {

  const userId =
    Number(
      req.user?.id
    );


  return Number.isInteger(
    userId
  ) && userId > 0
    ? userId
    : 0;

}


/* =========================================================
   GET NOTIFICATIONS
========================================================= */

export async function getNotifications(
  req: Request,
  res: Response
) {

  try {

    const userId =
      getUserId(
        req
      );


    if (
      !userId
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Authentication required"

      });

    }


    const type =
      String(
        req.query.type ||
        ""
      ).trim();


    const unreadOnly =
      String(
        req.query.unreadOnly ||
        ""
      ).toLowerCase() ===
      "true";


    const conditions:
      string[] = [
        "user_id = ?"
      ];


    const params:
      any[] = [
        userId
      ];


    if (
      type
    ) {

      conditions.push(
        "type = ?"
      );

      params.push(
        type
      );

    }


    if (
      unreadOnly
    ) {

      conditions.push(
        "is_read = 0"
      );

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          id,
          user_id,
          title,
          message,
          type,
          is_read,
          read_at,
          created_at

        FROM notifications

        WHERE
          ${conditions.join(
            " AND "
          )}

        ORDER BY
          created_at DESC
        `,
        params
      );


    return res.json({

      success:
        true,

      data: {

        notifications:
          rows

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get notifications error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve notifications"

    });

  }

}


/* =========================================================
   GET UNREAD COUNT
========================================================= */

export async function getUnreadNotificationCount(
  req: Request,
  res: Response
) {

  try {

    const userId =
      getUserId(
        req
      );


    if (
      !userId
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

          COUNT(*) AS unread_count

        FROM notifications

        WHERE
          user_id = ?

          AND is_read = 0
        `,
        [
          userId
        ]
      );


    const unreadCount =
      Number(
        (rows as any[])[0]
          ?.unread_count ||
        0
      );


    return res.json({

      success:
        true,

      data: {

        unreadCount

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Unread notification count error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to retrieve unread notification count"

    });

  }

}


/* =========================================================
   MARK ONE READ
========================================================= */

export async function markNotificationRead(
  req: Request,
  res: Response
) {

  try {

    const userId =
      getUserId(
        req
      );


    const id =
      Number(
        req.params.id
      );


    if (
      !userId
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Authentication required"

      });

    }


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
          "Invalid notification ID"

      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        UPDATE notifications

        SET

          is_read = 1,

          read_at =
            CURRENT_TIMESTAMP

        WHERE

          id = ?

          AND user_id = ?

          AND is_read = 0
        `,
        [
          id,
          userId
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
          "Notification not found or already read"

      });

    }


    return res.json({

      success:
        true,

      message:
        "Notification marked as read"

    });

  } catch (
    error
  ) {

    console.error(
      "Mark notification read error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to update notification"

    });

  }

}


/* =========================================================
   MARK ALL READ
========================================================= */

export async function markAllNotificationsRead(
  req: Request,
  res: Response
) {

  try {

    const userId =
      getUserId(
        req
      );


    if (
      !userId
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Authentication required"

      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        UPDATE notifications

        SET

          is_read = 1,

          read_at =
            CURRENT_TIMESTAMP

        WHERE

          user_id = ?

          AND is_read = 0
        `,
        [
          userId
        ]
      );


    return res.json({

      success:
        true,

      message:
        "All notifications marked as read",

      data: {

        updated:
          Number(
            (result as any)
              .affectedRows ||
            0
          )

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Mark all notifications read error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to mark all notifications as read"

    });

  }

}


/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export async function createNotification(
  req: Request,
  res: Response
) {

  try {

    const body =
      req.body ??
      {};


    const userId =
      Number(
        body.userId
      );


    const title =
      String(
        body.title ||
        ""
      ).trim();


    const message =
      String(
        body.message ||
        ""
      ).trim();


    const type =
      String(
        body.type ||
        "system"
      ).trim();


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Valid userId is required"

      });

    }


    if (
      !title
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Notification title is required"

      });

    }


    if (
      !message
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Notification message is required"

      });

    }


    const allowedTypes = [

      "system",
      "announcement",
      "payment",
      "complaint",
      "visitor",
      "security",
      "other"

    ];


    if (
      !allowedTypes.includes(
        type
      )
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Invalid notification type"

      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          type,
          is_read
        )

        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          0
        )
        `,
        [
          userId,
          title,
          message,
          type
        ]
      );


    return res.status(201).json({

      success:
        true,

      message:
        "Notification created successfully",

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
      "Create notification error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to create notification"

    });

  }

}