import { AxiosInstance } from "@/utils/AxiosInstance";
import type { SystemBrandingSettings } from "../types/types";

export interface SystemSettingsApiResponse {
  statusCode: number;
  data: SystemBrandingSettings & {
    id?: string;
    updatedAt?: string;
  };
  message: string;
  success: boolean;
}

/**
 * Fetch global system settings from database.
 */
export async function getSystemSettingsApi(): Promise<SystemBrandingSettings> {
  const response = await AxiosInstance.get<SystemSettingsApiResponse>("/system-settings");
  return response.data.data;
}

/**
 * Persist updated system settings to MongoDB database.
 * Restricted to SuperAdmin and Dean.
 */
export async function updateSystemSettingsApi(
  payload: Partial<SystemBrandingSettings>
): Promise<SystemBrandingSettings> {
  const response = await AxiosInstance.put<SystemSettingsApiResponse>("/system-settings", payload);
  return response.data.data;
}

/**
 * Reset system settings to institutional defaults in MongoDB.
 * Restricted to SuperAdmin and Dean.
 */
export async function resetSystemSettingsApi(): Promise<SystemBrandingSettings> {
  const response = await AxiosInstance.post<SystemSettingsApiResponse>("/system-settings/reset");
  return response.data.data;
}
