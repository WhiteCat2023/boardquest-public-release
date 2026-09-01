import { Resend } from "resend";
import prisma from "../prisma";
import { generateStudentGradeReportHtml, StudentGradeReportData } from "./gradePdfGenerator";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    "BoardQuest <onboarding@resend.dev>"
  );
}

export interface DispatchGradeEmailResult {
  total: number;
  sentCount: number;
  failedCount: number;
  details: { candidateId: string; email: string; success: boolean; error?: string }[];
}

/**
 * Send grade report emails in batches with rate-limit protection
 */
export async function sendAssessmentGradeReportEmails(
  assessmentId: string,
  candidateIds?: string[],
  companyName?: string,
  reviewCenterId?: string
): Promise<DispatchGradeEmailResult> {
  const assessment = await (prisma as any).reviewCenterAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      scores: {
        include: {
          candidate: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  // Strict tenant check
  if (companyName && assessment.companyName !== companyName && reviewCenterId && assessment.reviewCenterId !== reviewCenterId) {
    throw new Error("Unauthorized to access this assessment");
  }

  const scoresToEmail = assessment.scores.filter((s: any) => {
    if (candidateIds && candidateIds.length > 0) {
      return candidateIds.includes(s.candidateId);
    }
    return true;
  });

  const resend = getResendClient();
  const from = getFromAddress();

  const results: DispatchGradeEmailResult = {
    total: scoresToEmail.length,
    sentCount: 0,
    failedCount: 0,
    details: [],
  };

  // Process in chunks of 5 with a 500ms delay to prevent rate-limiting
  const CHUNK_SIZE = 5;
  for (let i = 0; i < scoresToEmail.length; i += CHUNK_SIZE) {
    const chunk = scoresToEmail.slice(i, i + CHUNK_SIZE);

    await Promise.all(
      chunk.map(async (scoreRecord: any) => {
        const candidate = scoreRecord.candidate;
        if (!candidate || !candidate.email) {
          results.failedCount++;
          results.details.push({
            candidateId: scoreRecord.candidateId,
            email: "N/A",
            success: false,
            error: "No email address found for candidate",
          });
          return;
        }

        const reportData: StudentGradeReportData = {
          companyName: assessment.companyName,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          schoolId: candidate.schoolId,
          schoolYear: assessment.schoolYear,
          subject: assessment.subject,
          assessmentTitle: assessment.title,
          customLabel: assessment.customLabel,
          assessmentDate: assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString("en-PH") : null,
          score: scoreRecord.score,
          maxScore: assessment.maxScore,
          percentage: scoreRecord.percentage,
          percentile: scoreRecord.percentile,
          status: scoreRecord.status,
          passingRate: assessment.passingRate,
          meanScore: assessment.meanScore,
          medianScore: assessment.medianScore,
          modeScore: assessment.modeScore,
          remarks: scoreRecord.remarks,
          recordedBy: scoreRecord.recordedBy,
        };

        const htmlSlip = generateStudentGradeReportHtml(reportData);

        const emailSubject = `[${assessment.companyName}] Official Grade Report: ${assessment.title} - ${assessment.subject}`;
        const emailBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Official Grade Slip Released</h2>
            <p style="color: #475569; font-size: 14px;">
              Hello <strong>${candidate.name}</strong>,<br><br>
              Your score and performance report for <strong>${assessment.title} (${assessment.subject})</strong> has been published by <strong>${assessment.companyName}</strong>.
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <div style="font-size: 13px; color: #64748b;">YOUR RESULT:</div>
              <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px;">
                ${scoreRecord.score !== null ? scoreRecord.score : "—"} / ${assessment.maxScore} 
                <span style="font-size: 16px; color: #64748b;">(${scoreRecord.percentage !== null ? scoreRecord.percentage + "%" : "N/A"})</span>
              </div>
              <div style="margin-top: 8px; font-size: 13px; color: #334155;">
                Status: <strong>${scoreRecord.status === "PRESENT" ? (scoreRecord.score >= assessment.passingScore ? "PASSED" : "FAILED") : scoreRecord.status}</strong> | 
                Percentile Rank: <strong>${scoreRecord.percentile !== null ? scoreRecord.percentile + "th" : "N/A"}</strong>
              </div>
            </div>
            <p style="font-size: 13px; color: #64748b;">
              Please find your official full-page grade report slip attached and rendered below.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            ${htmlSlip}
          </div>
        `;

        try {
          if (resend) {
            await resend.emails.send({
              from,
              to: candidate.email,
              subject: emailSubject,
              html: emailBody,
            });
          }

          // Mark score record as SENT
          await (prisma as any).reviewCenterScore.update({
            where: { id: scoreRecord.id },
            data: {
              emailStatus: "SENT",
              emailSentAt: new Date(),
            },
          });

          results.sentCount++;
          results.details.push({
            candidateId: candidate.id,
            email: candidate.email,
            success: true,
          });
        } catch (err: any) {
          await (prisma as any).reviewCenterScore.update({
            where: { id: scoreRecord.id },
            data: {
              emailStatus: "FAILED",
            },
          });

          results.failedCount++;
          results.details.push({
            candidateId: candidate.id,
            email: candidate.email,
            success: false,
            error: err?.message || "Failed to send email",
          });
        }
      })
    );

    // Rate-limit throttle delay
    if (i + CHUNK_SIZE < scoresToEmail.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}
