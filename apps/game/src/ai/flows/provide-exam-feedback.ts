'use server';
/**
 * @fileOverview Provides detailed, AI-generated explanations for mock exam questions.
 *
 * - provideExamFeedback - A function that generates AI feedback for a given exam question.
 * - ProvideExamFeedbackInput - The input type for the provideExamFeedback function.
 * - ProvideExamFeedbackOutput - The return type for the provideExamFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

import {prisma} from '@/lib/prisma';

const ProvideExamFeedbackInputSchema = z.object({
  questionId: z.string().optional().describe('The ID of the question in the database.'),
  question: z.string().describe('The mock exam question text.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  userAnswer: z
    .string()
    .describe('The answer chosen by the student (can be incorrect).'),
});
export type ProvideExamFeedbackInput = z.infer<
  typeof ProvideExamFeedbackInputSchema
>;

const ProvideExamFeedbackOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A detailed explanation clarifying why the correct answer is right and why the user\'s chosen answer was wrong.'
    ),
});
export type ProvideExamFeedbackOutput = z.infer<
  typeof ProvideExamFeedbackOutputSchema
>;

export async function provideExamFeedback(
  input: ProvideExamFeedbackInput
): Promise<ProvideExamFeedbackOutput> {
  return provideExamFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideExamFeedbackPrompt',
  input: {schema: ProvideExamFeedbackInputSchema},
  output: {schema: ProvideExamFeedbackOutputSchema},
  prompt: `You are a Medical Technology instructor providing feedback.

Explain:
1. Why the correct answer is correct.
2. Why the student's answer is incorrect.

CRITICAL INSTRUCTION: Your explanation must be extremely concise. Limit your entire response to a maximum of 3 to 4 sentences. Do not use filler words.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{userAnswer}}}`,
});

const provideExamFeedbackFlow = ai.defineFlow(
  {
    name: 'provideExamFeedbackFlow',
    inputSchema: ProvideExamFeedbackInputSchema,
    outputSchema: ProvideExamFeedbackOutputSchema,
  },
  async input => {
    try {
      // 1. Check if explanation already exists in QuestionExplanation cache
      if (input.questionId) {
        const existing = await prisma.questionExplanation.findUnique({
          where: { questionId: input.questionId }
        });
        if (existing) {
          return { explanation: existing.explanation };
        }
      }

      // 2. If not found, generate using AI
      const {output} = await prompt(input);
      
      // 3. Save feedback to DB QuestionExplanation collection if questionId is provided
      if (input.questionId && output?.explanation) {
        try {
          await prisma.questionExplanation.create({
            data: { 
              questionId: input.questionId,
              explanation: output.explanation 
            }
          });
        } catch (dbError) {
          console.error("Failed to save feedback to database:", dbError);
        }
      }

      return output!;
    } catch (e: any) {
      if (e?.status === 'RESOURCE_EXHAUSTED' || e?.code === 429 || (e?.message && e.message.includes('429'))) {
        return {
          explanation: `The AI is currently resting to recharge its magic (Rate Limit Exceeded). Please try again in a few moments.\n\nCorrect Answer: ${input.correctAnswer}\nYour Answer: ${input.userAnswer}`
        };
      }
      throw e;
    }
  }
);
