import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { prisma } from "./models/prisma";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log(" Connected to SQLite database via Prisma ORM");

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` MineSight Backend API is running!`);
      console.log(` Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(` Port        : ${PORT}`);
      console.log(` Healthcheck : http://localhost:${PORT}/api/v1/health`);
      console.log(` Overview    : http://localhost:${PORT}/api/v1/metrics/overview`);
      console.log(` Contractors : http://localhost:${PORT}/api/v1/contractors`);
      console.log(` Observations: http://localhost:${PORT}/api/v1/observations`);
      console.log(`=========================================`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Gracefully closing server...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("Database connection closed. Process exited.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

