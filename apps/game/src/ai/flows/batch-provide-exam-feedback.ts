import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const BatchFeedbackInputSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      correctAnswer: z.string(),
      options: z.array(z.string()),
    })
  ).describe('An array of questions that need explanations.'),
});

export type BatchFeedbackInput = z.infer<typeof BatchFeedbackInputSchema>;

export const BatchFeedbackOutputSchema = z.object({
  explanations: z.array(
    z.object({
      id: z.string(),
      explanation: z.string().describe('A 2-3 sentence explanation of why the correct answer is right and the others are wrong.'),
    })
  ),
});

export type BatchFeedbackOutput = z.infer<typeof BatchFeedbackOutputSchema>;

const batchPrompt = ai.definePrompt({
  name: 'batchProvideExamFeedbackPrompt',
  input: {schema: BatchFeedbackInputSchema},
  output: {schema: BatchFeedbackOutputSchema},
  prompt: `You are a Medical Technology instructor. I am providing you with an array of multiple-choice questions.

For each question, provide a concise explanation (maximum 2 to 3 sentences) of why the correct answer is correct, and briefly why the other options are incorrect. 

CRITICAL INSTRUCTIONS:
- Keep explanations extremely concise and direct. Do not use filler words.
- Return the exact 'id' for each question along with its 'explanation'.

Questions to explain:
{{#each questions}}
ID: {{id}}
Question: {{question}}
Correct Answer: {{correctAnswer}}
Options:
{{#each options}}
- {{this}}
{{/each}}
---
{{/each}}
`,
});

export const batchProvideExamFeedbackFlow = ai.defineFlow(
  {
    name: 'batchProvideExamFeedbackFlow',
    inputSchema: BatchFeedbackInputSchema,
    outputSchema: BatchFeedbackOutputSchema,
  },
  async input => {
    try {
      const {output} = await batchPrompt(input);
      return output!;
    } catch (e: any) {
      console.error("Batch AI Error:", e);
      throw e;
    }
  }
);
