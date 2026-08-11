import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import apiRoutes from "./routes";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { ensureSuperAdminExists } from "./services/admin/bootstrap.service";
import { startQueue, stopQueue } from "./services/queue.service";
import { seedAdminUserDb } from "./services/prisma";

const app = express();
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

await seedAdminUserDb();
await ensureSuperAdminExists();
await startQueue();

app.use("/api", apiLimiter, apiRoutes);

const server = app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

// Graceful shutdown handling for Agenda and Express
const gracefulShutdown = async () => {
  console.log("Received kill signal, shutting down gracefully...");
  server.close(async () => {
    console.log("HTTP server closed.");
    await stopQueue();
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
