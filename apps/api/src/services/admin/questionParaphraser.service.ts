import z from "zod";
import { ApiError } from "../../utils/apiError";

export const ParaphraseItemInputSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  question: z.string().min(3, "Question text is required"),
  topic: z.string().optional().default("General"),
  subject: z.string().optional().default("Board Exam"),
  difficulty: z.string().optional(),
  type: z
    .enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"])
    .optional()
    .default("MCQ"),
  tone: z
    .enum(["BOARD_EXAM", "SCENARIO", "CONCISE", "SIMPLIFIED"])
    .optional()
    .default("BOARD_EXAM"),
  variationIndex: z.number().optional().default(0),
});

export type ParaphraseItemInput = z.input<typeof ParaphraseItemInputSchema>;
export type ParaphraseItemValidated = z.infer<typeof ParaphraseItemInputSchema>;

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
   * Cleans unwanted bracketed tags, introductory phrases, quotation artifacts,
   * and enforces proper punctuation based on question type.
   */
  private cleanStemText(
    text: string,
    type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" = "MCQ",
  ): string {
    if (!text) return "";
    let cleaned = text.replace(/\[[^\]]*\]/g, "").trim();
    cleaned = cleaned.replace(/^In relation to [^:]+:\s*/i, "").trim();
    cleaned = cleaned.replace(/^Here is (a|the) paraphrased.*:\s*/i, "").trim();
    cleaned = cleaned.replace(/^Paraphrased question:\s*/i, "").trim();
    cleaned = cleaned.replace(/^(True or False|True\/False|Statement|Assertion):\s*/i, "").trim();
    cleaned = cleaned.replace(/^"|"$/g, "").trim();
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    if (type === "TRUE_FALSE") {
      // True/False questions MUST be declarative statements ending with a period.
      // Strip trailing question marks, colons, or semicolons.
      cleaned = cleaned.replace(/[?:]+$/, "").trim();
      if (!cleaned.endsWith(".")) {
        cleaned = `${cleaned}.`;
      }
    } else if (type === "MCQ") {
      // MCQ questions typically end with a question mark or a completion colon.
      if (!cleaned.endsWith("?") && !cleaned.endsWith(":")) {
        cleaned = cleaned.replace(/\.+$/, "").trim();
        cleaned = `${cleaned}?`;
      }
    }

    return cleaned;
  }

  /**
   * Generates smart algorithmic fallback variations if Gemini API is unreachable or unconfigured.
   */
  private generateFallbackParaphrases(
    item: ParaphraseItemInput,
  ): ParaphraseItemOutput {
    const type = item.type || "MCQ";
    const raw = this.cleanStemText(item.question, type);
    const topic = item.topic && item.topic !== "General" ? item.topic : "clinical";

    let variants: string[] = [];

    if (type === "TRUE_FALSE") {
      // Convert any interrogative phrasing into a declarative statement
      let statement = raw
        .replace(/[?.]+$/, "")
        .replace(/^(is|are|was|were|does|do|can|could|should|will|would|has|have)\s+/i, "")
        .replace(/^(what is|which is|how is)\s+/i, "")
        .trim();
      if (statement.length > 0) {
        statement = statement.charAt(0).toUpperCase() + statement.slice(1);
      }

      variants = [
        `In ${topic} diagnostics, ${statement.charAt(0).toLowerCase() + statement.slice(1)} is an established clinical observation.`,
        `Under standard ${topic} evaluation protocols, ${statement.charAt(0).toLowerCase() + statement.slice(1)} represents a documented benchmark.`,
        `Clinical laboratory evidence confirms that ${statement.charAt(0).toLowerCase() + statement.slice(1)}.`,
        `According to established criteria in ${topic}, ${statement.charAt(0).toLowerCase() + statement.slice(1)}.`,
        `Diagnostic assessment validates that ${statement.charAt(0).toLowerCase() + statement.slice(1)}.`,
      ];
    } else if (type === "SHORT_ANSWER") {
      const cleanLower = raw.replace(/[?.]+$/, "").trim();
      variants = [
        `Identify the primary parameter governing: ${cleanLower}.`,
        `In ${topic} evaluation, state the definitive diagnostic criteria for: ${cleanLower}.`,
        `What specific marker or value is evaluated in: ${cleanLower}?`,
        `Specify the key clinical mechanism associated with: ${cleanLower}.`,
        `Define the principal standard referenced when: ${cleanLower}.`,
      ];
    } else {
      // MCQ
      const cleanLower = raw.replace(/\?$/, "").trim();
      variants = [
        `In the context of ${topic} diagnostics, ${cleanLower.toLowerCase().startsWith("what") || cleanLower.toLowerCase().startsWith("which") ? cleanLower : `determine: ${cleanLower}`}?`,
        `Which of the following best characterizes ${cleanLower.toLowerCase().replace(/^(what is|which is|how does)\s+/i, "")}?`,
        `Under standard ${topic} evaluation protocols, ${cleanLower.toLowerCase().startsWith("what") || cleanLower.toLowerCase().startsWith("which") ? cleanLower : `identify the principle governing: ${cleanLower}`}?`,
        `Regarding ${topic}, identify the key parameter evaluated when: ${cleanLower}?`,
        `From a clinical laboratory perspective, ${cleanLower.toLowerCase().startsWith("what") ? cleanLower : `analyze: ${cleanLower}`}?`,
      ];
    }

    const selectedIndex = (item.variationIndex || 0) % variants.length;
    const primary = this.cleanStemText(variants[selectedIndex], type);
    const alternatives = variants
      .filter((_, idx) => idx !== selectedIndex)
      .slice(0, 3)
      .map((v) => this.cleanStemText(v, type));

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
          "Frame the stem within a realistic clinical scenario or laboratory diagnostic context while retaining exact diagnostic values.";
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
        questionType: it.type || "MCQ",
        seed: it.variationIndex || 0,
      })),
      null,
      2,
    );

    return `You are a Senior Item Writer and Board Examination Review Specialist for Medical Technology / Clinical Laboratory Science.
Your objective is to paraphrase and linguistically refine the provided question stems, STRICTLY adhering to each item's designated questionType.

### QUESTION TYPE ALIGNMENT DIRECTIVES (CRITICAL):
1. **TRUE_FALSE**:
   - The output MUST be a **formal declarative statement / factual proposition** ending strictly with a period ('.').
   - **ABSOLUTE RULE**: NEVER output an interrogative question ending with a question mark ('?'). Do NOT use question stems (e.g., "What is...", "Which of the following...", "Is it true that...").
   - If the input stem was phrased as an interrogative (e.g., "is the corona vaccine effective?"), convert it into a testable declarative proposition (e.g., "The SARS-CoV-2 vaccine demonstrates documented clinical efficacy in mitigating disease severity.").
   - Both "paraphrased" and all "alternatives" MUST be declarative assertions ending with a period ('.').

2. **MCQ (Multiple Choice Questions)**:
   - Formulate as a formal interrogative question stem ending with a question mark ('?') or a sentence completion stem ending with a colon (':').
   - Example: "Which diagnostic biomarker exhibits the highest specificity for acute myocardial infarction?"

3. **SHORT_ANSWER**:
   - Formulate as a direct, concise question stem ending with '?' or an imperative prompt ending with a period ('.') that elicits a specific term, entity, laboratory value, or concept (e.g., "Identify the primary reagent used in...", "What is the critical threshold value for...?").

### PARAPHRASING STYLE DIRECTIVE:
${toneInstruction}

### MANDATORY RULES:
1. Preserve exact numbers, units (e.g., mg/dL, mmol/L, % HbA1c), reference ranges, and scientific names.
2. Do NOT add bracketed tags (e.g. no [Direct Recall], no [Scenario]).
3. Align punctuation and grammar strictly with the designated questionType:
   - TRUE_FALSE items MUST end with a period ('.') and MUST NOT end with a question mark ('?').
   - MCQ items MUST end with a question mark ('?') or a colon (':').
4. For each question, provide:
   - "paraphrased": The primary, highest quality rewritten stem conforming to its questionType.
   - "alternatives": An array of 2 to 3 alternative paraphrased stems offering different sentence structures, all conforming strictly to the same questionType.
5. Return strictly a JSON array matching the schema specified below.

### INPUT QUESTIONS:
${questionsJson}

### EXPECTED JSON OUTPUT SCHEMA:
[
  {
    "id": "question_id_here",
    "paraphrased": "Primary rewritten stem (declarative statement ending in '.' for TRUE_FALSE; question ending in '?' or ':' for MCQ)",
    "alternatives": [
      "Alternative variant 1 stem text conforming to the questionType",
      "Alternative variant 2 stem text conforming to the questionType"
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
        if (process.env.NODE_ENV !== "test") {
          console.warn(
            `[QuestionParaphraserService] Gemini API returned status ${response.status}. Using fallback paraphraser.`,
          );
        }
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

      const typeMap = new Map<string, "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER">();
      validatedItems.forEach((it) => typeMap.set(it.id, it.type));

      const resultMap = new Map<string, { paraphrased: string; alternatives?: string[] }>();
      rawArray.forEach((entry) => {
        if (entry.id) {
          const itemType = typeMap.get(String(entry.id)) || "MCQ";
          resultMap.set(String(entry.id), {
            paraphrased: this.cleanStemText(entry.paraphrased || "", itemType),
            alternatives: Array.isArray(entry.alternatives)
              ? entry.alternatives.map((a: string) => this.cleanStemText(a, itemType))
              : [],
          });
        }
      });

      return validatedItems.map((item) => {
        const generated = resultMap.get(item.id);
        if (generated && generated.paraphrased) {
          return {
            id: item.id,
            original: this.cleanStemText(item.question, item.type),
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
