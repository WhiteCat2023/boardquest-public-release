export type ScheduleStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

/**
 * Parses a date string (YYYY-MM-DD, ISO string, etc.) or Date into a Date object set to local midnight (00:00:00.000).
 * Handles string splitting to prevent timezone shift issues with date-only strings.
 */
export function toMidnight(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  const str = String(dateInput).trim();
  if (!str) return null;

  // Handle YYYY-MM-DD specifically
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Automatically evaluates the current status of a schedule based on start date and end date.
 *
 * Evaluation rules:
 * - UPCOMING: Current date is before the start date (schedule has not started yet).
 * - ONGOING: Current date is on or between start date and end date inclusive (currently active).
 * - COMPLETED: Current date is after the end date (schedule has ended).
 *
 * @param startDate Start date (YYYY-MM-DD, ISO, or Date)
 * @param endDate End date (YYYY-MM-DD, ISO, or Date)
 * @param referenceDate Optional reference date (defaults to today)
 * @returns ScheduleStatus ("UPCOMING" | "ONGOING" | "COMPLETED")
 */
export function evaluateScheduleStatus(
  startDate?: string | Date | null,
  endDate?: string | Date | null,
  referenceDate: Date = new Date()
): ScheduleStatus {
  if (!startDate || !endDate) {
    return "UPCOMING";
  }

  const start = toMidnight(startDate);
  const end = toMidnight(endDate);
  const current = toMidnight(referenceDate) || new Date();
  current.setHours(0, 0, 0, 0);

  if (!start || !end) {
    return "UPCOMING";
  }

  const currentTime = current.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();

  if (currentTime < startTime) {
    return "UPCOMING";
  }

  if (currentTime > endTime) {
    return "COMPLETED";
  }

  return "ONGOING";
}

// Alias for convenience
export const getScheduleStatus = evaluateScheduleStatus;

/**
 * Returns a human-friendly label for a given schedule status.
 */
export function getScheduleStatusLabel(status?: string | null): string {
  const norm = String(status || "").toUpperCase().trim();
  switch (norm) {
    case "ONGOING":
    case "ACTIVE":
      return "Ongoing";
    case "COMPLETED":
      return "Completed";
    case "UPCOMING":
    default:
      return "Upcoming";
  }
}

/**
 * Returns badge styling attributes and indicator colors for a given schedule status.
 */
export function getScheduleStatusBadgeConfig(status?: string | null) {
  const norm = String(status || "").toUpperCase().trim();
  switch (norm) {
    case "ONGOING":
    case "ACTIVE":
      return {
        status: "ONGOING" as ScheduleStatus,
        label: "Ongoing",
        badgeClass:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        containerClass:
          "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
        dotClass: "bg-emerald-500 animate-pulse",
        description: "Schedule is currently active and running",
      };
    case "COMPLETED":
      return {
        status: "COMPLETED" as ScheduleStatus,
        label: "Completed",
        badgeClass:
          "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        containerClass:
          "bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300",
        dotClass: "bg-blue-500",
        description: "Schedule period has concluded",
      };
    case "UPCOMING":
    default:
      return {
        status: "UPCOMING" as ScheduleStatus,
        label: "Upcoming",
        badgeClass:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        containerClass:
          "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300",
        dotClass: "bg-amber-500",
        description: "Schedule starts in the future",
      };
  }
}
