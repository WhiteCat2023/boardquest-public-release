import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, GraduationCap, Award, FileText } from "lucide-react";
import type { SubjectMetricItem } from "../../types/types";
import swuLogoDefault from "@/assets/swu-logo.png";
import medtechLogoDefault from "@/assets/medtech_logo.jpg";

interface PointScorecardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPoints: number;
  avgAccuracy: number;
  totalQuestions: number;
  subjects: SubjectMetricItem[];
  studentName?: string;
  studentEmail?: string;
}

export function PointScorecardModal({
  open,
  onOpenChange,
  totalPoints,
  avgAccuracy,
  totalQuestions,
  subjects,
  studentName = "MedTech Candidate",
  studentEmail = "",
}: PointScorecardModalProps) {
  const scorecardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    const subjectsHtml = subjects
      .map((s) => {
        const statusText =
          s.status ||
          (s.proficiency >= 80
            ? "Mastered"
            : s.proficiency >= 65
            ? "Proficient"
            : s.proficiency >= 35
            ? "In Training"
            : "Needs Focus");

        const statusStyle =
          statusText === "Mastered"
            ? "background:#d1fae5; color:#047857; border:1px solid #a7f3d0;"
            : statusText === "Proficient"
            ? "background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe;"
            : statusText === "In Training"
            ? "background:#fef3c7; color:#b45309; border:1px solid #fde68a;"
            : "background:#f3f4f6; color:#4b5563; border:1px solid #e5e7eb;";

        return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 14px; font-weight: 700; color: #0f172a; font-size: 10.5pt;">${s.subject}</td>
          <td style="padding: 10px 14px; text-align: center; font-family: 'Consolas', monospace; font-weight: 800; font-size: 11pt; color: #800000;">${s.points} pts</td>
          <td style="padding: 10px 14px; text-align: center; font-family: 'Consolas', monospace; font-weight: 700; font-size: 10.5pt; color: #0f172a;">${s.completion}%</td>
          <td style="padding: 10px 14px; text-align: center; font-family: 'Consolas', monospace; font-weight: 800; font-size: 11pt; color: #047857;">${s.proficiency}%</td>
          <td style="padding: 10px 14px; text-align: right;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 14px; font-size: 8.5pt; font-weight: 800; ${statusStyle}">${statusText}</span>
          </td>
        </tr>
      `;
      })
      .join("");

    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const resolveAssetUrl = (url?: string) => {
      if (!url) return "";
      if (typeof window !== "undefined" && url.startsWith("/")) {
        return `${window.location.origin}${url}`;
      }
      return url;
    };
    const swuLogo = resolveAssetUrl(swuLogoDefault);
    const medtechLogo = resolveAssetUrl(medtechLogoDefault);

    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Performance Point Scorecard - ${studentName}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm 12mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #0f172a; background: #ffffff; margin: 0; padding: 0; font-size: 10.5pt; line-height: 1.5; }
          .banner { background: linear-gradient(135deg, #800000 0%, #4a0000 100%); color: #ffffff; padding: 22px 26px; border-radius: 14px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(128,0,0,0.15); }
          .banner-title { font-size: 18pt; font-weight: 900; margin: 2px 0; letter-spacing: -0.5px; text-transform: uppercase; color: #ffffff; }
          .banner-sub { font-size: 9pt; color: #fde68a; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
          .banner-desc { font-size: 9.5pt; color: rgba(255,255,255,0.85); font-weight: 500; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px; margin-top: 14px; font-size: 8.5pt; }
          .meta-label { opacity: 0.75; text-transform: uppercase; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
          .meta-val { font-size: 9.5pt; font-weight: 800; color: #ffffff; }
          .hero-grid { display: grid; grid-template-columns: 1fr 2.2fr; gap: 14px; margin-bottom: 16px; }
          .card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px 18px; }
          .gwa-val { font-size: 32pt; font-weight: 900; color: #800000; font-family: 'Consolas', monospace; text-align: center; margin: 4px 0; letter-spacing: -1px; }
          .table-box { border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { background: #f1f5f9; padding: 10px 14px; font-size: 8.5pt; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; letter-spacing: 0.5px; }
          tfoot tr { background: #fff5f5; border-top: 2.5px solid #fecdd3; font-weight: 900; }
          .footer-line { border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 20px; font-size: 8pt; color: #64748B; display: flex; justify-content: space-between; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="banner">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 12px;">
            <div style="flex-shrink: 0;">
              <img src="${medtechLogo}" alt="Medical Technology Department" style="height: 54px; width: auto; max-width: 64px; object-fit: contain; border-radius: 6px; background: #ffffff; padding: 2px; display: block;" />
            </div>
            <div style="flex: 1; text-align: center;">
              <div class="banner-sub">BoardQuest Academic Analytics & Licensure System</div>
              <div class="banner-title">Official Candidate Performance Scorecard</div>
              <div class="banner-desc">Comprehensive Medical Technology Licensure Examination evaluation record.</div>
            </div>
            <div style="flex-shrink: 0;">
              <img src="${swuLogo}" alt="Southwestern University PHINMA" style="height: 54px; width: auto; max-width: 64px; object-fit: contain; border-radius: 4px; display: block;" />
            </div>
          </div>
          <div class="meta-grid">
            <div><span class="meta-label">Aspirant Name</span><span class="meta-val">${studentName}</span></div>
            <div><span class="meta-label">Student Email</span><span class="meta-val">${studentEmail || "Verified"}</span></div>
            <div><span class="meta-label">Total Points</span><span class="meta-val">${totalPoints.toLocaleString()} Pts</span></div>
            <div><span class="meta-label">Generated Date</span><span class="meta-val">${currentDate}</span></div>
          </div>
        </div>

        <div class="hero-grid">
          <div class="card" style="text-align: center;">
            <div style="font-size: 9pt; font-weight: 800; text-transform: uppercase; color: #64748B;">Discipline Accuracy</div>
            <div class="gwa-val">${avgAccuracy}%</div>
            <div style="font-size: 9pt; color: #047857; font-weight: 700;">Average Proficiency Benchmark</div>
          </div>
          <div class="card">
            <div style="font-size: 9.5pt; font-weight: 800; text-transform: uppercase; color: #800000; margin-bottom: 6px;">Evaluation Parameters</div>
            <div style="font-size: 8.5pt; color: #475569; line-height: 1.6;">
              Points reflect weighted discipline performance: 25 Pts per correct question answered and 6 Pts per 1% curriculum completion (capped at 1,200 Pts/subject + player XP). Passing threshold standard is set at 75.0%.
            </div>
          </div>
        </div>

        <div class="table-box">
          <table>
            <thead>
              <tr>
                <th>Board Discipline</th>
                <th style="text-align: center;">Score Points</th>
                <th style="text-align: center;">Completion</th>
                <th style="text-align: center;">Proficiency</th>
                <th style="text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${subjectsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 10px 14px; font-weight: 900; color: #800000;">Cumulative Point Standing</td>
                <td style="padding: 10px 14px; text-align: center; font-family: 'Consolas', monospace; font-size: 11pt; color: #800000;">${totalPoints.toLocaleString()} Pts</td>
                <td style="padding: 10px 14px; text-align: center; font-size: 10pt;">${Math.round(subjects.reduce((a, b) => a + b.completion, 0) / (subjects.length || 1))}% Avg</td>
                <td style="padding: 10px 14px; text-align: center; font-size: 11pt; color: #047857;">${avgAccuracy}% Avg</td>
                <td style="padding: 10px 14px; text-align: right; font-size: 9pt; color: #800000;">Official Record</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="footer-line">
          <span>BoardQuest Institutional Administration System &bull; Confidential Candidate Evaluation</span>
          <span>Timestamp: ${new Date().toISOString()}</span>
        </div>
      </body>
      </html>
    `);

    doc.close();
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => document.body.removeChild(printFrame), 1500);
    }, 300);
  };

  const completedCount = subjects.filter((s) => s.status === "Mastered").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0 rounded-2xl border border-border bg-card shadow-xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-12">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-primary/10 text-primary">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                Official Student Scorecard
              </span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">
              {studentName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Institutional academic performance breakdown across all registered board exam subjects.
            </DialogDescription>
          </div>

          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-8 px-3.5 flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer w-fit self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Scorecard</span>
          </Button>
        </div>

        {/* Content Body */}
        <div ref={scorecardRef} className="p-4 sm:p-5 space-y-4">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-center space-y-0.5">
              <span className="text-[9.5px] font-bold text-muted-foreground uppercase">Total Points</span>
              <p className="text-lg sm:text-xl font-black text-primary font-mono truncate">
                {totalPoints.toLocaleString()} <span className="text-xs font-normal">Pts</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-center space-y-0.5">
              <span className="text-[9.5px] font-bold text-muted-foreground uppercase">Average Proficiency</span>
              <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono truncate">
                {avgAccuracy}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-center space-y-0.5">
              <span className="text-[9.5px] font-bold text-muted-foreground uppercase">Mastered Subjects</span>
              <p className="text-lg sm:text-xl font-black text-foreground font-mono truncate">
                {completedCount} / {subjects.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-center space-y-0.5">
              <span className="text-[9.5px] font-bold text-muted-foreground uppercase">Exam Questions</span>
              <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono truncate">
                {totalQuestions.toLocaleString()} Qs
              </p>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-[10.5px] font-bold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="py-2.5 px-3.5">Subject Discipline</th>
                  <th className="py-2.5 px-3 text-center">Score Points</th>
                  <th className="py-2.5 px-3 text-center">Syllabus Completion</th>
                  <th className="py-2.5 px-3 text-center">Proficiency</th>
                  <th className="py-2.5 px-3.5 text-right">Mastery Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {subjects.map((s) => {
                  const isMastered = s.status === "Mastered" || s.proficiency >= 80;
                  const isProficient = s.status === "Proficient" || s.proficiency >= 65;

                  return (
                    <tr key={s.subject} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3.5 font-bold text-foreground">{s.subject}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-primary">
                        {s.points} Pts
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-foreground">
                        {s.completion}%
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {s.proficiency}%
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                            isMastered
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : isProficient
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {s.status || (isMastered ? "Mastered" : isProficient ? "Proficient" : "In Training")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
