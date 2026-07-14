import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import departmentRoutes from "./routes/admin/department.routes";
import questionRoutes from "./routes/admin/question.routes";
import studentRoutes from "./routes/admin/student.routes";
import facultyRoutes from "./routes/admin/faculty.routes";
import analyticsRoutes from "./routes/admin/analytics.routes";
import cors from "cors";
// import gameRoutes from "./routes/admin/game_module/game.routes";
import { seedAdminUserDb } from "./services/prisma";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
await seedAdminUserDb();

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/analytics", analyticsRoutes);
// app.use("/api/game", gameRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


