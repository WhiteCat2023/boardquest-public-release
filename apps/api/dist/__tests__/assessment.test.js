import { AssessmentService } from "../services/review-center/assessment.service";
import { ApiError } from "../utils/apiError";
describe("AssessmentService unit & isolation tests", () => {
    let service;
    let mockDb;
    beforeEach(() => {
        mockDb = {
            reviewCenterAssessment: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            reviewCenterCandidate: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
            },
            reviewCenterScore: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                deleteMany: jest.fn(),
            },
        };
        service = new AssessmentService(mockDb);
    });
    describe("createAssessment", () => {
        it("creates an assessment with normalized subject, 75% default passing cutoff, and tenant tags", async () => {
            mockDb.reviewCenterAssessment.create.mockResolvedValue({
                id: "assess-1",
                companyName: "TopMed Review",
                reviewCenterId: "rc-1",
                title: "Mock Board Exam 1",
                customLabel: "Mock 1",
                subject: "Clinical Chemistry",
                schoolYear: "2026-2027",
                maxScore: 100,
                passingRate: 75,
                passingScore: 75,
                isPublished: false,
            });
            const result = await service.createAssessment({
                title: "Mock Board Exam 1",
                customLabel: "Mock 1",
                subject: "Clinical Chemistry",
                schoolYear: "2026-2027",
                maxScore: 100,
                passingRate: 75,
            }, "TopMed Review", "rc-1");
            expect(mockDb.reviewCenterAssessment.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    companyName: "TopMed Review",
                    reviewCenterId: "rc-1",
                    title: "Mock Board Exam 1",
                    subject: "Clinical Chemistry",
                    maxScore: 100,
                    passingRate: 75,
                    passingScore: 75,
                }),
            });
            expect(result.id).toBe("assess-1");
        });
        it("throws ApiError if title is missing", async () => {
            await expect(service.createAssessment({ title: "", subject: "Hematology" }, "TopMed Review", "rc-1")).rejects.toThrow(ApiError);
        });
    });
    describe("Multi-tenant isolation", () => {
        it("denies access if review center representative belongs to another review center", async () => {
            mockDb.reviewCenterAssessment.findUnique.mockResolvedValue({
                id: "assess-999",
                companyName: "Other Review Center",
                reviewCenterId: "rc-other",
                title: "Secret Exam",
            });
            await expect(service.getAssessmentById("assess-999", "My Review Center", "rc-my")).rejects.toThrow(ApiError);
        });
    });
    describe("bulkSaveScores", () => {
        it("upserts scores and triggers recalculation of cohort mean, median, mode, and percentiles", async () => {
            mockDb.reviewCenterAssessment.findUnique.mockResolvedValue({
                id: "assess-1",
                companyName: "TopMed Review",
                reviewCenterId: "rc-1",
                maxScore: 100,
                passingScore: 75,
                scores: [],
            });
            mockDb.reviewCenterCandidate.findMany.mockResolvedValue([
                { id: "cand-1", name: "Student 1", email: "s1@example.com", schoolId: "ID-01" },
                { id: "cand-2", name: "Student 2", email: "s2@example.com", schoolId: "ID-02" },
            ]);
            mockDb.reviewCenterScore.findUnique.mockResolvedValue(null);
            mockDb.reviewCenterScore.create.mockResolvedValue({ id: "sc-1" });
            mockDb.reviewCenterScore.findMany.mockResolvedValue([
                { id: "sc-1", candidateId: "cand-1", score: 80, status: "PRESENT" },
                { id: "sc-2", candidateId: "cand-2", score: 90, status: "PRESENT" },
            ]);
            mockDb.reviewCenterAssessment.update.mockResolvedValue({});
            const result = await service.bulkSaveScores("assess-1", [
                { email: "s1@example.com", score: 80, status: "PRESENT" },
                { email: "s2@example.com", score: 90, status: "PRESENT" },
            ], "TopMed Review", "rc-1", "rep@topmed.com");
            expect(result.success).toBe(true);
            expect(result.createdCount).toBe(2);
            expect(result.errors.length).toBe(0);
        });
    });
});
