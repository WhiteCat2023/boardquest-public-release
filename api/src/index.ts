import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import departmentRoutes from "./routes/admin/department.routes";
import questionRoutes from "./routes/admin/question.routes";
import studentRoutes from "./routes/admin/student.routes";
import facultyRoutes from "./routes/admin/faculty.routes";
import analyticsRoutes from "./routes/admin/analytics.routes";
import reviewCenterRoutes from "./routes/admin/reviewCenter.routes";
import logsRoutes from "./routes/admin/logs.routes";
import cors from "cors";
// import gameRoutes from "./routes/admin/game_module/game.routes";
import { seedAdminUserDb } from "./services/prisma";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { startQueue, stopQueue } from "./services/queue.service";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", apiLimiter);

// await seedAdminUserDb();
await startQueue();

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/review-center", reviewCenterRoutes);
app.use("/api/logs", logsRoutes);
// app.use("/api/game", gameRoutes);

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



