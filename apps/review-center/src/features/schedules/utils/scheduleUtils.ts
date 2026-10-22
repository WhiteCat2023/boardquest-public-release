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

export const getScheduleStatus = evaluateScheduleStatus;

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
