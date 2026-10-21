import { Request, Response } from "express";
import * as authService from "../../services/admin/auth.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { signJWT, verifyJWT } from "../../utils/jwt.utils";
import prisma from "../../services/prisma";
import { logInfo, logWarn } from "../../services/admin/logger.service";
import { isSuperAdmin, getSuperAdminProfile } from "../../config/credentials";
import { ensureSuperAdminExists } from "../../services/admin/bootstrap.service";
import { sendSecurityAlertEmail } from "../../services/mail.service";

// export const login = asyncHandler(async (req, res) => {
//   const user = await authService.login(req.body);
//   var accesstoken = "";

//   if(user){
//     accesstoken = generateToken(user.id);

//   }

//   res.cookie("token", accesstoken, {
//     httpOnly: true,
//     secure: false,
//     sameSite: "lax",
//     maxAge: 24 * 60 * 60 * 1000,
//   });
//   return new ApiResponse(200, { user }, "User login successfully").send(res);
// });

export const login = asyncHandler(async (req, res) => {
  let user;
  try {
    user = await authService.login(req.body);
  } catch (err: any) {
    const attemptedEmail = req.body?.email || "unknown";
    await logWarn(
      "AUTH_LOGIN_FAILED",
      `Failed login attempt for account "${attemptedEmail}". ${err.message || "Invalid credentials"}.`,
      "AuthService",
      attemptedEmail,
      req.ip,
      { error: err.message },
    );
    throw err;
  }

  if (!user) {
    const attemptedEmail = req.body?.email || "unknown";
    await logWarn(
      "AUTH_LOGIN_FAILED",
      `Failed login attempt for account "${attemptedEmail}". Invalid credentials.`,
      "AuthService",
      attemptedEmail,
      req.ip,
    );
    throw new ApiError(401, "Invalid credentials");
  }

  const accesstoken = signJWT(
    { id: user.id, email: user.email, role: user.role },
    "15m",
  );

  const refreshtoken = signJWT(
    { id: user.id, email: user.email, role: user.role },
    "1y",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("accessToken", accesstoken, cookieOptions);
  res.cookie("refreshToken", refreshtoken, cookieOptions);

  await logInfo(
    "USER_LOGIN_SUCCESS",
    `${user.role || "User"} (${user.email}) logged in successfully.`,
    "AuthService",
    user.email,
    req.ip,
  );

  try {
    const prefs = (user as any)?.notificationPreferences;
    const securityAlertsEnabled =
      prefs?.securityAlerts !== false && prefs?.securityAlerts !== undefined
        ? Boolean(prefs.securityAlerts)
        : true;

    if (securityAlertsEnabled && user.email) {
      sendSecurityAlertEmail({
        toEmail: user.email,
        userName: user.name,
        loginTime: new Date(),
        ipAddress: req.ip || (req.headers["x-forwarded-for"] as string) || "127.0.0.1",
        userAgent: (req.headers["user-agent"] as string) || "Browser",
        location: (user as any).location || "Philippines",
      }).catch((err) =>
        console.warn("Failed to send security alert email:", err?.message),
      );
    }
  } catch (alertErr) {
    console.warn("Security alert dispatch error:", alertErr);
  }

  return new ApiResponse(200, { user }, "User login successfully").send(res);
});

export const signup = asyncHandler(async (req, res) => {
  const newUser = await authService.signupAdmin(req.body);
  await logInfo(
    "ADMIN_SIGNUP",
    `Created new admin user account (${newUser.email}).`,
    "AuthService",
    newUser.email,
    req.ip,
  );
  return new ApiResponse(
    201,
    { user: newUser },
    "Admin user created successfully",
  ).send(res);
});

export const logout = async (req: Request, res: Response) => {
  try {
    let token = req.cookies?.accessToken || req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      const { payload } = verifyJWT(token);
      const userId = (payload as any)?.id;
      if (userId && !isSuperAdmin(userId)) {
        await prisma.adminUser
          .update({
            where: { id: userId },
            data: {
              isActive: false,
              lastActiveAt: new Date(),
            },
          })
          .catch(() => {});
      }
    }
  } catch (error) {
    console.error("Error updating user status during logout:", error);
  }

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("token", cookieOptions);

  res.status(200).json({ message: "User logged out successfully" });
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return new ApiResponse(401, null, "Refresh token not found").send(res);
  }

  const { payload, expired } = verifyJWT(refreshToken);

  if (expired || !payload) {
    return new ApiResponse(401, null, "Invalid or expired refresh token").send(
      res,
    );
  }

  const tokenPayload = payload as { id: string; email: string; role: string };

  let user: any = null;
  if (isSuperAdmin(tokenPayload.id)) {
    const dbSuperAdmin = await ensureSuperAdminExists();
    user = dbSuperAdmin || getSuperAdminProfile();
  } else {
    user = await (prisma as any).adminUser.findUnique({
      where: { id: tokenPayload.id },
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        location: true,
        accountStatus: true,
        isActive: true,
        mustChangePassword: true,
        termsAcceptedAt: true,
        handledSubjectIds: true,
        notificationPreferences: true,
        handledSubjects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  if (!user) {
    return new ApiResponse(401, null, "User not found").send(res);
  }

  if (!user.notificationPreferences) {
    user.notificationPreferences = {
      emailNotifications: true,
      securityAlerts: true,
      weeklyDigest: false,
    };
  }

  if (user.accountStatus === "DEACTIVATED") {
    return new ApiResponse(403, null, "Account is deactivated").send(res);
  }

  const isFacultyRole = ["DEAN", "TEAMLEAD", "TEACHER"].includes(
    String(user.role).toUpperCase(),
  );
  user.mustChangePassword = isFacultyRole
    ? user.mustChangePassword !== false
    : false;
  user.termsAcceptedAt = user.termsAcceptedAt || null;

  const newAccessToken = signJWT(
    { id: user.id, email: user.email, role: user.role },
    "15m",
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return new ApiResponse(
    200,
    {
      user,
      id: user.id,
      role: user.role,
      accessToken: newAccessToken,
    },
    "Token refreshed successfully",
  ).send(res);
};

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return new ApiResponse(
    200,
    result,
    "Password reset request processed successfully",
  ).send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return new ApiResponse(
    200,
    result,
    "Password has been successfully reset",
  ).send(res);
});

export const verifyResetToken = asyncHandler(async (req, res) => {
  const token = (req.query.token as string) || (req.body.token as string);
  const result = await authService.verifyResetToken(token);
  return new ApiResponse(
    200,
    result,
    "Reset token is valid",
  ).send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  let token = req.cookies?.accessToken || req.cookies?.token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return new ApiResponse(401, null, "Unauthorized").send(res);
  }

  const { payload } = verifyJWT(token);
  const userId = (payload as any)?.id;

  if (!userId) {
    return new ApiResponse(401, null, "Unauthorized").send(res);
  }

  const updatedUser = await authService.updateProfile(userId, req.body);
  return new ApiResponse(
    200,
    { user: updatedUser },
    "Profile updated successfully",
  ).send(res);
});

export const firstLoginSetup = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const updatedUser = await authService.firstLoginSetup(userId, req.body);

  await logInfo(
    "USER_FIRST_LOGIN_SETUP",
    `${updatedUser.role} (${updatedUser.email}) successfully completed first-login setup and accepted Terms and Data Privacy Act of 2012.`,
    "AuthService",
    updatedUser.email,
    req.ip,
  );

  return new ApiResponse(
    200,
    { user: updatedUser },
    "Password changed and policy agreement recorded successfully",
  ).send(res);
});

export const acceptTerms = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const updatedUser = await authService.acceptTerms(userId);

  await logInfo(
    "USER_TERMS_ACCEPTED",
    `${updatedUser.role} (${updatedUser.email}) accepted Terms and Conditions and Data Privacy Act of 2012.`,
    "AuthService",
    updatedUser.email,
    req.ip,
  );

  return new ApiResponse(
    200,
    { user: updatedUser },
    "Terms and conditions accepted successfully",
  ).send(res);
});
