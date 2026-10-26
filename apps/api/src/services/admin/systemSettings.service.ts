import prisma from "../prisma";
import { logInfo } from "./logger.service";

export interface UpdateSystemSettingsDTO {
  systemName?: string;
  institutionSubtitle?: string;
  logoUrl?: string | null;
  adminThemeId?: string;
  adminCustomColor?: string | null;
  reviewCenterThemeId?: string;
  reviewCenterCustomColor?: string | null;
}

const DEFAULT_SETTINGS = {
  systemName: "BoardQuest",
  institutionSubtitle: "SWU PHINMA",
  logoUrl: null,
  adminThemeId: "maroon-heritage",
  adminCustomColor: null,
  reviewCenterThemeId: "monochrome-zinc",
  reviewCenterCustomColor: null,
};

/**
 * Retrieves the global institutional system settings.
 * If no record exists in the database, automatically initializes with real institutional defaults.
 */
export async function getSystemSettingsService() {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        ...DEFAULT_SETTINGS,
        updatedBy: "System Initialization",
      },
    });
  }
  return settings;
}

/**
 * Updates the global institutional system settings.
 * Only SuperAdmin and Dean roles are authorized to invoke this via controller.
 */
export async function updateSystemSettingsService(
  data: UpdateSystemSettingsDTO,
  user?: { email?: string; id?: string; name?: string }
) {
  const userIdentifier = user?.email || user?.name || user?.id || "Admin";
  let settings = await prisma.systemSettings.findFirst();

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        systemName: data.systemName ?? DEFAULT_SETTINGS.systemName,
        institutionSubtitle: data.institutionSubtitle ?? DEFAULT_SETTINGS.institutionSubtitle,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : DEFAULT_SETTINGS.logoUrl,
        adminThemeId: data.adminThemeId ?? DEFAULT_SETTINGS.adminThemeId,
        adminCustomColor: data.adminCustomColor !== undefined ? data.adminCustomColor : null,
        reviewCenterThemeId: data.reviewCenterThemeId ?? DEFAULT_SETTINGS.reviewCenterThemeId,
        reviewCenterCustomColor: data.reviewCenterCustomColor !== undefined ? data.reviewCenterCustomColor : null,
        updatedBy: userIdentifier,
      },
    });
  } else {
    settings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        ...(data.systemName !== undefined && { systemName: data.systemName }),
        ...(data.institutionSubtitle !== undefined && { institutionSubtitle: data.institutionSubtitle }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.adminThemeId !== undefined && { adminThemeId: data.adminThemeId }),
        ...(data.adminCustomColor !== undefined && { adminCustomColor: data.adminCustomColor }),
        ...(data.reviewCenterThemeId !== undefined && { reviewCenterThemeId: data.reviewCenterThemeId }),
        ...(data.reviewCenterCustomColor !== undefined && { reviewCenterCustomColor: data.reviewCenterCustomColor }),
        updatedBy: userIdentifier,
      },
    });
  }

  try {
    await logInfo(
      "UPDATE_SYSTEM_SETTINGS",
      `System branding and theme settings updated by ${userIdentifier}.`,
      "SystemSettings",
      userIdentifier
    );
  } catch (err) {
    console.error("Failed to log system settings update:", err);
  }

  return settings;
}

/**
 * Resets the global system settings to institutional defaults.
 */
export async function resetSystemSettingsService(
  user?: { email?: string; id?: string; name?: string }
) {
  const userIdentifier = user?.email || user?.name || user?.id || "Admin";
  let settings = await prisma.systemSettings.findFirst();

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        ...DEFAULT_SETTINGS,
        updatedBy: userIdentifier,
      },
    });
  } else {
    settings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        ...DEFAULT_SETTINGS,
        updatedBy: userIdentifier,
      },
    });
  }

  try {
    await logInfo(
      "RESET_SYSTEM_SETTINGS",
      `System branding and theme settings reset to default by ${userIdentifier}.`,
      "SystemSettings",
      userIdentifier
    );
  } catch (err) {
    console.error("Failed to log system settings reset:", err);
  }

  return settings;
}
