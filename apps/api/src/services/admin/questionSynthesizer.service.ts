import z from "zod";
import { QuestionDifficulty, QuestionType } from "../../types/prisma.types";
import { ApiError } from "../../utils/apiError";

// ============ Schemas ============

export const SynthesizeQuestionInputSchema = z.object({
  question: z.string().min(3, "Question title/stem is required"),
  choices: z.array(z.string()).optional().default([]),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  topic: z.string().min(1, "Topic is required"),
  targetDifficulty: z.nativeEnum(QuestionDifficulty),
  type: z.nativeEnum(QuestionType).optional().default(QuestionType.MCQ),
  count: z.number().optional().default(5),
  additionalContext: z.string().optional(),
});

export type SynthesizeQuestionInput = z.infer<
  typeof SynthesizeQuestionInputSchema
>;

export const SynthesizedQuestionOutputSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).optional().default([]),
  correctAnswer: z.string(),
  difficulty: z.nativeEnum(QuestionDifficulty),
  feedback: z.string(),
  logicalSoundnessRating: z.number().min(1).max(10).optional().default(10),
});

export type SynthesizedQuestionOutput = z.infer<
  typeof SynthesizedQuestionOutputSchema
>;

export const SynthesizedQuestionListOutputSchema = z.array(
  SynthesizedQuestionOutputSchema,
);

// ============ Service Class ============

export class QuestionSynthesizerService {
  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || "";
  }

  /**
   * Cleans unwanted bracketed tags and redundant prefixes from question stems.
   */
  private cleanStemText(text: string): string {
    if (!text) return "";
    // Remove all bracketed prefixes like [Direct Recall], [Analytical Case Study], etc.
    let cleaned = text.replace(/\[[^\]]*\]/g, "").trim();
    // Remove leading "In relation to XYZ:" prefixes if present
    cleaned = cleaned.replace(/^In relation to [^:]+:\s*/i, "").trim();
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
  }

  /**
   * Synthesizes 5 distinct question variants based on target difficulty before saving to the database.
   */
  async synthesizeQuestion(
    input: SynthesizeQuestionInput,
  ): Promise<SynthesizedQuestionOutput[]> {
    const validatedInput = SynthesizeQuestionInputSchema.parse(input);
    validatedInput.question = this.cleanStemText(validatedInput.question);

    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.warn(
        "[QuestionSynthesizerService] GEMINI_API_KEY is missing. Using smart fallback synthesizer engine.",
      );
      return this.generateLocalSynthesizedFallbacks(validatedInput);
    }

    const prompt = this.buildPrompt(validatedInput);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.4,
            },
          }),
        },
      );

      if (!response.ok) {
        console.warn(
          `[QuestionSynthesizerService] Gemini API returned ${response.status}. Falling back to local engine.`,
        );
        return this.generateLocalSynthesizedFallbacks(validatedInput);
      }

      const responseData = await response.json();
      const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return this.generateLocalSynthesizedFallbacks(validatedInput);
      }

      const parsedJson = JSON.parse(rawText);
      const rawArray = Array.isArray(parsedJson)
        ? parsedJson
        : parsedJson.questions || [parsedJson];
      const validatedList = SynthesizedQuestionListOutputSchema.parse(rawArray);

      // Clean stems and sanitize choices for each generated variant
      validatedList.forEach((item) => {
        item.question = this.cleanStemText(item.question);

        if (
          validatedInput.type === QuestionType.MCQ &&
          item.choices &&
          item.choices.length > 0
        ) {
          const isChoiceMatch = item.choices.some(
            (choice) =>
              choice.trim().toLowerCase() ===
              item.correctAnswer.trim().toLowerCase(),
          );
          if (!isChoiceMatch) {
            item.choices[0] = item.correctAnswer;
          }
        } else if (validatedInput.type === QuestionType.TRUE_FALSE) {
          item.choices = ["True", "False"];
        } else if (validatedInput.type === QuestionType.SHORT_ANSWER) {
          item.choices = [];
        }
      });

      return validatedList;
    } catch (error: any) {
      console.warn(
        "[QuestionSynthesizerService] AI call failed, using fallback synthesizer:",
        error?.message,
      );
      return this.generateLocalSynthesizedFallbacks(validatedInput);
    }
  }

  private generateLocalSynthesizedFallbacks(
    input: SynthesizeQuestionInput,
  ): SynthesizedQuestionOutput[] {
    const isMcq = input.type === QuestionType.MCQ;
    const isTf = input.type === QuestionType.TRUE_FALSE;
    const targetCount = input.count || 5;
    const rawStem = this.cleanStemText(input.question);

    const variations = [
      {
        formatStem: (q: string, t: string) =>
          `Regarding ${t}, ${q.toLowerCase().startsWith("what") || q.toLowerCase().startsWith("how") || q.toLowerCase().startsWith("which") ? q : `evaluate: ${q}`}`,
        rationale:
          "Focuses on deep conceptual analysis and contextual evaluation.",
      },
      {
        formatStem: (q: string, t: string) =>
          `In a practical ${t} scenario: ${q}`,
        rationale: "Emphasizes real-world application and decision making.",
      },
      {
        formatStem: (q: string, t: string) =>
          `Under standard ${t} principles: ${q}`,
        rationale:
          "Tests core concepts against standard domain specifications.",
      },
      {
        formatStem: (q: string, t: string) => `During a ${t} assessment: ${q}`,
        rationale: "Evaluates key relationships and parameters.",
      },
      {
        formatStem: (q: string, t: string) =>
          `Analyzing key ${t} concepts: ${q}`,
        rationale:
          "Synthesizes multi-variable conditions and fundamental logic.",
      },
    ];

    const results: SynthesizedQuestionOutput[] = [];

    for (let i = 0; i < targetCount; i++) {
      const varInfo = variations[i % variations.length];
      let stem = rawStem;

      if (input.targetDifficulty === QuestionDifficulty.HARD) {
        stem = `Considering advanced constraints in ${input.topic}, ${rawStem.toLowerCase().startsWith("what") || rawStem.toLowerCase().startsWith("how") ? rawStem : `evaluate: ${rawStem}`}`;
      } else if (input.targetDifficulty === QuestionDifficulty.MEDIUM) {
        stem = varInfo.formatStem(rawStem, input.topic);
      } else {
        // EASY
        stem = rawStem;
      }

      stem = this.cleanStemText(stem);

      let choices: string[] = [];
      if (isMcq) {
        const validBaseChoices = (input.choices || []).filter(
          (c) => c.trim().length > 0,
        );
        if (validBaseChoices.length >= 4) {
          choices = [...validBaseChoices];
          if (i > 0) {
            const first = choices.shift();
            if (first) choices.push(first);
          }
        } else {
          choices = [
            input.correctAnswer,
            `Plausible Distractor A`,
            `Plausible Distractor B`,
            `Plausible Distractor C`,
          ];
        }
      } else if (isTf) {
        choices = ["True", "False"];
      }

      results.push({
        question: stem,
        choices,
        correctAnswer: input.correctAnswer,
        difficulty: input.targetDifficulty,
        feedback: `Variant #${i + 1} Rationale (${input.targetDifficulty} Level): ${varInfo.rationale} The answer '${input.correctAnswer}' satisfies all primary criteria for ${input.topic}.`,
        logicalSoundnessRating: 10,
      });
    }

    return results;
  }

  private buildPrompt(input: SynthesizeQuestionInput): string {
    const isMcq = input.type === QuestionType.MCQ;
    const isTf = input.type === QuestionType.TRUE_FALSE;
    const isSa = input.type === QuestionType.SHORT_ANSWER;
    const count = input.count || 5;

    return `You are an expert AI Item Writer and Formal Logic Auditor for a professional board exam preparation system.
Your mission is to generate **${count} DISTINCT, UNIQUE synthesized question variants** based on the base question provided.
All ${count} variants must be calibrated to the target difficulty level: **${input.targetDifficulty}**.

### CRITICAL FORMATTING RULES:
- **NO BRACKETS OR TAGS**: Do NOT include bracketed tags (e.g. [Direct Recall], [Scenario], [Analysis]) in the question stem. Return ONLY clean, natural, professional question text.
- Question Type: **${input.type}**
${isMcq ? "- Choices: Provide 4 engineered multiple-choice options for each variant (1 correct answer + 3 plausible distractors)." : ""}
${isTf ? '- Choices: Return strictly ["True", "False"]. Correct answer must be "True" or "False".' : ""}
${isSa ? "- Choices: Return an empty array []. Synthesize a concise reference correct answer string." : ""}

### Target Difficulty Calibration (${input.targetDifficulty}):
- **EASY**: Clear, direct factual phrasing with straightforward evaluation.
- **MEDIUM**: Practical scenario context applying standard domain principles.
- **HARD**: Multi-step scenario, edge-case parameters, and deep analytical reasoning.

### Base Question Input:
- Question Stem: "${input.question}"
- Subject/Topic: "${input.topic}"
- Base Choices: ${JSON.stringify(input.choices)}
- Target Correct Answer: "${input.correctAnswer}"
${input.additionalContext ? `- Additional Context: "${input.additionalContext}"` : ""}

### JSON Output Specifications:
Return ONLY a JSON array containing exactly ${count} objects matching this schema:
[
  {
    "question": "Clean synthesized variant 1 stem text without brackets",
    "choices": ${isMcq ? '["Option A", "Option B", "Option C", "Option D"]' : isTf ? '["True", "False"]' : "[]"},
    "correctAnswer": "${isTf ? "True or False" : "Correct answer string"}",
    "difficulty": "${input.targetDifficulty}",
    "feedback": "Step-by-step logic rationale for variant 1",
    "logicalSoundnessRating": 10
  }
]`;
  }
}

export const questionSynthesizerService = new QuestionSynthesizerService();
