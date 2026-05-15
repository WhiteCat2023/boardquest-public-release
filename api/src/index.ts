import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import departmentRoutes from "./routes/admin/department.routes";
import questionRoutes from "./routes/admin/question.routes";
// import { seedAdminUserDb } from "./services/prisma";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// await seedAdminUserDb();

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/questions", questionRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


