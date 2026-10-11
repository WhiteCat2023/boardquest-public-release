import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const cwd = process.cwd();
// const possiblePaths = [
//   path.resolve(cwd, ".env"),
//   path.resolve(cwd, "apps/api/.env"),
//   path.resolve(cwd, "../.env"),
//   path.resolve(cwd, "../../.env"),
// ];

// for (const p of possiblePaths) {
//   if (fs.existsSync(p)) {
//     dotenv.config({ path: p, override: true });
//   }
// }
// dotenv.config({ override: true });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { ensureSuperAdminExists } from "./services/admin/bootstrap.service";
import { startQueue, stopQueue } from "./services/queue.service";
// import { seedAdminUserDb } from "./services/prisma";

const app = express();

// Trust reverse proxy (Render, Cloudflare, Heroku, etc.)
// 1 = trust first hop (the load balancer/proxy in front of Express)
app.set("trust proxy", 1);
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
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

await ensureSuperAdminExists();
await startQueue(); 

app.use("/api", apiLimiter, apiRoutes);

const PORT = process.env.PORT;

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

