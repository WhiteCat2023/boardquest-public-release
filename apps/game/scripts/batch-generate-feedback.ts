import { PrismaClient } from '@prisma/client';
import { batchProvideExamFeedbackFlow } from '../src/ai/flows/batch-provide-exam-feedback';

const prisma = new PrismaClient();

async function run() {
  console.log("Starting batch feedback generation...");

  try {
    // Find all APPROVED questions that don't have feedback yet
    const pendingQuestions = await prisma.question.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { feedback: null },
          { feedback: '' }
        ]
      },
      select: {
        id: true,
        question: true,
        choices: true,
        correctAnswer: true,
      }
    });

    console.log(`Found ${pendingQuestions.length} questions missing feedback.`);

    if (pendingQuestions.length === 0) {
      console.log("No questions need feedback. Exiting.");
      return;
    }

    const BATCH_SIZE = 10;
    
    for (let i = 0; i < pendingQuestions.length; i += BATCH_SIZE) {
      const batch = pendingQuestions.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(pendingQuestions.length / BATCH_SIZE)}...`);
      
      const aiInput = batch.map(q => {
        // Map correct answer logic exactly like in arena.ts
        let correctAnswerLetter = q.correctAnswer;
        const correctIndex = q.choices.indexOf(q.correctAnswer);
        if (correctIndex !== -1) {
          correctAnswerLetter = String.fromCharCode(65 + correctIndex);
        } else if (["A", "B", "C", "D"].includes(q.correctAnswer)) {
          correctAnswerLetter = q.correctAnswer;
        }

        return {
          id: q.id,
          question: q.question,
          options: q.choices,
          correctAnswer: correctAnswerLetter
        };
      });

      try {
        // Call the AI flow for this batch
        const result = await batchProvideExamFeedbackFlow({ questions: aiInput });
        
        // Update database with results
        if (result && result.explanations) {
          console.log(`Received ${result.explanations.length} explanations from AI.`);
          
          for (const explanation of result.explanations) {
            await prisma.question.update({
              where: { id: explanation.id },
              data: { feedback: explanation.explanation }
            });
          }
          console.log(`Successfully updated batch in database.`);
        }
      } catch (error) {
        console.error(`Error processing batch starting at index ${i}:`, error);
        // Continue to the next batch even if one fails
      }

      // Add a small delay between batches to respect rate limits
      if (i + BATCH_SIZE < pendingQuestions.length) {
        console.log("Waiting 10 seconds before next batch to prevent rate limiting...");
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    console.log("Batch feedback generation completed!");
  } catch (error) {
    console.error("Fatal error during batch generation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
