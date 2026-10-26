import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  getSystemSettingsService,
  updateSystemSettingsService,
  resetSystemSettingsService,
} from "../../services/admin/systemSettings.service";

/**
 * Public or authenticated endpoint to retrieve current system settings & branding.
 */
export const getSystemSettingsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const settings = await getSystemSettingsService();
    return new ApiResponse(200, settings, "System settings retrieved successfully").send(res);
  }
);

/**
 * SuperAdmin & Dean only endpoint to update institutional branding & themes.
 */
export const updateSystemSettingsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      systemName,
      institutionSubtitle,
      logoUrl,
      adminThemeId,
      adminCustomColor,
      reviewCenterThemeId,
      reviewCenterCustomColor,
    } = req.body;

    const updated = await updateSystemSettingsService(
      {
        systemName,
        institutionSubtitle,
        logoUrl,
        adminThemeId,
        adminCustomColor,
        reviewCenterThemeId,
        reviewCenterCustomColor,
      },
      req.user
    );

    return new ApiResponse(200, updated, "System settings saved successfully").send(res);
  }
);

/**
 * SuperAdmin & Dean only endpoint to reset institutional branding & themes to default.
 */
export const resetSystemSettingsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const reset = await resetSystemSettingsService(req.user);
    return new ApiResponse(200, reset, "System settings reset to default").send(res);
  }
);
