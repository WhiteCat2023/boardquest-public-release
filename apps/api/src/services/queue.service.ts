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

// Helper to start the queue
export async function startQueue() {
  console.log("[Queue] Initializing background job processor...");
  await agenda.start();
  console.log("[Queue] Background job processor running.");
}

// Helper to stop the queue gracefully
export async function stopQueue() {
  console.log("[Queue] Stopping background job processor...");
  await agenda.stop();
  console.log("[Queue] Background job processor stopped.");
}
