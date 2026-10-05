import { Agenda, Job } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";
import { importQuestions, ImportedQuestion } from "./admin/question.service";

const databaseUrl = process.env.DATABASE_URL || "";

// Initialize Agenda using the MongoBackend adapter
export const agenda = new Agenda({
  backend: new MongoBackend({
    address: databaseUrl,
    collection: "agendaJobs",
  }),
});

import { QuestionStatus } from "../types/prisma.types";

// Type definition for bulk question upload job data
interface BulkUploadJobData {
  questions: ImportedQuestion[];
  categoryId: string;
  authorId: string;
  status?: QuestionStatus;
}

import { sseService } from "./admin/sse.service";

// Define the bulk-question-upload job
agenda.define("bulk-question-upload", async (job: Job) => {
  const { questions, categoryId, authorId, status } = job.attrs
    .data as BulkUploadJobData;
  console.log(
    `[Queue] Starting background bulk question upload for category: ${categoryId}. Importing ${questions.length} questions with status: ${status || "default"}...`,
  );

  try {
    const imported = await importQuestions(
      questions,
      categoryId,
      authorId,
      status,
    );
    console.log(
      `[Queue] Background bulk upload completed successfully. Imported ${imported.length} questions.`,
    );

    // Broadcast SSE update event so all connected clients reflect new questions immediately
    try {
      sseService.broadcastEvent("questions-updated", {
        type: "BULK_UPLOAD_COMPLETED",
        categoryId,
        count: imported.length,
        authorId,
        status,
      });
    } catch (err) {
      console.warn("Error broadcasting questions-updated SSE event:", err);
    }
  } catch (error) {
    console.error(`[Queue] Background bulk upload failed:`, error);
    throw error; // Retransmit error for Agenda failure tracking
  }
});

import prisma from "./prisma";
import { sendWeeklyDigestEmail } from "./mail.service";

// Define the weekly performance digest job
export async function dispatchWeeklyDigest(recipientUserId?: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Gather metrics
  const [questionsCreated, questionsApproved, questionsPending, attempts] =
    await Promise.all([
      (prisma as any).question.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      (prisma as any).question.count({
        where: {
          status: QuestionStatus.APPROVED,
          updatedAt: { gte: sevenDaysAgo },
        },
      }),
      (prisma as any).question.count({
        where: { status: QuestionStatus.PENDING_REVIEW },
      }),
      (prisma as any).userQuestionAttempt.findMany({
        where: { lastAttempt: { gte: sevenDaysAgo } },
        select: { attempts: true, correct: true },
      }),
    ]);

  let totalAttempts = 0;
  let totalCorrect = 0;
  for (const att of attempts) {
    totalAttempts += att.attempts || 0;
    totalCorrect += att.correct || 0;
  }

  const averagePassingRate =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 85;

  const metrics = {
    questionsCreated,
    questionsApproved,
    questionsPending,
    activeContributors: 1,
    studentAttempts: totalAttempts || 0,
    averagePassingRate,
    periodLabel: `Week of ${sevenDaysAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  };

  // 2. Determine recipients
  let recipients: any[] = [];
  if (recipientUserId) {
    const user = await (prisma as any).adminUser.findUnique({
      where: { id: recipientUserId },
      select: { id: true, email: true, name: true, notificationPreferences: true },
    });
    if (user) recipients = [user];
  } else {
    const allAdmins = await (prisma as any).adminUser.findMany({
      where: { accountStatus: "ACTIVE", isActive: true },
      select: { id: true, email: true, name: true, notificationPreferences: true },
    });
    recipients = allAdmins.filter((u: any) => {
      const prefs = u.notificationPreferences as any;
      return Boolean(prefs?.weeklyDigest);
    });
  }

  console.log(
    `[Queue] Dispatching weekly digest to ${recipients.length} subscriber(s)...`,
  );

  let sentCount = 0;
  for (const recipient of recipients) {
    try {
      await sendWeeklyDigestEmail({
        toEmail: recipient.email,
        userName: recipient.name,
        metrics,
      });
      sentCount++;
    } catch (err: any) {
      console.warn(
        `Failed to send weekly digest email to ${recipient.email}:`,
        err?.message,
      );
    }
  }

  return { success: true, recipientsCount: recipients.length, sentCount, metrics };
}

agenda.define("send-weekly-digest", async () => {
  console.log("[Queue] Executing scheduled weekly performance digest job...");
  await dispatchWeeklyDigest();
});

// Helper to start the queue
export async function startQueue() {
  console.log("[Queue] Initializing background job processor...");
  await agenda.start();
  console.log("[Queue] Background job processor running.");

  try {
    // Schedule weekly digest every Monday at 8:00 AM
    await agenda.every("0 8 * * 1", "send-weekly-digest");
  } catch (err) {
    console.warn("[Queue] Notice scheduling weekly digest:", err);
  }
}

// Helper to stop the queue gracefully
export async function stopQueue() {
  console.log("[Queue] Stopping background job processor...");
  await agenda.stop();
  console.log("[Queue] Background job processor stopped.");
}

