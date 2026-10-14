import type { AxiosInstance } from "axios";
import type { ReviewCenterCandidateItem } from "../api/useReviewCenter";
import type { ReviewCenterRepresentative } from "../types/types";

export interface CandidateScoreSummary {
  overallPercentage: number | null;
  isPassing: boolean;
  totalScore: number;
  totalMaxScore: number;
  assessmentsCount: number;
}

export type ReviewCenterCandidateWithScore = ReviewCenterCandidateItem & {
  scoreSummary?: CandidateScoreSummary | null;
  gwa?: number | null;
};

export interface GenerateReviewCenterPdfOptions {
  title?: string;
  subtitle?: string;
  institutionName?: string;
  reviewCenter?: ReviewCenterRepresentative | null;
  candidates: ReviewCenterCandidateWithScore[];
  mode?: "comprehensive" | "attendance_roster" | "game_status";
  includeGameStats?: boolean;
  includeSchoolYear?: boolean;
  generatedBy?: string;
  filterLabels?: string[];
}

/**
 * Fetch all candidates for a specific review center, enriched with assessment scores
 */
export async function fetchReviewCenterCandidates(
  axiosPrivate: AxiosInstance,
  reviewCenterId: string,
  params?: { schoolYear?: string; search?: string }
): Promise<{
  candidates: ReviewCenterCandidateWithScore[];
  schoolYears: string[];
}> {
  try {
    const [response, assessmentsRes] = await Promise.all([
      axiosPrivate.get(`/review-center/${reviewCenterId}/candidates`, { params }),
      axiosPrivate.get(`/review-center/${reviewCenterId}/assessments`).catch(() => null),
    ]);

    const resData = response.data?.data;
    let candidatesList: ReviewCenterCandidateItem[] = [];
    let schoolYears: string[] = [];

    if (resData && Array.isArray(resData.candidates)) {
      candidatesList = resData.candidates;
      schoolYears = resData.schoolYears || [];
    } else if (Array.isArray(resData)) {
      candidatesList = resData;
    }

    // Build map from assessment grade matrix rows
    const matrixRows = assessmentsRes?.data?.data?.rows || [];
    const scoreMap = new Map<string, CandidateScoreSummary>();
    for (const r of matrixRows) {
      if (r?.candidate?.id && r.summary) {
        scoreMap.set(r.candidate.id, r.summary);
      }
      if (r?.candidate?.email && r.summary) {
        scoreMap.set(r.candidate.email.toLowerCase(), r.summary);
      }
    }

    const enrichedCandidates: ReviewCenterCandidateWithScore[] = candidatesList.map((c) => {
      const summary =
        scoreMap.get(c.id) ||
        (c.email ? scoreMap.get(c.email.toLowerCase()) : null) ||
        null;
      return {
        ...c,
        scoreSummary: summary,
      };
    });

    return { candidates: enrichedCandidates, schoolYears };
  } catch (err: any) {
    console.error("Failed to fetch review center candidates for PDF export:", err);
    throw new Error(
      err?.response?.data?.message || "Failed to load candidates for PDF export."
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
 * Generate a beautifully styled, print-ready HTML document for the review center candidates roster.
 * Optimized for crisp vector PDF output via browser Print-to-PDF in A4 Landscape.
 */
export function generateReviewCenterPdfHtml(
  options: GenerateReviewCenterPdfOptions
): string {
  const {
    title,
    subtitle,
    institutionName = "BoardQuest Partner Review Center Network",
    reviewCenter,
    candidates = [],
    mode = "comprehensive",
    includeGameStats = true,
    includeSchoolYear = true,
    generatedBy = "Review Center Coordinator",
    filterLabels = [],
  } = options;

  const totalCount = candidates.length;
  const companyName = reviewCenter?.companyName || "Review Center Partner";
  const location = reviewCenter?.location || "Philippines";
  const partnerCode = reviewCenter?.employeeId || "RC-PARTNER";

  const resolvedTitle =
    title || `${companyName} - Candidate Examination Roster`;
  const resolvedSubtitle =
    subtitle ||
    `Official Registry of Enrolled Candidates & BoardQuest Preparation Performance`;

  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Calculate cohort summaries
  let registeredInGameCount = 0;
  let unregisteredCount = 0;
  let enrolledCount = 0;

  let totalScoreSum = 0;
  let scoredCandidateCount = 0;
  let passingCandidateCount = 0;
  let failingCandidateCount = 0;

  const schoolYearMap = new Map<string, number>();

  for (const c of candidates) {
    const isPlaying = Boolean(c.studentId || c.studentDetails);
    if (isPlaying) registeredInGameCount++;
    else unregisteredCount++;

    if ((c.status || "ENROLLED").toUpperCase() === "ENROLLED") {
      enrolledCount++;
    }

    const sy = (c.schoolYear || "Unassigned").trim();
    schoolYearMap.set(sy, (schoolYearMap.get(sy) || 0) + 1);

    const summary = c.scoreSummary;
    if (summary && typeof summary.overallPercentage === "number") {
      totalScoreSum += summary.overallPercentage;
      scoredCandidateCount++;
      if (summary.isPassing) passingCandidateCount++;
      else failingCandidateCount++;
    } else if (typeof c.gwa === "number") {
      totalScoreSum += c.gwa;
      scoredCandidateCount++;
      if (c.gwa >= 75) passingCandidateCount++;
      else failingCandidateCount++;
    }
  }

  const schoolYearList = Array.from(schoolYearMap.keys()).sort();
  const cohortScoreAvg =
    scoredCandidateCount > 0
      ? Math.round((totalScoreSum / scoredCandidateCount) * 10) / 10
      : null;

  const filterDescriptor =
    filterLabels.length > 0
      ? ` &bull; ${filterLabels.map(escapeHtml).join(" &bull; ")}`
      : "";

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
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
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

    /* ── Main Candidates Table ── */
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

    .candidate-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 9pt;
    }

    .candidate-email {
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

    .badge-enrolled {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge-sy {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .badge-game-active {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .badge-game-unregistered {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #cbd5e1;
    }

    .badge-score-passing {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge-score-failing {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .badge-untested {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #cbd5e1;
    }

    .signature-line {
      border-bottom: 1.5px solid #94a3b8;
      height: 18px;
      min-width: 120px;
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
      <h1 class="doc-title">${escapeHtml(resolvedTitle)}</h1>
      <p class="doc-subtitle">
        Partner: <strong>${escapeHtml(companyName)}</strong> &bull; Location: ${escapeHtml(location)} &bull; Code: ${escapeHtml(partnerCode)}${filterDescriptor}
      </p>
    </div>
    <div class="header-badge-box">
      <div class="status-badge">&bull; VERIFIED PARTNER</div>
      <div><strong>Enrolled Candidates:</strong> ${totalCount}</div>
      <div><strong>Date:</strong> ${escapeHtml(generatedAt)}</div>
    </div>
  </div>

  <!-- Summary Statistics Overview Grid -->
  <div class="overview-grid">
    <div class="overview-item">
      <span class="overview-label">Total Candidates</span>
      <span class="overview-value">${totalCount}</span>
      <span class="overview-subtext">Active Reviewees</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Review Center Score</span>
      <span class="overview-value" style="color: ${cohortScoreAvg !== null ? (cohortScoreAvg >= 75 ? '#047857' : '#b91c1c') : '#475569'};">${cohortScoreAvg !== null ? `${cohortScoreAvg}%` : "No Scores Yet"}</span>
      <span class="overview-subtext">${scoredCandidateCount > 0 ? `${passingCandidateCount} Passing &bull; ${failingCandidateCount} Failing` : "Awaiting Assessments"}</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">BoardQuest Preparation</span>
      <span class="overview-value" style="color: #92400e;">${registeredInGameCount} Playing</span>
      <span class="overview-subtext">${unregisteredCount} Unregistered</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">School Years Covered</span>
      <span class="overview-value">${schoolYearList.length > 0 ? schoolYearList.join(", ") : "Current"}</span>
      <span class="overview-subtext">Academic Cohorts</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Enrollment Status</span>
      <span class="overview-value" style="color: #047857;">${enrolledCount} Enrolled</span>
      <span class="overview-subtext">Official Registry</span>
    </div>
  </div>

  <!-- Main Candidates Table -->
  <table class="roster-table">
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th>Candidate Information</th>
        <th>Review Center Score</th>
        ${includeSchoolYear ? "<th>School Year</th>" : ""}
        ${
          mode === "attendance_roster"
            ? `
          <th>Status</th>
          <th>Enrollment Date</th>
          <th>Candidate Signature / Sign-Off</th>
        `
            : mode === "game_status"
            ? `
          <th>BoardQuest Status</th>
          <th>Level & Experience</th>
          <th>Streak</th>
          <th>Account Verification</th>
        `
            : `
          <th>BoardQuest Game Status</th>
          <th>Enrollment Status</th>
          <th>Enrolled Date</th>
        `
        }
      </tr>
    </thead>
    <tbody>
      ${
        candidates.length === 0
          ? `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">No candidate records found matching the active filter criteria.</td></tr>`
          : candidates
              .map((c, idx) => {
                const name = c.name || "Candidate Name";
                const email = c.email || "No email";
                const schoolYear = c.schoolYear ? `S.Y. ${c.schoolYear}` : "Unassigned";
                const isPlaying = Boolean(c.studentId || c.studentDetails);
                const level = c.studentDetails?.level || 1;
                const xp = (c.studentDetails?.xp || 0).toLocaleString();
                const streak = c.studentDetails?.streak || 0;
                const verified = c.studentDetails?.verified;

                const enrolledDate = c.enrolledAt || c.createdAt;
                const formattedDate = enrolledDate
                  ? new Date(enrolledDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A";

                let gameBadge = `<span class="badge badge-game-unregistered">Not in Game</span>`;
                if (isPlaying) {
                  gameBadge = `<span class="badge badge-game-active">&bull; Lv ${level} (${xp} XP)</span>`;
                }

                // Review Center Assessment Score Badge
                const summary = c.scoreSummary;
                let scoreBadge = `<span class="badge badge-untested">No Scores</span>`;
                if (summary && typeof summary.overallPercentage === "number") {
                  const pct = Math.round(summary.overallPercentage * 10) / 10;
                  if (summary.isPassing) {
                    scoreBadge = `<span class="badge badge-score-passing">&check; ${pct}% &bull; Passing</span>`;
                  } else {
                    scoreBadge = `<span class="badge badge-score-failing">&excl; ${pct}% &bull; Failing</span>`;
                  }
                } else if (typeof c.gwa === "number") {
                  const gwa = Math.round(c.gwa * 10) / 10;
                  if (gwa >= 75) {
                    scoreBadge = `<span class="badge badge-score-passing">&check; ${gwa}% &bull; Passing</span>`;
                  } else {
                    scoreBadge = `<span class="badge badge-score-failing">&excl; ${gwa}% &bull; Failing</span>`;
                  }
                }

                if (mode === "attendance_roster") {
                  return `
                    <tr>
                      <td class="col-num">${idx + 1}</td>
                      <td>
                        <div class="candidate-name">${escapeHtml(name)}</div>
                        <div class="candidate-email">${escapeHtml(email)}</div>
                      </td>
                      <td>${scoreBadge}</td>
                      ${includeSchoolYear ? `<td><span class="badge badge-sy">${escapeHtml(schoolYear)}</span></td>` : ""}
                      <td><span class="badge badge-enrolled">${escapeHtml(c.status || "ENROLLED")}</span></td>
                      <td>${escapeHtml(formattedDate)}</td>
                      <td><div class="signature-line"></div></td>
                    </tr>
                  `;
                }

                if (mode === "game_status") {
                  return `
                    <tr>
                      <td class="col-num">${idx + 1}</td>
                      <td>
                        <div class="candidate-name">${escapeHtml(name)}</div>
                        <div class="candidate-email">${escapeHtml(email)}</div>
                      </td>
                      <td>${scoreBadge}</td>
                      ${includeSchoolYear ? `<td><span class="badge badge-sy">${escapeHtml(schoolYear)}</span></td>` : ""}
                      <td>${gameBadge}</td>
                      <td>${isPlaying ? `Level ${level} (${xp} XP)` : "No game activity"}</td>
                      <td>${isPlaying ? `${streak} days` : "—"}</td>
                      <td>${isPlaying ? (verified ? "Verified" : "Registered") : "Pending"}</td>
                    </tr>
                  `;
                }

                // Default comprehensive
                return `
                  <tr>
                    <td class="col-num">${idx + 1}</td>
                    <td>
                      <div class="candidate-name">${escapeHtml(name)}</div>
                      <div class="candidate-email">${escapeHtml(email)}</div>
                    </td>
                    <td>${scoreBadge}</td>
                    ${includeSchoolYear ? `<td><span class="badge badge-sy">${escapeHtml(schoolYear)}</span></td>` : ""}
                    <td>${gameBadge}</td>
                    <td><span class="badge badge-enrolled">${escapeHtml(c.status || "ENROLLED")}</span></td>
                    <td>${escapeHtml(formattedDate)}</td>
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
    <div>Official Review Center Partner Document &bull; Confidential Candidate Roster</div>
  </div>

</body>
</html>`;
}

/**
 * Trigger print dialog using an invisible iframe
 */
export function printReviewCenterPdf(htmlContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const existing = document.getElementById("boardquest-reviewcenter-print-iframe");
      if (existing) {
        existing.remove();
      }

      const iframe = document.createElement("iframe");
      iframe.id = "boardquest-reviewcenter-print-iframe";
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
