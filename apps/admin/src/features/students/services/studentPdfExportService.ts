import type { AxiosInstance } from "axios";
import type { Student } from "../types/types";

export interface GenerateStudentsPdfOptions {
  title?: string;
  subtitle?: string;
  institutionName?: string;
  students: Student[];
  mode?: "comprehensive" | "roster_only" | "at_risk";
  includeMetrics?: boolean;
  includeContactInfo?: boolean;
  generatedBy?: string;
  filterLabels?: string[];
}

/**
 * Fetch all students from the API for complete export (retrieving large batch)
 */
export async function fetchAllStudents(
  axiosPrivate: AxiosInstance
): Promise<Student[]> {
  try {
    const response = await axiosPrivate.get("/students/get", {
      params: {
        skip: 0,
        take: 1000,
      },
    });

    const resData = response.data?.data;
    if (Array.isArray(resData)) {
      return resData;
    }
    return resData?.data || resData?.students || [];
  } catch (err: any) {
    console.error("Failed to fetch students for PDF export:", err);
    throw new Error(
      err?.response?.data?.message || "Failed to load students roster for PDF export."
    );
  }
}

/**
 * Helper to escape HTML characters in strings for safe rendering in print HTML
 */
function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate a beautifully styled, print-ready HTML document for the students roster.
 * Optimized for crisp vector PDF output via browser Print-to-PDF in A4 Landscape.
 */
export function generateStudentsPdfHtml(options: GenerateStudentsPdfOptions): string {
  const {
    title = "BoardQuest Student Directory & Advising Roster",
    subtitle = "Official Academic Standing, Calendar Pace, and Guidance Distribution Report",
    institutionName = "BoardQuest Evaluation & Review System",
    students = [],
    mode = "comprehensive",
    includeMetrics = true,
    includeContactInfo = true,
    generatedBy = "Academic Administrator",
    filterLabels = [],
  } = options;

  const totalCount = students.length;
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Calculate cohort summaries
  let passingCount = 0;
  let failingCount = 0;
  let untestedCount = 0;

  let onTrackCount = 0;
  let behindCount = 0;
  let criticalCount = 0;
  let notScheduledCount = 0;

  let withGuidanceCount = 0;

  let totalReadinessSum = 0;
  let testedStudentsCount = 0;
  let highProbCount = 0;
  let inTrainingCount = 0;
  let remediationCount = 0;

  for (const s of students) {
    // Standing
    const standing = (s.academicStanding || "UNTESTED").toUpperCase();
    if (standing === "PASSING") passingCount++;
    else if (standing === "FAILING") failingCount++;
    else untestedCount++;

    // Pace
    const pace = (s.calendarPace?.status || "NOT_SCHEDULED").toUpperCase();
    if (pace === "ON_TRACK") onTrackCount++;
    else if (pace === "BEHIND") behindCount++;
    else if (pace === "CRITICAL") criticalCount++;
    else notScheduledCount++;

    // Guidance
    const active =
      s.activeGuidance ||
      (s.guidanceAssignments || []).find(
        (g: any) =>
          String(g.status).toUpperCase() === "PENDING" ||
          String(g.status).toUpperCase() === "IN_PROGRESS"
      );
    if (active) withGuidanceCount++;

    // Readiness
    const scorecard = s.scorecardSummary;
    const metrics = s.subjectMetrics || [];
    let rScore = 0;
    if ((s as any).readinessScore !== undefined && (s as any).readinessScore !== null) {
      rScore = Number((s as any).readinessScore);
    } else if (typeof scorecard?.avgProficiency === "number") {
      rScore = scorecard.avgProficiency;
    } else if (metrics.length > 0) {
      rScore = metrics.reduce((sum: number, m: any) => sum + (m.proficiency || 0), 0) / metrics.length;
    } else if (typeof s.avgAccuracy === "number") {
      rScore = s.avgAccuracy;
    }

    if (standing !== "UNTESTED" || rScore > 0) {
      testedStudentsCount++;
      totalReadinessSum += rScore;
      if (rScore >= 75) highProbCount++;
      else if (rScore >= 60) inTrainingCount++;
      else remediationCount++;
    }
  }

  const overallReadinessAvg =
    testedStudentsCount > 0
      ? Math.round((totalReadinessSum / testedStudentsCount) * 10) / 10
      : 0;

  const overallReadinessColor =
    overallReadinessAvg >= 75
      ? "#047857"
      : overallReadinessAvg >= 60
      ? "#d97706"
      : "#b91c1c";

  const filterDescriptor =
    filterLabels.length > 0 ? ` &bull; ${filterLabels.map(escapeHtml).join(" &bull; ")}` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 32px 36px;
      font-size: 9pt;
      line-height: 1.45;
    }

    /* ── Document Header ── */
    .doc-header {
      border-bottom: 2px solid #a70202;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .brand-block {
      flex: 1;
    }

    .institution-tag {
      font-size: 8pt;
      font-weight: 700;
      color: #a70202;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }

    .doc-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px 0;
      letter-spacing: -0.02em;
    }

    .doc-subtitle {
      font-size: 8.5pt;
      color: #475569;
      margin: 0;
    }

    .header-badge-box {
      text-align: right;
      font-size: 8pt;
      color: #64748b;
      min-width: 140px;
    }

    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      margin-bottom: 3px;
    }

    /* ── Overview Statistics Cards ── */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 14px;
    }

    .overview-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .overview-label {
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }

    .overview-value {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
    }

    .overview-subtext {
      font-size: 7pt;
      color: #64748b;
    }

    /* ── Main Students Table ── */
    .roster-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
    }

    .roster-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7pt;
      letter-spacing: 0.04em;
      border: 1px solid #cbd5e1;
      padding: 7px 8px;
      text-align: left;
    }

    .roster-table td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      vertical-align: middle;
    }

    .roster-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    .col-num {
      width: 32px;
      text-align: center;
      font-weight: 700;
      color: #64748b;
    }

    .student-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 9pt;
    }

    .student-email {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 1px;
    }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .badge-passing {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge-failing {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .badge-untested {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .badge-ontrack {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge-behind {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .badge-critical {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .badge-notscheduled {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .badge-readiness-high {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge-readiness-mid {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .badge-readiness-low {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .proficiency-bar-bg {
      background: #f1f5f9;
      height: 4px;
      border-radius: 9999px;
      overflow: hidden;
      width: 55px;
      margin-top: 3px;
    }

    .proficiency-bar-fill {
      height: 100%;
      border-radius: 9999px;
    }

    .signature-line {
      border-bottom: 1.5px solid #94a3b8;
      height: 18px;
      min-width: 110px;
    }

    /* ── Document Footer ── */
    .doc-footer {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 7.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media print {
      body {
        padding: 12mm 10mm !important;
        margin: 0 !important;
        max-width: 100% !important;
        font-size: 8pt;
      }
      .roster-table td {
        padding: 4px 6px;
      }
    }
  </style>
</head>
<body>

  <!-- Document Header -->
  <div class="doc-header">
    <div class="brand-block">
      <div class="institution-tag">${escapeHtml(institutionName)}</div>
      <h1 class="doc-title">${escapeHtml(title)}</h1>
      <p class="doc-subtitle">${escapeHtml(subtitle)}${filterDescriptor}</p>
    </div>
    <div class="header-badge-box">
      <div class="status-badge">&bull; OFFICIAL ROSTER</div>
      <div><strong>Total Enrolled:</strong> ${totalCount} Students</div>
      <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
    </div>
  </div>

  <!-- Summary Statistics Overview Grid -->
  <!-- Summary Statistics Overview Grid -->
  <div class="overview-grid">
    <div class="overview-item">
      <span class="overview-label">Total Cohort</span>
      <span class="overview-value">${totalCount}</span>
      <span class="overview-subtext">Active Students</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Overall Readiness</span>
      <span class="overview-value" style="color: ${overallReadinessColor};">${overallReadinessAvg}%</span>
      <span class="overview-subtext">${highProbCount} Benchmark Met &bull; ${inTrainingCount} Training</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Academic Standing</span>
      <span class="overview-value" style="color: ${passingCount > 0 ? '#047857' : failingCount > 0 ? '#b91c1c' : '#475569'};">${passingCount} Pass / ${failingCount} Fail</span>
      <span class="overview-subtext">${untestedCount} Untested</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Calendar Pace</span>
      <span class="overview-value" style="color: ${criticalCount > 0 ? '#b91c1c' : '#047857'};">${onTrackCount} On-Track</span>
      <span class="overview-subtext">${behindCount} Behind &bull; ${criticalCount} Critical</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Guidance Assigned</span>
      <span class="overview-value" style="color: #a70202;">${withGuidanceCount}</span>
      <span class="overview-subtext">Under Active Outreach</span>
    </div>
  </div>

  <!-- Main Roster Table -->
  <table class="roster-table">
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th>Student Profile</th>
        ${includeContactInfo ? "<th>Location / Campus</th>" : ""}
        ${
          mode === "roster_only"
            ? `
          <th>Level / XP</th>
          <th>Enrollment Date</th>
          <th>Attendance / Signature</th>
        `
            : `
          <th>Academic Standing</th>
          <th>Board Readiness</th>
          <th>Calendar Pace</th>
          <th>Advising / Guidance Status</th>
        `
        }
      </tr>
    </thead>
    <tbody>
      ${
        students.length === 0
          ? `<tr><td colspan="${includeContactInfo ? 7 : 6}" style="text-align: center; padding: 24px; color: #64748b;">No student records found matching the active filter criteria.</td></tr>`
          : students
              .map((s, idx) => {
                const fullName =
                  s.name ||
                  [s.firstName, s.lastName].filter(Boolean).join(" ") ||
                  "Unnamed Student";
                const email = s.email || "No email";
                const location = s.location || s.userSettings?.school || "Main Campus";
                const level = s.level || 1;
                const xp = (s.xp || 0).toLocaleString();

                // Standing (WITHOUT percentage)
                const standing = (s.academicStanding || "UNTESTED").toUpperCase();
                let standingBadge = `<span class="badge badge-untested">Untested</span>`;
                if (standing === "PASSING") {
                  standingBadge = `<span class="badge badge-passing">&check; Passing</span>`;
                } else if (standing === "FAILING") {
                  standingBadge = `<span class="badge badge-failing">&excl; Failing</span>`;
                }

                // Readiness & Proficiency
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
                const displayScore = readinessScore > 0 ? readinessScore : avgProficiency;

                let readinessHtml = `<span style="color: #94a3b8; font-size: 7.5pt;">Untested</span>`;
                if (!isUntested || displayScore > 0) {
                  const profColor = displayScore >= 75 ? "#047857" : displayScore >= 60 ? "#b45309" : "#b91c1c";
                  readinessHtml = `
                    <div style="font-size: 8pt; font-weight: 700; color: ${profColor};">
                      ${displayScore}%
                    </div>
                    <div class="proficiency-bar-bg">
                      <div class="proficiency-bar-fill" style="width: ${Math.min(100, Math.max(0, displayScore))}%; background: ${profColor};"></div>
                    </div>
                  `;
                }

                // Pace
                const pace = (s.calendarPace?.status || "NOT_SCHEDULED").toUpperCase();
                const lag = s.calendarPace?.lagPercent;
                const lagStr = lag && lag > 0 ? ` (-${Math.round(lag)}%)` : "";
                let paceBadge = `<span class="badge badge-notscheduled">Unscheduled</span>`;
                if (pace === "ON_TRACK") {
                  paceBadge = `<span class="badge badge-ontrack">On Track</span>`;
                } else if (pace === "BEHIND") {
                  paceBadge = `<span class="badge badge-behind">Behind${lagStr}</span>`;
                } else if (pace === "CRITICAL") {
                  paceBadge = `<span class="badge badge-critical">Critical${lagStr}</span>`;
                }

                // Guidance
                const activeGuidance =
                  s.activeGuidance ||
                  (s.guidanceAssignments || []).find(
                    (g: any) =>
                      String(g.status).toUpperCase() === "PENDING" ||
                      String(g.status).toUpperCase() === "IN_PROGRESS"
                  );
                const guidanceBadge = activeGuidance
                  ? `<span class="badge badge-behind" style="border-color:#f59e0b; color:#b45309;">Assigned (${escapeHtml(
                      (activeGuidance.assignedTo as any)?.name || (activeGuidance.advisor as any)?.name || "Advisor"
                    )})</span>`
                  : `<span style="color: #94a3b8; font-size: 7.5pt;">Unassigned</span>`;

                const formattedDate = s.createdAt
                  ? new Date(s.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A";

                if (mode === "roster_only") {
                  return `
                    <tr>
                      <td class="col-num">${idx + 1}</td>
                      <td>
                        <div class="student-name">${escapeHtml(fullName)}</div>
                        <div class="student-email">${escapeHtml(email)}</div>
                      </td>
                      ${includeContactInfo ? `<td>${escapeHtml(location)}</td>` : ""}
                      <td>Level ${level} (${xp} XP)</td>
                      <td>${escapeHtml(formattedDate)}</td>
                      <td><div class="signature-line"></div></td>
                    </tr>
                  `;
                }

                return `
                  <tr>
                    <td class="col-num">${idx + 1}</td>
                    <td>
                      <div class="student-name">${escapeHtml(fullName)}</div>
                      <div class="student-email">${escapeHtml(email)} &bull; Lvl ${level} (${xp} XP)</div>
                    </td>
                    ${includeContactInfo ? `<td>${escapeHtml(location)}</td>` : ""}
                    <td>${standingBadge}</td>
                    <td>${readinessHtml}</td>
                    <td>${paceBadge}</td>
                    <td>${guidanceBadge}</td>
                  </tr>
                `;
              })
              .join("")
      }
    </tbody>
  </table>

  <!-- Document Footer -->
  <div class="doc-footer">
    <div>Generated by: <strong>${escapeHtml(generatedBy)}</strong> &bull; BoardQuest Administration</div>
    <div>Official Student Cohort Document &bull; Confidential Academic Record</div>
  </div>

</body>
</html>`;
}

/**
 * Trigger print dialog using an invisible iframe
 */
export function printStudentsPdf(htmlContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const existing = document.getElementById("boardquest-students-print-iframe");
      if (existing) {
        existing.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "boardquest-students-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        throw new Error("Unable to access print frame document.");
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 350);
    } catch (err) {
      reject(err);
    }
  });
}
