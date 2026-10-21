import type { AxiosInstance } from "axios";
import { showFeedback } from "@/components/modal";
import type { Question } from "@/types/question";
import swuLogoDefault from "@/assets/swu-logo.png";
import medtechLogoDefault from "@/assets/medtech_logo.jpg";

type PDFMode = "comprehensive" | "exam_only" | "exam_with_key";

export interface GenerateQuestionsPdfOptions {
  title?: string;
  subtitle?: string;
  institutionName?: string;
  questions: Question[];
  includeAnswerKey?: boolean;
  includeExplanations?: boolean;
  includeMetadata?: boolean;
  mode?: PDFMode;
  categoryName?: string;
  generatedBy?: string;
  selectedTypes?: string[];
  swuLogoUrl?: string;
  medtechLogoUrl?: string;
}

export interface ExportApprovedQuestionsParams {
  axiosPrivate: AxiosInstance;
  category?: string;
  categoryName?: string;
  difficulty?: string;
  type?: string;
  types?: string[];
  search?: string;
  includeAnswerKey?: boolean;
  includeExplanations?: boolean;
  includeMetadata?: boolean;
  mode?: PDFMode;
  title?: string;
  generatedBy?: string;
  onProgress?: (message: string) => void;
}

/**
 * Standardize and normalize question types to one of the 3 canonical forms:
 * MCQ, TRUE_FALSE, or SHORT_ANSWER
 */
export function normalizeQuestionType(
  type?: string | null
): "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" {
  if (!type) return "MCQ";
  const upper = String(type).toUpperCase().trim();
  if (
    upper === "TRUE_FALSE" ||
    upper === "TF" ||
    upper === "TRUE_OR_FALSE" ||
    upper.includes("TRUE") ||
    upper.includes("FALSE")
  ) {
    return "TRUE_FALSE";
  }
  if (
    upper === "SHORT_ANSWER" ||
    upper === "SHORT" ||
    upper === "IDENTIFICATION" ||
    upper.includes("SHORT") ||
    upper.includes("IDENT")
  ) {
    return "SHORT_ANSWER";
  }
  return "MCQ";
}

/**
 * Short label for compact badges and tables
 */
export function getQuestionTypeShortLabel(type?: string | null): string {
  const norm = normalizeQuestionType(type);
  switch (norm) {
    case "MCQ":
      return "MCQ";
    case "TRUE_FALSE":
      return "True / False";
    case "SHORT_ANSWER":
      return "Short Ans";
  }
}

/**
 * Full descriptive label for headings and options
 */
export function getQuestionTypeFullLabel(type?: string | null): string {
  const norm = normalizeQuestionType(type);
  switch (norm) {
    case "MCQ":
      return "Multiple Choice";
    case "TRUE_FALSE":
      return "True or False";
    case "SHORT_ANSWER":
      return "Short Answer / Identification";
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
 * Format choice label into letter prefix (A, B, C, D...)
 */
function getChoicePrefix(index: number): string {
  return String.fromCharCode(65 + index);
}

/**
 * Resolve asset URL to absolute URL if needed so it works seamlessly inside print iframes
 */
function resolveAssetUrl(url?: string): string {
  if (!url) return "";
  if (typeof window !== "undefined" && url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return url;
}

/**
 * Generate a beautifully styled, print-ready HTML document for the questions.
 * Optimized for crisp vector PDF output via browser Print-to-PDF.
 */
export function generateQuestionsPdfHtml(options: GenerateQuestionsPdfOptions): string {
  const {
    title = "BoardQuest Question Bank - Approved Questions",
    subtitle = "Official Repository of Quality-Assured Board Review Examination Items",
    institutionName = "BoardQuest Evaluation & Review System",
    questions = [],
    includeAnswerKey = true,
    includeExplanations = true,
    includeMetadata = true,
    mode = "comprehensive",
    categoryName = "All Subjects",
    generatedBy = "System Administrator",
    swuLogoUrl,
    medtechLogoUrl,
  } = options;

  const swuLogo = resolveAssetUrl(swuLogoUrl || swuLogoDefault);
  const medtechLogo = resolveAssetUrl(medtechLogoUrl || medtechLogoDefault);

  const totalCount = questions.length;
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Calculate difficulty distribution
  const difficultyCounts = questions.reduce(
    (acc, q) => {
      const diff = (q.difficulty || "MEDIUM").toUpperCase();
      if (diff === "EASY") acc.easy++;
      else if (diff === "HARD") acc.hard++;
      else acc.medium++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  // Calculate question type distribution
  const typeCounts = questions.reduce(
    (acc, q) => {
      const norm = normalizeQuestionType(q.type);
      if (norm === "MCQ") acc.mcq++;
      else if (norm === "TRUE_FALSE") acc.tf++;
      else if (norm === "SHORT_ANSWER") acc.sa++;
      return acc;
    },
    { mcq: 0, tf: 0, sa: 0 }
  );

  // Group questions by subject if multiple subjects exist
  const subjectDistribution = questions.reduce<Record<string, number>>((acc, q) => {
    const subName = q.subject?.name || q.category?.name || "General Subject";
    acc[subName] = (acc[subName] || 0) + 1;
    return acc;
  }, {});

  const subjectList = Object.keys(subjectDistribution);
  const isMultiSubject = subjectList.length > 1;

  // Determine whether to show inline answers
  const showInlineAnswers = mode === "comprehensive" && includeAnswerKey;
  const showSeparateAnswerKey = mode === "exam_with_key" && includeAnswerKey;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
  <style>
    @page {
      size: A4 portrait;
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
      margin: 0 auto;
      padding: 36px 44px;
      font-size: 10pt;
      line-height: 1.5;
    }

    /* ── Document Header ── */
    .doc-header {
      border-bottom: 2px solid #a70202;
      padding-bottom: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .header-logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-logo {
      height: 58px;
      width: auto;
      max-width: 68px;
      object-fit: contain;
      display: block;
    }

    .header-logo-swu {
      border-radius: 4px;
    }

    .header-logo-medtech {
      border-radius: 6px;
      background: #ffffff;
      padding: 1px;
    }

    .brand-block {
      flex: 1;
      min-width: 0;
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
      margin: 0 0 3px 0;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }

    .doc-subtitle {
      font-size: 8.5pt;
      color: #475569;
      margin: 0;
      line-height: 1.35;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
    }

    .header-badge-box {
      text-align: right;
      font-size: 8pt;
      color: #64748b;
      white-space: nowrap;
    }

    .header-total-items {
      font-size: 8pt;
      color: #334155;
      margin-top: 2px;
    }

    .status-badge {
      display: inline-block;
      padding: 2.5px 9px;
      border-radius: 9999px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      margin-bottom: 2px;
    }

    /* ── Overview Information Grid ── */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 8.5pt;
    }

    .overview-item {
      display: flex;
      flex-direction: column;
    }

    .overview-label {
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.04em;
    }

    .overview-val {
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }

    /* ── Question Type Pills ── */
    .type-pill {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .type-mcq {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }

    .type-tf {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .type-sa {
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #e9d5ff;
    }

    /* ── Difficulty Pills ── */
    .diff-pill {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .diff-easy {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .diff-medium {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .diff-hard {
      background: #ffe4e6;
      color: #be123c;
      border: 1px solid #fecdd3;
    }

    .cog-pill {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .sub-pill {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 600;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    /* ── Questions Container ── */
    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .question-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #ffffff;
      break-inside: avoid;
      page-break-inside: avoid;
      position: relative;
    }

    .question-card.with-answer {
      border-left: 3.5px solid #a70202;
    }

    .question-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px dashed #f1f5f9;
      gap: 8px;
    }

    .question-num {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .question-tags {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    .question-stem {
      font-size: 10pt;
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 10px;
      line-height: 1.55;
    }

    .question-image {
      margin: 8px 0 12px 0;
      max-width: 100%;
      max-height: 220px;
      object-fit: contain;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      display: block;
    }

    /* ── Choices List ── */
    .choices-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 5px;
      margin-top: 8px;
    }

    .choice-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 5px 8px;
      border-radius: 5px;
      border: 1px solid transparent;
      font-size: 9.5pt;
      line-height: 1.4;
    }

    .choice-prefix {
      font-weight: 700;
      color: #475569;
      min-width: 18px;
      flex-shrink: 0;
    }

    .choice-text {
      flex: 1;
      color: #1e293b;
    }

    .choice-row.is-correct {
      background: #f0fdf4;
      border-color: #86efac;
      color: #15803d;
      font-weight: 600;
    }

    .choice-row.is-correct .choice-prefix {
      color: #16a34a;
    }

    .correct-indicator {
      margin-left: 6px;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 1px 5px;
      background: #22c55e;
      color: #ffffff;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .choice-image {
      margin-top: 4px;
      max-height: 100px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      display: block;
    }

    /* ── Short Answer Fields ── */
    .short-answer-line-box {
      margin-top: 10px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .short-answer-label {
      font-weight: 700;
      color: #475569;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .short-answer-underline {
      flex: 1;
      border-bottom: 1.5px solid #94a3b8;
      height: 18px;
    }

    .short-answer-solution-box {
      margin-top: 10px;
      padding: 8px 12px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 9.5pt;
    }

    .solution-badge {
      background: #22c55e;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }

    .solution-value {
      font-weight: 700;
      color: #15803d;
      word-break: break-word;
    }

    .choice-text {
      flex: 1;
      color: #1e293b;
    }

    .choice-row.is-correct {
      background: #f0fdf4;
      border-color: #86efac;
      color: #15803d;
      font-weight: 600;
    }

    .choice-row.is-correct .choice-prefix {
      color: #16a34a;
    }

    .correct-indicator {
      margin-left: 6px;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 1px 5px;
      background: #22c55e;
      color: #ffffff;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .choice-image {
      margin-top: 4px;
      max-height: 100px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      display: block;
    }

    /* ── Explanation / Feedback Box ── */
    .explanation-box {
      margin-top: 10px;
      padding: 8px 10px;
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      border-radius: 0 6px 6px 0;
      font-size: 8.5pt;
      color: #334155;
    }

    .explanation-title {
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 2px;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.03em;
    }

    /* ── Answer Key Summary Page ── */
    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .answer-key-section {
      margin-top: 24px;
    }

    .answer-key-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #a70202;
      padding-bottom: 6px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }

    .answer-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 20px;
    }

    .answer-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 8px;
      background: #f8fafc;
      font-size: 8.5pt;
    }

    .answer-cell-num {
      font-weight: 700;
      color: #64748b;
    }

    .answer-cell-ans {
      font-weight: 800;
      color: #15803d;
      background: #dcfce7;
      padding: 1px 6px;
      border-radius: 3px;
    }

    .answer-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-top: 12px;
    }

    .answer-table th, .answer-table td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      text-align: left;
    }

    .answer-table th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.04em;
    }

    .answer-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* ── Document Footer ── */
    .doc-footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 7.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media print {
      body {
        font-size: 9.5pt;
        padding: 14mm 12mm !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
      .question-card {
        box-shadow: none !important;
      }
      .header-logo {
        height: 52px !important;
      }
    }
  </style>
</head>
<body>

  <!-- Document Header -->
  <div class="doc-header">
    <div class="header-logo-container header-logo-left">
      <img
        src="${escapeHtml(medtechLogo)}"
        alt="Medical Technology Department"
        class="header-logo header-logo-medtech"
      />
    </div>

    <div class="brand-block">
      <div class="institution-tag">${escapeHtml(institutionName)}</div>
      <h1 class="doc-title">${escapeHtml(title)}</h1>
      <p class="doc-subtitle">${escapeHtml(subtitle)} &bull; ${escapeHtml(categoryName)}</p>
    </div>

    <div class="header-right">
      <div class="header-badge-box">
        <div class="status-badge">&bull; APPROVED BANK</div>
        <div class="header-total-items"><strong>Total Items:</strong> ${totalCount} Items</div>
      </div>
      <div class="header-logo-container header-logo-right">
        <img
          src="${escapeHtml(swuLogo)}"
          alt="Southwestern University PHINMA"
          class="header-logo header-logo-swu"
        />
      </div>
    </div>
  </div>

  <!-- Summary Statistics Bar -->
  <div class="overview-grid">
    <div class="overview-item">
      <span class="overview-label">Subject Scope</span>
      <span class="overview-val">${escapeHtml(categoryName)}</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Total Questions</span>
      <span class="overview-val">${totalCount} Approved Items</span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Question Types</span>
      <span class="overview-val" style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 3px;">
        ${typeCounts.mcq > 0 ? `<span class="type-pill type-mcq">MCQ: ${typeCounts.mcq}</span>` : ""}
        ${typeCounts.tf > 0 ? `<span class="type-pill type-tf">T/F: ${typeCounts.tf}</span>` : ""}
        ${typeCounts.sa > 0 ? `<span class="type-pill type-sa">Short Ans: ${typeCounts.sa}</span>` : ""}
      </span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Difficulty Distribution</span>
      <span class="overview-val">
        <span class="diff-pill diff-easy">Easy: ${difficultyCounts.easy}</span>
        <span class="diff-pill diff-medium">Med: ${difficultyCounts.medium}</span>
        <span class="diff-pill diff-hard">Hard: ${difficultyCounts.hard}</span>
      </span>
    </div>
    <div class="overview-item">
      <span class="overview-label">Generated Timestamp</span>
      <span class="overview-val">${escapeHtml(generatedAt)}</span>
    </div>
  </div>

  <!-- Questions List -->
  <div class="questions-list">
    ${questions
      .map((q, idx) => {
        const itemNumber = idx + 1;
        const normType = normalizeQuestionType(q.type);
        const questionText = q.question || q.text || "Untitled Question";
        const subjectName = q.subject?.name || q.category?.name || "General Subject";
        const topicName = q.topic || "Core Concept";
        const diff = (q.difficulty || "MEDIUM").toUpperCase();
        const diffClass =
          diff === "EASY"
            ? "diff-easy"
            : diff === "HARD"
            ? "diff-hard"
            : "diff-medium";
        const cog = q.cognitiveLevel ? String(q.cognitiveLevel).toUpperCase() : null;
        const rawChoices = q.choices || [];
        const choiceImages = q.choiceImages || [];
        const correctAnswer = (q.correctAnswer || "").trim();
        const feedback = q.feedback || "";

        const typeClass =
          normType === "MCQ"
            ? "type-mcq"
            : normType === "TRUE_FALSE"
            ? "type-tf"
            : "type-sa";

        return `
      <div class="question-card ${showInlineAnswers ? "with-answer" : ""}" id="item-${itemNumber}">
        <div class="question-topbar">
          <div class="question-num">
            <span>Item ${itemNumber}.</span>
          </div>
          <div class="question-tags">
            ${
              includeMetadata
                ? `<span class="type-pill ${typeClass}">${getQuestionTypeShortLabel(normType)}</span>`
                : ""
            }
            ${
              includeMetadata && isMultiSubject
                ? `<span class="sub-pill">${escapeHtml(subjectName)}</span>`
                : ""
            }
            ${
              includeMetadata && topicName
                ? `<span class="cog-pill">${escapeHtml(topicName)}</span>`
                : ""
            }
            ${
              includeMetadata
                ? `<span class="diff-pill ${diffClass}">${escapeHtml(diff)}</span>`
                : ""
            }
            ${
              includeMetadata && cog
                ? `<span class="cog-pill">${escapeHtml(cog)}</span>`
                : ""
            }
          </div>
        </div>

        <div class="question-stem">
          ${escapeHtml(questionText).replace(/\n/g, "<br>")}
        </div>

        ${
          q.imageUrl
            ? `<img src="${escapeHtml(q.imageUrl)}" alt="Question Diagram" class="question-image" />`
            : ""
        }

        <!-- Answer / Choices Area -->
        ${
          normType === "SHORT_ANSWER"
            ? `
          <!-- Short Answer: Write-in line or Faculty solution -->
          ${
            showInlineAnswers
              ? `
            <div class="short-answer-solution-box">
              <span class="solution-badge">&#10003; Correct Answer / Key</span>
              <span class="solution-value">${escapeHtml(correctAnswer || "—")}</span>
            </div>
          `
              : `
            <div class="short-answer-line-box">
              <span class="short-answer-label">Answer:</span>
              <span class="short-answer-underline"></span>
            </div>
          `
          }
        `
            : normType === "TRUE_FALSE"
            ? `
          <!-- True / False Options -->
          <div class="choices-grid">
            ${(rawChoices.length >= 2 ? rawChoices : ["True", "False"])
              .map((choice, cIdx) => {
                const prefix = getChoicePrefix(cIdx);
                const cLower = choice.trim().toLowerCase();
                const ansLower = correctAnswer.toLowerCase();
                const isAnsTrue = ansLower === "true" || ansLower === "t" || ansLower === "a";
                const isAnsFalse = ansLower === "false" || ansLower === "f" || ansLower === "b";

                const isCorrect =
                  showInlineAnswers &&
                  ((cLower === "true" && isAnsTrue) ||
                    (cLower === "false" && isAnsFalse) ||
                    cLower === ansLower ||
                    prefix.toLowerCase() === ansLower);

                return `
                <div class="choice-row ${isCorrect ? "is-correct" : ""}">
                  <span class="choice-prefix">${prefix}.</span>
                  <div class="choice-text">
                    ${escapeHtml(choice)}
                    ${isCorrect ? `<span class="correct-indicator">&#10003; Correct Answer</span>` : ""}
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        `
            : rawChoices.length > 0
            ? `
          <!-- MCQ Choices -->
          <div class="choices-grid">
            ${rawChoices
              .map((choice, cIdx) => {
                const prefix = getChoicePrefix(cIdx);
                const isCorrect =
                  showInlineAnswers &&
                  (choice.trim().toLowerCase() === correctAnswer.toLowerCase() ||
                    correctAnswer.toLowerCase() === prefix.toLowerCase() ||
                    correctAnswer.toLowerCase().startsWith(prefix.toLowerCase() + "."));

                return `
                <div class="choice-row ${isCorrect ? "is-correct" : ""}">
                  <span class="choice-prefix">${prefix}.</span>
                  <div class="choice-text">
                    ${escapeHtml(choice)}
                    ${isCorrect ? `<span class="correct-indicator">&#10003; Correct Answer</span>` : ""}
                    ${
                      choiceImages[cIdx]
                        ? `<img src="${escapeHtml(choiceImages[cIdx])}" alt="Choice image ${prefix}" class="choice-image" />`
                        : ""
                    }
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Explanations & Rationale (if applicable) -->
        ${
          showInlineAnswers && includeExplanations && feedback
            ? `
          <div class="explanation-box">
            <div class="explanation-title">&#9432; Rationale / Educational Note</div>
            <div>${escapeHtml(feedback).replace(/\n/g, "<br>")}</div>
          </div>
        `
            : ""
        }
      </div>
      `;
      })
      .join("")}
  </div>

  <!-- Optional Separate Answer Key Sheet (for Exam with Key mode) -->
  ${
    showSeparateAnswerKey
      ? `
    <div class="page-break answer-key-section">
      <div class="doc-header">
        <div class="brand-block">
          <div class="institution-tag">${escapeHtml(institutionName)}</div>
          <h2 class="answer-key-title">Official Answer Key & Item Directory</h2>
          <p class="doc-subtitle">Confidential faculty reference for: ${escapeHtml(title)} &bull; ${escapeHtml(categoryName)}</p>
        </div>
        <div class="header-badge-box">
          <div class="status-badge">&bull; FACULTY KEY</div>
          <div><strong>Items:</strong> ${totalCount}</div>
        </div>
      </div>

      <!-- Quick Answer Grid -->
      <h3 style="font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #475569; margin: 12px 0 6px 0;">
        Quick Answer Directory
      </h3>
      <div class="answer-grid">
        ${questions
          .map((q, idx) => {
            const itemNum = idx + 1;
            const normType = normalizeQuestionType(q.type);
            let ansDisplay = q.correctAnswer || "—";

            if (normType === "TRUE_FALSE") {
              const lower = ansDisplay.toLowerCase().trim();
              if (lower === "true" || lower === "t") ansDisplay = "TRUE";
              else if (lower === "false" || lower === "f") ansDisplay = "FALSE";
            } else if (normType === "MCQ" && q.choices?.length) {
              const matchedIdx = q.choices.findIndex(
                (c) => c.trim().toLowerCase() === ansDisplay.trim().toLowerCase()
              );
              if (matchedIdx !== -1) {
                ansDisplay = `${getChoicePrefix(matchedIdx)}`;
              }
            } else if (normType === "SHORT_ANSWER") {
              if (ansDisplay.length > 20) {
                ansDisplay = ansDisplay.slice(0, 18) + "...";
              }
            }

            return `
            <div class="answer-cell">
              <span class="answer-cell-num">#${itemNum}</span>
              <span class="answer-cell-ans">${escapeHtml(ansDisplay)}</span>
            </div>
          `;
          })
          .join("")}
      </div>

      <!-- Detailed Breakdown Table -->
      <h3 style="font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #475569; margin: 16px 0 6px 0;">
        Comprehensive Item Directory & Rationales
      </h3>
      <table class="answer-table">
        <thead>
          <tr>
            <th style="width: 45px;">Item</th>
            <th style="width: 80px;">Type</th>
            <th style="width: 140px;">Subject & Topic</th>
            <th style="width: 55px;">Diff.</th>
            <th style="width: 150px;">Correct Answer</th>
            <th>Rationale / Feedback</th>
          </tr>
        </thead>
        <tbody>
          ${questions
            .map((q, idx) => {
              const itemNum = idx + 1;
              const normType = normalizeQuestionType(q.type);
              const sub = q.subject?.name || q.category?.name || "General";
              const topic = q.topic || "Core";
              const diff = (q.difficulty || "MEDIUM").toUpperCase();

              let formattedAnswer = q.correctAnswer || "—";
              if (normType === "TRUE_FALSE") {
                const lower = formattedAnswer.toLowerCase().trim();
                if (lower === "true" || lower === "t") formattedAnswer = "True";
                else if (lower === "false" || lower === "f") formattedAnswer = "False";
              }

              const typeClass =
                normType === "MCQ"
                  ? "type-mcq"
                  : normType === "TRUE_FALSE"
                  ? "type-tf"
                  : "type-sa";

              return `
              <tr>
                <td><strong>#${itemNum}</strong></td>
                <td>
                  <span class="type-pill ${typeClass}">${getQuestionTypeShortLabel(normType)}</span>
                </td>
                <td>
                  <strong>${escapeHtml(sub)}</strong><br/>
                  <span style="color: #64748b;">${escapeHtml(topic)}</span>
                </td>
                <td><span class="diff-pill ${
                  diff === "EASY"
                    ? "diff-easy"
                    : diff === "HARD"
                    ? "diff-hard"
                    : "diff-medium"
                }">${diff}</span></td>
                <td><strong>${escapeHtml(formattedAnswer)}</strong></td>
                <td>${escapeHtml(q.feedback || "—")}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `
      : ""
  }

  <!-- Document Footer -->
  <div class="doc-footer">
    <div>
      <strong>BoardQuest Evaluation & Review System</strong> &bull; Confidential Board Review Document &bull; Generated by ${escapeHtml(
        generatedBy
      )}
    </div>
    <div>Page 1 of Document</div>
  </div>

</body>
</html>`;
}

/**
 * Print or export the generated HTML to PDF via a hidden browser iframe.
 * Compatible with all modern browsers, triggers the standard Save as PDF print dialog.
 */
export function printQuestionsPdf(html: string): Promise<void> {
  return new Promise((resolve) => {
    // Remove any existing print iframe
    const existingIframe = document.getElementById("boardquest-questions-print-iframe");
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "boardquest-questions-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "1024px";
    iframe.style.height = "768px";
    iframe.style.border = "none";
    iframe.style.zIndex = "-1000";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      showFeedback.error("Failed to initialize PDF print window.");
      iframe.remove();
      resolve();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Allow resources (fonts, images) to settle before triggering print
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print trigger error:", e);
        } finally {
          // Keep iframe momentarily so print dialog has access to DOM
          setTimeout(() => {
            iframe.remove();
            resolve();
          }, 3000);
        }
      }, 500);
    };

    // Fallback if onload doesn't trigger immediately
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        // Ignored
      }
      setTimeout(() => {
        iframe.remove();
        resolve();
      }, 3000);
    }, 1200);
  });
}

/**
 * Fetch all approved questions from the API in one go.
 * Handles category or filter narrowing if specified.
 */
export async function fetchAllApprovedQuestions(
  axiosPrivate: AxiosInstance,
  filters?: {
    category?: string;
    difficulty?: string;
    type?: string;
    types?: string[];
    search?: string;
  }
): Promise<Question[]> {
  const cleanParams: Record<string, any> = {
    status: "APPROVED",
    limit: "all",
  };

  if (filters?.category && filters.category !== "ALL") {
    cleanParams.category = filters.category;
  }
  if (filters?.difficulty && filters.difficulty !== "ALL") {
    cleanParams.difficulty = filters.difficulty;
  }
  if (filters?.type && filters.type !== "ALL") {
    cleanParams.type = filters.type;
  }
  if (filters?.search && filters.search.trim()) {
    cleanParams.search = filters.search.trim();
  }

  try {
    const res = await axiosPrivate.get("/questions/get", {
      params: cleanParams,
    });

    const rawData = res.data?.data;
    let questionsList: Question[] = [];

    if (Array.isArray(rawData)) {
      questionsList = rawData;
    } else if (Array.isArray(rawData?.questions)) {
      questionsList = rawData.questions;
    }

    // Safety fallback: if limit: 'all' was constrained by backend to 20, fetch up to export limit
    if (questionsList.length === 20 && rawData?.total && rawData.total > 20) {
      const exportLimit = Number(import.meta.env.VITE_EXPORT_FETCH_LIMIT) || 10000;
      const fallbackRes = await axiosPrivate.get("/questions/get", {
        params: {
          ...cleanParams,
          limit: exportLimit,
        },
      });
      const fallbackData = fallbackRes.data?.data;
      if (Array.isArray(fallbackData?.questions)) {
        questionsList = fallbackData.questions;
      }
    }

    // Filter by specific question types if requested
    if (filters?.types && filters.types.length > 0 && filters.types.length < 3) {
      const allowed = new Set(filters.types.map((t) => normalizeQuestionType(t)));
      questionsList = questionsList.filter((q) =>
        allowed.has(normalizeQuestionType(q.type))
      );
    }

    return questionsList;
  } catch (err: any) {
    console.error("Failed to fetch all approved questions:", err);
    throw new Error(
      err?.response?.data?.message || "Failed to retrieve approved questions from server."
    );
  }
}

/**
 * Primary export function: Exports all approved questions to PDF in one go!
 * Fetches questions, renders formatted document, and prompts the browser's PDF save dialog.
 */
export async function exportApprovedQuestionsToPdf(
  params: ExportApprovedQuestionsParams
): Promise<{ count: number; html: string }> {
  const {
    axiosPrivate,
    category,
    categoryName = "All Subjects",
    difficulty,
    type,
    types,
    search,
    includeAnswerKey = true,
    includeExplanations = true,
    includeMetadata = true,
    mode = "comprehensive",
    title,
    generatedBy,
    onProgress,
  } = params;

  const notifyProgress = (msg: string) => {
    if (onProgress) onProgress(msg);
  };

  notifyProgress("Retrieving approved questions from repository...");

  const questions = await fetchAllApprovedQuestions(axiosPrivate, {
    category,
    difficulty,
    type,
    types,
    search,
  });

  if (!questions || questions.length === 0) {
    showFeedback.warning("No approved questions found matching the selected criteria.");
    return { count: 0, html: "" };
  }

  notifyProgress(`Compiling ${questions.length} questions into PDF document...`);

  // Generate dynamic type subtitle descriptor if filtered
  let typeDescriptor = "";
  if (types && types.length === 1) {
    typeDescriptor = ` (${getQuestionTypeFullLabel(types[0])})`;
  } else if (types && types.length < 3) {
    typeDescriptor = ` (${types.map(getQuestionTypeShortLabel).join(", ")})`;
  } else if (type && type !== "ALL") {
    typeDescriptor = ` (${getQuestionTypeFullLabel(type)})`;
  }

  const dynamicTitle =
    title ||
    (category && category !== "ALL"
      ? `${categoryName} - Approved Question Bank`
      : "BoardQuest Question Bank - Approved Questions");

  const html = generateQuestionsPdfHtml({
    title: dynamicTitle,
    subtitle: `Exported ${questions.length} verified and approved evaluation items${typeDescriptor}`,
    questions,
    categoryName,
    includeAnswerKey,
    includeExplanations,
    includeMetadata,
    mode,
    generatedBy,
    selectedTypes: types,
  });

  notifyProgress("Launching Print / Save as PDF dialog...");
  await printQuestionsPdf(html);

  showFeedback.success(
    `Export ready! Prepared ${questions.length} approved questions for PDF save.`,
    {
      description: "Select 'Save as PDF' in the destination dropdown to download.",
    }
  );

  return { count: questions.length, html };
}
