import { Request, Response } from "express";
import { decodedId } from "../services/user.services";
import prisma from "../services/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";

export const me = asyncHandler(async (req, res) => {
  const token = req.cookies?.accessToken || req.cookies?.token;
  if (!token) {
    return new ApiResponse(401, null, "No token provided").send(res);
  }

  const id = decodedId(token);

  if (id === "superadmin-env-id" || id === (process.env.SUPERADMIN_EMAIL || "superadmin@boardquest.edu.ph")) {
    const superUser = {
      id: "superadmin-env-id",
      employeeId: process.env.SUPERADMIN_EMPLOYEE_ID || "SA-0001",
      name: process.env.SUPERADMIN_NAME || "System Super Administrator",
      email: process.env.SUPERADMIN_EMAIL || "superadmin@boardquest.edu.ph",
      username: process.env.SUPERADMIN_USERNAME || "superadmin",
      role: "SUPERADMIN",
    };
    return new ApiResponse(200, { user: superUser }, "User retrieved successfully").send(res);
  }

  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
    },
  });

  if (!user) {
    return new ApiResponse(404, null, "User not found").send(res);
  }

  return new ApiResponse(200, { user }, "User retrieved successfully").send(res);
});
