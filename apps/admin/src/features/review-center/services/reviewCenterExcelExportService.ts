import * as XLSX from "xlsx";
import type { ReviewCenterCandidateWithScore } from "./reviewCenterPdfExportService";
import type { ReviewCenterRepresentative } from "../types/types";

export interface ExportReviewCenterToExcelOptions {
  filename?: string;
  reviewCenter?: ReviewCenterRepresentative | null;
  includeGameStats?: boolean;
  includeSchoolYear?: boolean;
}

/**
 * Export review center candidates list to an Excel (.xlsx) spreadsheet
 * Omits School ID and includes candidate score obtained in the review center
 */
export function exportReviewCenterCandidatesToExcel(
  candidates: ReviewCenterCandidateWithScore[],
  options: ExportReviewCenterToExcelOptions = {}
): void {
  const rcName = options.reviewCenter?.name
    ? `${options.reviewCenter.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_`
    : "";
  const {
    filename = `BoardQuest_${rcName}Candidates_${new Date().toISOString().slice(0, 10)}.xlsx`,
    includeGameStats = true,
    includeSchoolYear = true,
  } = options;

  // Header row - School ID removed, Review Center Score included
  const headers: string[] = ["#", "Candidate Name", "Email"];
  if (includeSchoolYear) {
    headers.push("School Year");
  }

  headers.push("Review Center Score (%)", "Assessment Status");

  if (includeGameStats) {
    headers.push("BoardQuest Level", "Total XP");
  }

  headers.push("Enrollment Status", "Enrolled Date");

  const rows: (string | number)[][] = [headers];

  candidates.forEach((c, idx) => {
    const fullName = c.name || "Unnamed Candidate";
    const email = c.email || "No email";
    const schoolYear = c.schoolYear || "Unassigned";

    // Score & Assessment Status
    let scoreText = "No Scores";
    let statusText = "Untested";
    if (c.scoreSummary && typeof c.scoreSummary.overallPercentage === "number") {
      const pct = Math.round(c.scoreSummary.overallPercentage * 10) / 10;
      scoreText = `${pct}%`;
      statusText = c.scoreSummary.isPassing ? "Passing" : "Failing";
    }

    const level = c.studentDetails?.level || 1;
    const xp = c.studentDetails?.xp || 0;
    const enrollmentStatus = (c.status || "ENROLLED").toUpperCase();
    const enrolledDate = (c.enrolledAt || c.createdAt)
      ? new Date(c.enrolledAt || c.createdAt!).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

    const row: (string | number)[] = [idx + 1, fullName, email];
    if (includeSchoolYear) {
      row.push(schoolYear);
    }
    row.push(scoreText, statusText);
    if (includeGameStats) {
      row.push(level, xp);
    }
    row.push(enrollmentStatus, enrolledDate);

    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column width formatting for Excel
  ws["!cols"] = [
    { wch: 6 },  // #
    { wch: 26 }, // Candidate Name
    { wch: 30 }, // Email
    ...(includeSchoolYear ? [{ wch: 16 }] : []), // School Year
    { wch: 24 }, // Review Center Score
    { wch: 18 }, // Assessment Status
    ...(includeGameStats ? [{ wch: 16 }, { wch: 12 }] : []), // Level, XP
    { wch: 18 }, // Status
    { wch: 16 }, // Enrolled
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidate Roster");
  XLSX.writeFile(wb, filename);
}
