import * as XLSX from "xlsx";
import type { Student } from "../types/types";

export interface ExportStudentsToExcelOptions {
  filename?: string;
  mode?: "comprehensive" | "roster_only" | "at_risk";
  includeContactInfo?: boolean;
  includeMetrics?: boolean;
  institutionName?: string;
}

/**
 * Export filtered students list to an Excel (.xlsx) spreadsheet
 */
export function exportStudentsToExcel(
  students: Student[],
  options: ExportStudentsToExcelOptions = {}
): void {
  const {
    filename = `BoardQuest_Students_${new Date().toISOString().slice(0, 10)}.xlsx`,
    mode = "comprehensive",
    includeContactInfo = true,
  } = options;

  // Build table headers
  const headers: string[] = ["#", "Student Name", "Email"];
  if (includeContactInfo) {
    headers.push("Campus / Location");
  }

  if (mode === "roster_only") {
    headers.push("Level", "XP", "Enrollment Date");
  } else {
    headers.push(
      "Academic Standing",
      "Board Readiness (%)",
      "Calendar Pace",
      "Pace Schedule Lag",
      "Advising Status",
      "Assigned Advisor",
      "Level",
      "XP",
      "Streak (Days)",
      "Enrollment Date"
    );
  }

  const rows: (string | number)[][] = [headers];

  students.forEach((s, idx) => {
    const fullName =
      s.name ||
      [s.firstName, s.lastName].filter(Boolean).join(" ") ||
      "Unnamed Student";
    const email = s.email || "No email";
    const location = s.location || s.userSettings?.school || "Main Campus";
    const level = s.level || 1;
    const xp = s.xp || 0;
    const streak = s.streak || 0;
    const standing = (s.academicStanding || "UNTESTED").toUpperCase();

    // Standing text
    const standingText =
      standing === "PASSING" ? "Passing" : standing === "FAILING" ? "Failing" : "Untested";

    // Board Readiness score
    const scorecard = s.scorecardSummary;
    const metrics = s.subjectMetrics || [];

    let avgProficiency = 0;
    if (typeof scorecard?.avgProficiency === "number" && !isNaN(scorecard.avgProficiency)) {
      avgProficiency = scorecard.avgProficiency;
    } else if (metrics.length > 0) {
      const totalProf = metrics.reduce((sum: number, m: any) => sum + (m.proficiency || 0), 0);
      avgProficiency = Math.round((totalProf / metrics.length) * 10) / 10;
    } else if (typeof s.avgAccuracy === "number" && !isNaN(s.avgAccuracy)) {
      avgProficiency = Math.round(s.avgAccuracy * 10) / 10;
    }

    let readinessScore = 0;
    if ((s as any).readinessScore !== undefined && (s as any).readinessScore !== null) {
      readinessScore = Number((s as any).readinessScore);
    } else if (typeof scorecard?.avgProficiency === "number") {
      readinessScore = scorecard.avgProficiency;
    } else if (metrics.length > 0) {
      const totalScore = metrics.reduce((sum: number, m: any) => sum + (m.proficiency || 0), 0);
      readinessScore = Math.round((totalScore / metrics.length) * 10) / 10;
    } else {
      readinessScore = avgProficiency;
    }

    readinessScore = Math.round(readinessScore * 10) / 10;
    const isUntested = standing === "UNTESTED" && readinessScore === 0;
    const displayReadiness = readinessScore > 0 ? readinessScore : avgProficiency;
    const readinessText = isUntested && displayReadiness === 0 ? "Untested" : `${displayReadiness}%`;

    // Calendar Pace
    const pace = (s.calendarPace?.status || "NOT_SCHEDULED").toUpperCase();
    const lag = s.calendarPace?.lagPercent;
    const paceText =
      pace === "ON_TRACK"
        ? "On Track"
        : pace === "BEHIND"
        ? "Behind"
        : pace === "CRITICAL"
        ? "Critical"
        : "Unscheduled";
    const lagText = lag && lag > 0 ? `-${Math.round(lag)}%` : "0%";

    // Advising & Guidance
    const activeGuidance =
      s.activeGuidance ||
      (s.guidanceAssignments || []).find(
        (g: any) =>
          String(g.status).toUpperCase() === "PENDING" ||
          String(g.status).toUpperCase() === "IN_PROGRESS"
      );
    const guidanceStatus = activeGuidance ? "Assigned" : "Unassigned";
    const advisorName = activeGuidance
      ? (activeGuidance.assignedTo as any)?.name ||
        (activeGuidance.advisor as any)?.name ||
        "Academic Advisor"
      : "None";

    const enrolledDate = s.createdAt
      ? new Date(s.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

    const row: (string | number)[] = [idx + 1, fullName, email];
    if (includeContactInfo) {
      row.push(location);
    }

    if (mode === "roster_only") {
      row.push(level, xp, enrolledDate);
    } else {
      row.push(
        standingText,
        readinessText,
        paceText,
        lagText,
        guidanceStatus,
        advisorName,
        level,
        xp,
        streak,
        enrolledDate
      );
    }

    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column width formatting for Microsoft Excel / Google Sheets
  ws["!cols"] = [
    { wch: 6 },  // #
    { wch: 26 }, // Name
    { wch: 30 }, // Email
    ...(includeContactInfo ? [{ wch: 22 }] : []), // Campus
    ...(mode === "roster_only"
      ? [
          { wch: 10 }, // Level
          { wch: 12 }, // XP
          { wch: 16 }, // Enrolled
        ]
      : [
          { wch: 18 }, // Standing
          { wch: 18 }, // Board Readiness
          { wch: 16 }, // Pace
          { wch: 18 }, // Lag
          { wch: 16 }, // Guidance Status
          { wch: 24 }, // Advisor
          { wch: 10 }, // Level
          { wch: 12 }, // XP
          { wch: 14 }, // Streak
          { wch: 16 }, // Enrolled
        ]),
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = mode === "roster_only" ? "Student Roster" : "Students Performance";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
