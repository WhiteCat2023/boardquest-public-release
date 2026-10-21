import fs from "fs";
import path from "path";

function getBase64Asset(relativePath: string, mime: string): string {
  try {
    const candidates = [
      path.resolve(__dirname, "../../assets", relativePath),
      path.resolve(process.cwd(), "src/assets", relativePath),
      path.resolve(process.cwd(), "apps/api/src/assets", relativePath),
      path.resolve(process.cwd(), "../admin/src/assets", relativePath),
      path.resolve(process.cwd(), "apps/admin/src/assets", relativePath),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        return `data:${mime};base64,${buf.toString("base64")}`;
      }
    }
  } catch (e) {
    console.error("Failed to load asset for grade report:", relativePath, e);
  }
  return "";
}

/**
 * Grade Report & Certificate HTML/PDF generator for Review Center Students.
 */

export interface StudentGradeReportData {
  companyName: string;
  logoUrl?: string | null;
  candidateName: string;
  candidateEmail: string;
  schoolId?: string | null;
  schoolYear: string;
  batch?: string | null;
  subject: string;
  assessmentTitle: string;
  customLabel?: string | null;
  assessmentDate?: string | null;
  score: number | null;
  maxScore: number;
  percentage: number | null;
  percentile: number | null;
  status: string; // PRESENT | ABSENT | EXCUSED | INCOMPLETE
  passingRate: number; // e.g. 75
  meanScore?: number | null;
  medianScore?: number | null;
  modeScore?: number[] | null;
  remarks?: string | null;
  recordedBy?: string | null;
  generatedAt?: string;
}

/**
 * Generate a styled, printable HTML grade slip that renders cleanly as PDF or in browser.
 */
export function generateStudentGradeReportHtml(data: StudentGradeReportData): string {
  const isPresent = data.status === "PRESENT";
  const hasScore = data.score !== null && data.score !== undefined;
  const isPassed = hasScore && data.percentage !== null && data.percentage >= (data.passingRate || 75);

  let statusColor = "#ca8a04";
  let statusLabel = data.status;

  if (isPresent) {
    if (hasScore) {
      statusColor = isPassed ? "#16a34a" : "#dc2626";
      statusLabel = isPassed ? "PASSED" : "FAILED";
    } else {
      statusColor = "#64748b";
      statusLabel = "PENDING / UNRECORDED";
    }
  }

  const modeDisplay = data.modeScore && data.modeScore.length > 0
    ? data.modeScore.join(", ")
    : "N/A (Uniform)";

  const medtechLogo = getBase64Asset("medtech_logo.jpg", "image/jpeg");
  const swuLogo = getBase64Asset("swu-logo.png", "image/png");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Grade Report - ${data.candidateName}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { margin: 0; padding: 24px; color: #1e293b; background: #ffffff; }
    .report-card { max-width: 760px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 12px; padding: 32px; position: relative; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; text-transform: uppercase; }
    .brand-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
    .doc-badge { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #334155; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-group { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
    .info-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .info-value { font-size: 15px; font-weight: 600; color: #0f172a; }
    
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 12px; }
    
    .score-banner { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .score-number { font-size: 36px; font-weight: 900; color: #0f172a; }
    .score-pct { font-size: 18px; font-weight: 700; color: #64748b; }
    .status-badge { display: inline-block; padding: 8px 20px; border-radius: 9999px; font-size: 16px; font-weight: 800; color: #ffffff; background: ${statusColor}; text-transform: uppercase; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px; }
    .stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    
    .remarks-box { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px; margin-bottom: 24px; }
    .remarks-text { font-size: 13px; color: #92400e; line-height: 1.5; margin-top: 4px; }
    
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
    .seal-text { font-size: 11px; color: #94a3b8; line-height: 1.4; }
    .signature-area { text-align: right; }
    .sign-line { width: 180px; border-bottom: 1px solid #0f172a; margin-bottom: 4px; margin-left: auto; }
    .sign-title { font-size: 11px; font-weight: 700; color: #475569; }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${medtechLogo ? `<img src="${medtechLogo}" alt="MedTech Logo" style="height: 52px; width: auto; max-width: 60px; object-fit: contain; border-radius: 6px; background: #ffffff; padding: 2px;" />` : ""}
        <div>
          <div class="brand-title">${escapeHtml(data.companyName)}</div>
          <div class="brand-subtitle">Official Student Assessment & Performance Report</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <div class="doc-badge">Official Grade Slip</div>
        ${swuLogo ? `<img src="${swuLogo}" alt="SWU Logo" style="height: 52px; width: auto; max-width: 60px; object-fit: contain; border-radius: 4px;" />` : ""}
      </div>
    </div>

    <div class="grid-2">
      <div class="info-group">
        <div class="info-label">Candidate Information</div>
        <div class="info-value">${escapeHtml(data.candidateName)}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
          ${data.schoolId ? `ID: ${escapeHtml(data.schoolId)} | ` : ""}${escapeHtml(data.candidateEmail)}
        </div>
      </div>
      <div class="info-group">
        <div class="info-label">Academic Term</div>
        <div class="info-value">School Year ${escapeHtml(data.schoolYear)}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Subject: ${escapeHtml(data.subject)}</div>
      </div>
    </div>

    <div class="section-title">Assessment Result</div>
    <div class="score-banner">
      <div>
        <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
          ${escapeHtml(data.assessmentTitle)} ${data.customLabel ? `(${escapeHtml(data.customLabel)})` : ""}
        </div>
        <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 6px;">
          <span class="score-number">${data.score !== null ? data.score : "—"}</span>
          <span class="score-pct">/ ${data.maxScore} (${data.percentage !== null ? data.percentage.toFixed(1) + "%" : "N/A"})</span>
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
          Passing Cutoff: ${data.passingRate}% • Date: ${data.assessmentDate || "Recorded"}
        </div>
      </div>
      <div class="status-badge">${statusLabel}</div>
    </div>

    <div class="section-title">Cohort Comparative Statistics</div>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-lbl">Class Mean (Average)</div>
        <div class="stat-val">${data.meanScore !== null && data.meanScore !== undefined ? data.meanScore.toFixed(1) : "—"}</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">Class Median</div>
        <div class="stat-val">${data.medianScore !== null && data.medianScore !== undefined ? data.medianScore.toFixed(1) : "—"}</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">Class Mode</div>
        <div class="stat-val" style="font-size: 14px;">${modeDisplay}</div>
      </div>
      <div class="stat-box" style="border-color: #3b82f6; background: #eff6ff;">
        <div class="stat-lbl" style="color: #1d4ed8;">Your Percentile Rank</div>
        <div class="stat-val" style="color: #1e40af;">${data.percentile !== null && data.percentile !== undefined ? data.percentile.toFixed(1) + "th" : "—"}</div>
      </div>
    </div>

    ${data.remarks ? `
    <div class="remarks-box">
      <div class="info-label" style="color: #b45309;">Instructor Remarks & Feedback</div>
      <div class="remarks-text">${escapeHtml(data.remarks)}</div>
    </div>
    ` : ""}

    <div class="footer">
      <div class="seal-text">
        Generated electronically via BoardQuest Review Center System.<br>
        Date Generated: ${data.generatedAt || new Date().toLocaleDateString("en-PH", { dateStyle: "long" })}<br>
        Multi-Tenant Verified: ${escapeHtml(data.companyName)}
      </div>
      <div class="signature-area">
        <div class="sign-line"></div>
        <div class="sign-title">Review Center Representative</div>
        <div style="font-size: 10px; color: #94a3b8;">${data.recordedBy ? escapeHtml(data.recordedBy) : "Authorized Signatory"}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
