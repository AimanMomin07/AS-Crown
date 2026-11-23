import dotenv from "dotenv";

import {
  createServer
} from "http";

import app from "./app.js";

import pool from "./config/database.js";

import {
  initializeSocket
} from "./realtime/socket.js";


dotenv.config();


const PORT =
  Number(
    process.env.PORT ||
    5000
  );


async function startServer() {

  try {

    const connection =
      await pool.getConnection();


    console.log(
      "✅ MySQL database connected"
    );


    console.log(
      `📦 Database: ${process.env.DB_NAME}`
    );


    connection.release();


    /* =====================================================
       HTTP SERVER
    ===================================================== */

    const httpServer =
      createServer(
        app
      );


    /* =====================================================
       SOCKET.IO
    ===================================================== */

    initializeSocket(
      httpServer
    );


    /* =====================================================
       START SERVER
    ===================================================== */

    httpServer.listen(
      PORT,
      () => {

        console.log("");

        console.log(
          "===================================="
        );

        console.log(
          "       AS CROWN BACKEND"
        );

        console.log(
          "===================================="
        );

        console.log(
          `🚀 Server: http://localhost:${PORT}`
        );

        console.log(
          `❤️ Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          `⚡ Realtime: Socket.IO enabled`
        );

        console.log(
          "===================================="
        );

        console.log("");

      }
    );

  } catch (
    error
  ) {

    console.error(
      "❌ Database connection failed:"
    );

    console.error(
      error
    );

    process.exit(
      1
    );

  }

}


void startServer();