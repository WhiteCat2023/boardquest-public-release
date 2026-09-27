import z from "zod";
import { ApiError } from "../../utils/apiError";

export const ParaphraseItemInputSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  question: z.string().min(3, "Question text is required"),
  topic: z.string().optional().default("General"),
  subject: z.string().optional().default("Board Exam"),
  difficulty: z.string().optional(),
  tone: z
    .enum(["BOARD_EXAM", "SCENARIO", "CONCISE", "SIMPLIFIED"])
    .optional()
    .default("BOARD_EXAM"),
  variationIndex: z.number().optional().default(0),
});

export type ParaphraseItemInput = z.infer<typeof ParaphraseItemInputSchema>;

export const ParaphraseItemOutputSchema = z.object({
  id: z.string(),
  original: z.string(),
  paraphrased: z.string(),
  alternatives: z.array(z.string()).optional().default([]),
});

export type ParaphraseItemOutput = z.infer<typeof ParaphraseItemOutputSchema>;

export class QuestionParaphraserService {
  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || "";
  }

  /**
   * Cleans unwanted bracketed tags, introductory phrases, and quotation artifacts.
   */
  private cleanStemText(text: string): string {
    if (!text) return "";
    let cleaned = text.replace(/\[[^\]]*\]/g, "").trim();
    cleaned = cleaned.replace(/^In relation to [^:]+:\s*/i, "").trim();
    cleaned = cleaned.replace(/^Here is (a|the) paraphrased.*:\s*/i, "").trim();
    cleaned = cleaned.replace(/^Paraphrased question:\s*/i, "").trim();
    cleaned = cleaned.replace(/^"|"$/g, "").trim();
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
  }

  /**
   * Generates smart algorithmic fallback variations if Gemini API is unreachable or unconfigured.
   */
  private generateFallbackParaphrases(
    item: ParaphraseItemInput,
  ): ParaphraseItemOutput {
    const raw = this.cleanStemText(item.question);
    const topic = item.topic && item.topic !== "General" ? item.topic : "clinical";
    const cleanLower = raw.replace(/\?$/, "").trim();

    const variants: string[] = [
      `In the context of ${topic} diagnostics, ${cleanLower.toLowerCase().startsWith("what") || cleanLower.toLowerCase().startsWith("which") ? cleanLower : `determine: ${cleanLower}`}?`,
      `Which of the following best characterizes ${cleanLower.toLowerCase().replace(/^(what is|which is|how does)\s+/i, "")}?`,
      `Under standard ${topic} evaluation protocols, ${cleanLower.toLowerCase().startsWith("what") || cleanLower.toLowerCase().startsWith("which") ? cleanLower : `identify the principle governing: ${cleanLower}`}?`,
      `Regarding ${topic}, identify the key parameter evaluated when: ${cleanLower}?`,
      `From a clinical laboratory perspective, ${cleanLower.toLowerCase().startsWith("what") ? cleanLower : `analyze: ${cleanLower}`}?`,
    ];

    const selectedIndex = (item.variationIndex || 0) % variants.length;
    const primary = this.cleanStemText(variants[selectedIndex]);
    const alternatives = variants
      .filter((_, idx) => idx !== selectedIndex)
      .slice(0, 3)
      .map((v) => this.cleanStemText(v));

    return {
      id: item.id,
      original: raw,
      paraphrased: primary,
      alternatives,
    };
  }

  private buildPrompt(
    items: ParaphraseItemInput[],
    tone: "BOARD_EXAM" | "SCENARIO" | "CONCISE" | "SIMPLIFIED",
  ): string {
    let toneInstruction = "";
    switch (tone) {
      case "SCENARIO":
        toneInstruction =
          "Frame the question stem within a realistic clinical scenario or laboratory diagnostic context while retaining exact diagnostic values.";
        break;
      case "CONCISE":
        toneInstruction =
          "Make the stem extremely direct, eliminating all unnecessary filler words and redundant phrases while strictly preserving technical precision.";
        break;
      case "SIMPLIFIED":
        toneInstruction =
          "Improve readability using active voice and clear syntax, making the sentence structure direct without dumbing down technical terms.";
        break;
      case "BOARD_EXAM":
      default:
        toneInstruction =
          "Elevate the phrasing to formal licensure/board examination standards. Use professional clinical vocabulary, clear antecedent phrasing, and precise syntax.";
        break;
    }

    const questionsJson = JSON.stringify(
      items.map((it) => ({
        id: it.id,
        stem: it.question,
        topic: it.topic || "Medical Technology",
        seed: it.variationIndex || 0,
      })),
      null,
      2,
    );

    return `You are a Senior Item Writer and Board Examination Review Specialist for Medical Technology / Clinical Laboratory Science.
Your objective is to paraphrase and linguistically refine the provided question stems.

### PARAPHRASING STYLE DIRECTIVE:
${toneInstruction}

### MANDATORY RULES:
1. Preserve exact numbers, units (e.g., mg/dL, mmol/L, % HbA1c), reference ranges, and scientific names.
2. Do NOT add bracketed tags (e.g. no [Direct Recall], no [Scenario]).
3. Output ONLY professional question stems ending with a question mark.
4. For each question, provide:
   - "paraphrased": The primary, highest quality rewritten stem.
   - "alternatives": An array of 2 to 3 alternative paraphrased stems offering different sentence structures.
5. Return strictly a JSON array matching the schema specified below.

### INPUT QUESTIONS:
${questionsJson}

### EXPECTED JSON OUTPUT SCHEMA:
[
  {
    "id": "question_id_here",
    "paraphrased": "Primary paraphrased stem text?",
    "alternatives": [
      "Alternative variant 1 stem text?",
      "Alternative variant 2 stem text?"
    ]
  }
]`;
  }

  /**
   * Paraphrases a batch of questions in bulk.
   */
  async paraphraseBatch(
    items: ParaphraseItemInput[],
  ): Promise<ParaphraseItemOutput[]> {
    if (!items || items.length === 0) return [];

    const validatedItems = items.map((it) => ParaphraseItemInputSchema.parse(it));
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.warn(
        "[QuestionParaphraserService] GEMINI_API_KEY missing. Using fallback paraphraser.",
      );
      return validatedItems.map((item) => this.generateFallbackParaphrases(item));
    }

    const tone = validatedItems[0]?.tone || "BOARD_EXAM";
    const prompt = this.buildPrompt(validatedItems, tone);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.45,
            },
          }),
        },
      );

      if (!response.ok) {
        console.warn(
          `[QuestionParaphraserService] Gemini API returned status ${response.status}. Using fallback paraphraser.`,
        );
        return validatedItems.map((item) =>
          this.generateFallbackParaphrases(item),
        );
      }

      const responseData = await response.json();
      const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return validatedItems.map((item) =>
          this.generateFallbackParaphrases(item),
        );
      }

      const parsedJson = JSON.parse(rawText);
      const rawArray: any[] = Array.isArray(parsedJson)
        ? parsedJson
        : parsedJson.questions || [parsedJson];

      const resultMap = new Map<string, { paraphrased: string; alternatives?: string[] }>();
      rawArray.forEach((entry) => {
        if (entry.id) {
          resultMap.set(String(entry.id), {
            paraphrased: this.cleanStemText(entry.paraphrased || ""),
            alternatives: Array.isArray(entry.alternatives)
              ? entry.alternatives.map((a: string) => this.cleanStemText(a))
              : [],
          });
        }
      });

      return validatedItems.map((item) => {
        const generated = resultMap.get(item.id);
        if (generated && generated.paraphrased) {
          return {
            id: item.id,
            original: this.cleanStemText(item.question),
            paraphrased: generated.paraphrased,
            alternatives: generated.alternatives || [],
          };
        }
        return this.generateFallbackParaphrases(item);
      });
    } catch (err: any) {
      console.warn(
        "[QuestionParaphraserService] AI paraphrasing call encountered error, falling back:",
        err?.message,
      );
      return validatedItems.map((item) => this.generateFallbackParaphrases(item));
    }
  }

  /**
   * Re-paraphrases a single question stem.
   */
  async paraphraseSingle(
    item: ParaphraseItemInput,
  ): Promise<ParaphraseItemOutput> {
    const list = await this.paraphraseBatch([item]);
    return (
      list[0] ||
      this.generateFallbackParaphrases(ParaphraseItemInputSchema.parse(item))
    );
  }
}

export const questionParaphraserService = new QuestionParaphraserService();
