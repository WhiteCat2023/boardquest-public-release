/**
 * Reusable utility functions for student board readiness scores, tiers, and formatting.
 */

export interface ReadinessTierInfo {
  tier: "High Probability" | "In Training" | "Needs Remediation";
  badgeClass: string;
  gaugeColor: string;
  textColor: string;
  benchmarkMet: boolean;
}

/**
 * Format a readiness score to a clean 1-decimal-place representation (e.g., "68.3%").
 */
export function formatReadinessScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return "0%";
  const num = typeof score === "number" ? score : Number(score);
  return `${num % 1 !== 0 ? num.toFixed(1) : num}%`;
}

/**
 * Calculate the arithmetic mean of subject proficiencies rounded to 1 decimal place.
 */
export function calculateReadinessScore(
  items: (number | { proficiency?: number | null })[]
): number {
  if (!items || items.length === 0) return 0;
  const scores = items.map((item) =>
    typeof item === "number" ? item : (item.proficiency ?? 0)
  );
  const total = scores.reduce((sum, s) => sum + (s || 0), 0);
  return Math.round((total / scores.length) * 10) / 10;
}

/**
 * Get standardized styling, labels, and benchmark indicators for a readiness score.
 * Thresholds:
 * - >= 75%: High Probability / Benchmark Met (Emerald)
 * - >= 60%: In Training (Amber)
 * - < 60%: Needs Remediation (Rose)
 */
export function getReadinessTier(score: number | null | undefined): ReadinessTierInfo {
  const num = score ?? 0;
  if (num >= 75) {
    return {
      tier: "High Probability",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      gaugeColor: "oklch(0.6 0.18 145)",
      textColor: "text-emerald-600 dark:text-emerald-400",
      benchmarkMet: true,
    };
  }
  if (num >= 60) {
    return {
      tier: "In Training",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      gaugeColor: "oklch(0.7 0.18 80)",
      textColor: "text-amber-600 dark:text-amber-400",
      benchmarkMet: false,
    };
  }
  return {
    tier: "Needs Remediation",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    gaugeColor: "oklch(0.6 0.22 25)",
    textColor: "text-rose-600 dark:text-rose-400",
    benchmarkMet: false,
  };
}
