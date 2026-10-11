import { questionParaphraserService, ParaphraseItemInput } from "../services/admin/questionParaphraser.service";

describe("QuestionParaphraserService - Question Type Alignment", () => {
  beforeAll(() => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 503,
        json: async () => ({}),
      } as any)
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("Fallback and AI generation alignment", () => {
    it("should format TRUE_FALSE questions as declarative statements ending in a period", async () => {
      const input: ParaphraseItemInput = {
        id: "tf-1",
        question: "is the corona vaccine effective?",
        topic: "Immunology",
        type: "TRUE_FALSE",
        tone: "BOARD_EXAM",
        variationIndex: 0,
      };

      const result = await questionParaphraserService.paraphraseSingle(input);

      expect(result.id).toBe("tf-1");
      // Must not end in a question mark
      expect(result.paraphrased.endsWith("?")).toBe(false);
      expect(result.paraphrased.endsWith(".")).toBe(true);

      // All alternative variants must also end with a period and never a question mark
      expect(result.alternatives.length).toBeGreaterThan(0);
      result.alternatives.forEach((alt) => {
        expect(alt.endsWith("?")).toBe(false);
        expect(alt.endsWith(".")).toBe(true);
      });
    });

    it("should format MCQ questions as question stems ending in '?' or ':'", async () => {
      const input: ParaphraseItemInput = {
        id: "mcq-1",
        question: "Which cell is responsible for antibody production?",
        topic: "Hematology",
        type: "MCQ",
        tone: "BOARD_EXAM",
        variationIndex: 0,
      };

      const result = await questionParaphraserService.paraphraseSingle(input);

      expect(result.id).toBe("mcq-1");
      const endsProperly = result.paraphrased.endsWith("?") || result.paraphrased.endsWith(":");
      expect(endsProperly).toBe(true);

      result.alternatives.forEach((alt) => {
        expect(alt.endsWith("?") || alt.endsWith(":")).toBe(true);
      });
    });

    it("should format SHORT_ANSWER questions as direct prompts", async () => {
      const input: ParaphraseItemInput = {
        id: "sa-1",
        question: "Define the term azotemia",
        topic: "Clinical Chemistry",
        type: "SHORT_ANSWER",
        tone: "BOARD_EXAM",
        variationIndex: 0,
      };

      const result = await questionParaphraserService.paraphraseSingle(input);

      expect(result.id).toBe("sa-1");
      expect(result.paraphrased.length).toBeGreaterThan(5);
      expect(result.alternatives.length).toBeGreaterThan(0);
    });
  });
});
