import {
  Server
} from "socket.io";

import type {
  Server as HttpServer
} from "http";

import pool from "../config/database.js";

import {
  verifyToken
} from "../utils/jwt.js";


let io:
  Server | null =
  null;


/* =========================================================
   INITIALIZE SOCKET.IO
========================================================= */

export function initializeSocket(
  httpServer:
    HttpServer
) {

  io =
    new Server(
      httpServer,
      {
        cors: {
          origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",

          credentials:
            true
        }
      }
    );

  io.use((socket, next) => {
    try {
      const token =
        typeof socket.handshake.auth?.token === "string"
          ? socket.handshake.auth.token
          : "";

      if (!token) {
        return next(new Error("Authentication required"));
      }

      socket.data.user = verifyToken(token);
      return next();
    } catch {
      return next(new Error("Invalid or expired authentication token"));
    }
  });


  io.on(
    "connection",
    socket => {

      console.log(
        "Realtime client connected:",
        socket.id
      );


      socket.on(
        "join-user",
        (
          userId:
            number
        ) => {

          const id =
            Number(
              userId
            );


          if (
            Number.isInteger(
              id
            ) &&
            id > 0 &&
            id === Number(socket.data.user?.id)
          ) {

            socket.join(
              `user:${id}`
            );

          }

        }
      );


      socket.on(
        "join-community",
        async (
          groupId:
            number
        ) => {

          const id =
            Number(
              groupId
            );


          if (
            Number.isInteger(
              id
            ) &&
            id > 0
          ) {

            const userId = Number(socket.data.user?.id);
            const role = String(socket.data.user?.role || "");
            const isModerator = role === "admin" || role === "committee";

            if (!isModerator) {
              try {
                const [rows] = await pool.execute(
                  "SELECT id FROM community_members WHERE group_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
                  [id, userId]
                );

                if (!(rows as { id: number }[]).length) {
                  return;
                }
              } catch (error) {
                console.error("Realtime community authorization error:", error);
                return;
              }
            }

            socket.join(
              `community:${id}`
            );

          }

        }
      );


      socket.on(
        "leave-community",
        (
          groupId:
            number
        ) => {

          const id =
            Number(
              groupId
            );


          if (
            Number.isInteger(
              id
            ) &&
            id > 0
          ) {

            socket.leave(
              `community:${id}`
            );

          }

        }
      );


      socket.on(
        "disconnect",
        () => {

          console.log(
            "Realtime client disconnected:",
            socket.id
          );

        }
      );

    }
  );


  return io;

}


/* =========================================================
   GET SOCKET INSTANCE
========================================================= */

export function getSocket() {

  return io;

}


/* =========================================================
   EMIT USER EVENT
========================================================= */

export function emitToUser(
  userId:
    number,

  event:
    string,

  payload:
    unknown
) {

  if (
    !io
  ) {

    return;

  }


  const id =
    Number(
      userId
    );


  if (
    !Number.isInteger(
      id
    ) ||
    id <= 0
  ) {

    return;

  }


  io.to(
    `user:${id}`
  ).emit(
    event,
    payload
  );

}


/* =========================================================
   EMIT COMMUNITY EVENT
========================================================= */

export function emitToCommunity(
  groupId:
    number,

  event:
    string,

  payload:
    unknown
) {

  if (
    !io
  ) {

    return;

  }


  const id =
    Number(
      groupId
    );


  if (
    !Number.isInteger(
      id
    ) ||
    id <= 0
  ) {

    return;

  }


  io.to(
    `community:${id}`
  ).emit(
    event,
    payload
  );

}


/* =========================================================
   BROADCAST SYSTEM EVENT
========================================================= */

export function emitRealtime(
  event:
    string,

  payload:
    unknown
) {

  if (
    !io
  ) {

    return;

  }


  io.emit(
    event,
    payload
  );

}