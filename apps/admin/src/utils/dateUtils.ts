/**
 * Formats a date string or Date object into a readable US date string (e.g., "Aug 4, 2026").
 * Returns "N/A" if input is undefined, null, or invalid date.
 */
export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export {
  evaluateScheduleStatus,
  getScheduleStatus,
  getScheduleStatusLabel,
  getScheduleStatusBadgeConfig,
} from "@/features/review-center/utils/scheduleUtils";
export type { ScheduleStatus } from "@/features/review-center/utils/scheduleUtils";
