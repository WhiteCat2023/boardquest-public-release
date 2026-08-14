import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { ensureSuperAdminExists } from "./services/admin/bootstrap.service";
import { startQueue, stopQueue } from "./services/queue.service";
import { seedAdminUserDb } from "./services/prisma";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:8080",
  "http://localhost:8081",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.onrender\.com$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, true);
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

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
