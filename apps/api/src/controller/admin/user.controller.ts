import { Request, Response } from "express";
import { decodedId } from "../../services/user.service";
import prisma from "../../services/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ensureSuperAdminExists } from "../../services/admin/bootstrap.service";
import { isSuperAdmin, getSuperAdminProfile } from "../../config/credentials";

export const me = asyncHandler(async (req, res) => {
  const token = req.cookies?.accessToken || req.cookies?.token;
  if (!token) {
    return new ApiResponse(401, null, "No token provided").send(res);
  }

  const id = decodedId(token);

  if (isSuperAdmin(id)) {
    const dbSuperAdmin = await ensureSuperAdminExists();
    const superUser = dbSuperAdmin || getSuperAdminProfile();
    return new ApiResponse(
      200,
      { user: superUser },
      "User retrieved successfully",
    ).send(res);
  }

  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      handledCategoryIds: true,
      handledCategories: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    return new ApiResponse(404, null, "User not found").send(res);
  }

  return new ApiResponse(200, { user }, "User retrieved successfully").send(
    res,
  );
});
