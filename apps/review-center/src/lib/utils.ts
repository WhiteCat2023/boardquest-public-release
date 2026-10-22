import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a raw input string into a School Year format "YYYY-YYYY".
 * - Strips any non-digit characters.
 * - Automatically inserts hyphen after the 4th digit.
 * - Restricts input to maximum 8 digits (e.g., 20262027 -> 2026-2027).
 */
export function formatSchoolYearInput(input: string): string {
  if (!input) return "";
  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/**
 * Normalizes school year on blur or submission.
 * If the user enters only 4 digits (e.g., "2026"), automatically completes to "2026-2027".
 */
export function normalizeSchoolYear(input: string): string {
  if (!input) return "";
  const digits = input.replace(/\D/g, "");
  if (digits.length === 4) {
    const start = parseInt(digits, 10);
    if (!isNaN(start) && start >= 1900 && start <= 2100) {
      return `${start}-${start + 1}`;
    }
  }
  return formatSchoolYearInput(input);
}

/**
 * Validates if the given school year matches the "YYYY-YYYY" format.
 */
export function isValidSchoolYear(input: string): boolean {
  return /^\d{4}-\d{4}$/.test(input.trim());
}
