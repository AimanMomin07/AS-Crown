import pool from "../config/database.js";

import {
  emitToUser
} from "../realtime/socket.js";


export type NotificationType =
  | "system"
  | "announcement"
  | "payment"
  | "complaint"
  | "visitor"
  | "security"
  | "other";


export interface CreateNotificationInput {

  userId:
    number;

  title:
    string;

  message:
    string;

  type?:
    NotificationType;

}


const VALID_TYPES:
  NotificationType[] = [

  "system",

  "announcement",

  "payment",

  "complaint",

  "visitor",

  "security",

  "other"

];


/* =========================================================
   CREATE ONE USER NOTIFICATION
   Supports BOTH existing calling styles:

   1) Object:
      createUserNotification({
        userId,
        title,
        message,
        type
      });

   2) Positional:
      createUserNotification(
        userId,
        title,
        message,
        type
      );
========================================================= */

export async function createUserNotification(
  input:
    CreateNotificationInput
): Promise<number>;

export async function createUserNotification(
  userId:
    number,

  title:
    string,

  message:
    string,

  type?:
    NotificationType
): Promise<number>;

export async function createUserNotification(
  inputOrUserId:
    CreateNotificationInput |
    number,

  titleArg?:
    string,

  messageArg?:
    string,

  typeArg?:
    NotificationType
) {

  const input:
    CreateNotificationInput =
    typeof inputOrUserId ===
    "number"

      ? {

          userId:
            inputOrUserId,

          title:
            titleArg ||
            "",

          message:
            messageArg ||
            "",

          type:
            typeArg ||
            "system"

        }

      : {

          userId:
            Number(
              inputOrUserId.userId
            ),

          title:
            String(
              inputOrUserId.title ||
              ""
            ),

          message:
            String(
              inputOrUserId.message ||
              ""
            ),

          type:
            inputOrUserId.type ||
            "system"

        };


  const userId =
    Number(
      input.userId
    );


  const title =
    String(
      input.title ||
      ""
    ).trim();


  const message =
    String(
      input.message ||
      ""
    ).trim();


  const type =
    input.type ||
    "system";


  if (
    !Number.isInteger(
      userId
    ) ||
    userId <= 0
  ) {

    throw new Error(
      "Invalid notification user ID"
    );

  }


  if (
    !title
  ) {

    throw new Error(
      "Notification title is required"
    );

  }


  if (
    !message
  ) {

    throw new Error(
      "Notification message is required"
    );

  }


  if (
    !VALID_TYPES.includes(
      type
    )
  ) {

    throw new Error(
      "Invalid notification type"
    );

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


  const notificationId =
    Number(
      (
        result as any
      ).insertId
    );


  /* =======================================================
     REALTIME EVENT
  ======================================================= */

  emitToUser(
    userId,

    "notification:new",

    {
      id:
        notificationId,

      userId,

      title,

      message,

      type,

      isRead:
        0,

      createdAt:
        new Date()
          .toISOString()
    }
  );


  return notificationId;

}


/* =========================================================
   CREATE MANY USER NOTIFICATIONS
   Supports BOTH existing calling styles:

   1) Object:
      createManyUserNotifications(
        userIds,
        {
          title,
          message,
          type
        }
      );

   2) Positional:
      createManyUserNotifications(
        userIds,
        title,
        message,
        type
      );
========================================================= */

export async function createManyUserNotifications(
  userIds:
    number[],

  input:
    {
      title:
        string;

      message:
        string;

      type?:
        NotificationType;
    }
): Promise<number>;

export async function createManyUserNotifications(
  userIds:
    number[],

  title:
    string,

  message:
    string,

  type?:
    NotificationType
): Promise<number>;

export async function createManyUserNotifications(
  userIds:
    number[],

  inputOrTitle:
    {
      title:
        string;

      message:
        string;

      type?:
        NotificationType;
    } |
    string,

  messageArg?:
    string,

  typeArg?:
    NotificationType
) {

  const input =
    typeof inputOrTitle ===
    "string"

      ? {

          title:
            inputOrTitle,

          message:
            messageArg ||
            "",

          type:
            typeArg ||
            "system"

        }

      : {

          title:
            inputOrTitle.title,

          message:
            inputOrTitle.message,

          type:
            inputOrTitle.type ||
            "system"

        };


  const uniqueUserIds =
    [
      ...new Set(

        userIds

          .map(
            Number
          )

          .filter(
            id =>
              Number.isInteger(
                id
              ) &&
              id > 0
          )

      )
    ];


  if (
    uniqueUserIds.length ===
    0
  ) {

    return 0;

  }


  const title =
    String(
      input.title ||
      ""
    ).trim();


  const message =
    String(
      input.message ||
      ""
    ).trim();


  const type =
    input.type ||
    "system";


  if (
    !title
  ) {

    throw new Error(
      "Notification title is required"
    );

  }


  if (
    !message
  ) {

    throw new Error(
      "Notification message is required"
    );

  }


  if (
    !VALID_TYPES.includes(
      type
    )
  ) {

    throw new Error(
      "Invalid notification type"
    );

  }


  let created =
    0;


  for (
    const userId
    of uniqueUserIds
  ) {

    await createUserNotification(

      userId,

      title,

      message,

      type

    );


    created++;

  }


  return created;

}
