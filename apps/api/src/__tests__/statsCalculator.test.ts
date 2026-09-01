import {
  calculateMean,
  calculateMedian,
  calculateMode,
  calculatePercentileRanks,
  calculateMedTechGeneralAverage,
} from "../utils/statsCalculator";

describe("statsCalculator utility", () => {
  describe("calculateMean", () => {
    it("computes average correctly", () => {
      expect(calculateMean([80, 90, 100])).toBe(90);
      expect(calculateMean([75.5, 82.25, 90.75])).toBe(82.83);
    });

    it("returns 0 for empty array", () => {
      expect(calculateMean([])).toBe(0);
    });
  });

  describe("calculateMedian", () => {
    it("computes median for odd length array", () => {
      expect(calculateMedian([70, 80, 90])).toBe(80);
      expect(calculateMedian([90, 50, 70, 60, 80])).toBe(70);
    });

    it("computes median for even length array", () => {
      expect(calculateMedian([70, 80, 90, 100])).toBe(85);
    });

    it("returns 0 for empty array", () => {
      expect(calculateMedian([])).toBe(0);
    });
  });

  describe("calculateMode", () => {
    it("computes single mode correctly", () => {
      expect(calculateMode([80, 80, 90, 100])).toEqual([80]);
    });

    it("computes bimodal correctly", () => {
      expect(calculateMode([80, 80, 90, 90, 100])).toEqual([80, 90]);
    });

    it("returns empty array for all distinct scores", () => {
      expect(calculateMode([70, 80, 90, 100])).toEqual([]);
    });

    it("returns single element for array of length 1", () => {
      expect(calculateMode([85])).toEqual([85]);
    });
  });

  describe("calculatePercentileRanks", () => {
    it("computes midpoint percentiles properly handling ties", () => {
      const candidates = [
        { candidateId: "c1", score: 60 },
        { candidateId: "c2", score: 70 },
        { candidateId: "c3", score: 80 },
        { candidateId: "c4", score: 90 },
      ];
      const percentiles = calculatePercentileRanks(candidates);
      expect(percentiles.get("c1")).toBe(12.5); // (0 + 0.5) / 4 * 100
      expect(percentiles.get("c2")).toBe(37.5); // (1 + 0.5) / 4 * 100
      expect(percentiles.get("c3")).toBe(62.5); // (2 + 0.5) / 4 * 100
      expect(percentiles.get("c4")).toBe(87.5); // (3 + 0.5) / 4 * 100
    });

    it("handles tied top scores correctly", () => {
      const candidates = [
        { candidateId: "c1", score: 50 },
        { candidateId: "c2", score: 100 },
        { candidateId: "c3", score: 100 },
      ];
      const percentiles = calculatePercentileRanks(candidates);
      expect(percentiles.get("c1")).toBe(16.67); // (0 + 0.5) / 3 * 100
      expect(percentiles.get("c2")).toBe(66.67); // (1 + 1) / 3 * 100
      expect(percentiles.get("c3")).toBe(66.67);
    });
  });

  describe("calculateMedTechGeneralAverage", () => {
    it("computes GWA based on 20/20/20/20/10/10 weights and passes when >= 75 and no subject < 50", () => {
      const result = calculateMedTechGeneralAverage([
        { subject: "Clinical Chemistry", score: 80 }, // 80 * 0.20 = 16
        { subject: "Microbiology & Parasitology", score: 85 }, // 85 * 0.20 = 17
        { subject: "Hematology", score: 78 }, // 78 * 0.20 = 15.6
        { subject: "Immunology & Serology and Immunohematology", score: 82 }, // 82 * 0.20 = 16.4
        { subject: "Clinical Microscopy & Parasitology", score: 75 }, // 75 * 0.10 = 7.5
        { subject: "Histopathology and Medtech Laws", score: 80 }, // 80 * 0.10 = 8.0
      ]);
      // 16 + 17 + 15.6 + 16.4 + 7.5 + 8.0 = 80.5
      expect(result.gwa).toBe(80.5);
      expect(result.passed).toBe(true);
      expect(result.conditionFailed).toBe(false);
    });

    it("fails when a major subject is below 50 even if GWA >= 75", () => {
      const result = calculateMedTechGeneralAverage([
        { subject: "Clinical Chemistry", score: 95 },
        { subject: "Microbiology & Parasitology", score: 95 },
        { subject: "Hematology", score: 45 }, // < 50 condition failure!
        { subject: "Immunology & Serology and Immunohematology", score: 90 },
        { subject: "Clinical Microscopy & Parasitology", score: 85 },
        { subject: "Histopathology and Medtech Laws", score: 85 },
      ]);
      expect(result.gwa).toBeGreaterThanOrEqual(75);
      expect(result.conditionFailed).toBe(true);
      expect(result.passed).toBe(false);
      expect(result.failedSubjects).toContain("Hematology");
    });
  });
});
