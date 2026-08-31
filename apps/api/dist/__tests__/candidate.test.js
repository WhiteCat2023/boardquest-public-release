import "./setup";
import request from "supertest";
import express from "express";
import candidateRouter from "../routes/review-center/candidate.routes";
import * as candidateService from "../services/review-center/candidate.service";
import { normalizeSchoolYearString } from "../services/review-center/candidate.service";
// Mock review center auth middleware
jest.mock("../middleware/reviewCenterAuth.middleware", () => ({
    authenticateReviewCenterToken: jest.fn((req, res, next) => {
        req.user = {
            id: "rc_user_1",
            email: "rep@reviewcenter.edu.ph",
            companyName: "TopRank Review Academy",
            role: "REVIEW_CENTER_REPRESENTATIVE",
            reviewCenterId: "rc_1",
        };
        next();
    }),
}));
// Mock candidate service
jest.mock("../services/review-center/candidate.service", () => {
    const original = jest.requireActual("../services/review-center/candidate.service");
    return {
        ...original,
        getReviewCenterSchoolYears: jest.fn(),
        createReviewCenterSchoolYear: jest.fn(),
        deleteReviewCenterSchoolYear: jest.fn(),
        getReviewCenterCandidates: jest.fn(),
        enrollCandidate: jest.fn(),
        bulkEnrollCandidates: jest.fn(),
        updateCandidate: jest.fn(),
        deleteCandidate: jest.fn(),
    };
});
let app;
beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/review-center-app/candidates", candidateRouter);
});
describe("Review Center Candidate Routes & Formatting", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("School Year Normalization Utility", () => {
        it("should format 4-digit start year into consecutive YYYY-YYYY format", () => {
            expect(normalizeSchoolYearString("2026")).toBe("2026-2027");
            expect(normalizeSchoolYearString("2025")).toBe("2025-2026");
            expect(normalizeSchoolYearString("2024")).toBe("2024-2025");
        });
        it("should format 8 continuous digits into YYYY-YYYY format", () => {
            expect(normalizeSchoolYearString("20262027")).toBe("2026-2027");
        });
        it("should strip S.Y. prefix and whitespace", () => {
            expect(normalizeSchoolYearString("S.Y. 2026-2027")).toBe("2026-2027");
            expect(normalizeSchoolYearString("  sy 2026-2027 ")).toBe("2026-2027");
        });
    });
    describe("GET /api/review-center-app/candidates/school-years", () => {
        it("should return school years list successfully", async () => {
            const mockYears = [
                { id: "sy_1", schoolYear: "2026-2027", isCurrent: true, createdAt: new Date() },
                { id: "sy_2", schoolYear: "2025-2026", isCurrent: false, createdAt: new Date() },
            ];
            candidateService.getReviewCenterSchoolYears.mockResolvedValue(mockYears);
            const response = await request(app).get("/api/review-center-app/candidates/school-years");
            expect(response.status).toBe(200);
            expect(response.body.data.schoolYears).toBeDefined();
            expect(response.body.data.schoolYears.length).toBe(2);
        });
    });
    describe("POST /api/review-center-app/candidates/school-years", () => {
        it("should create school year cohort successfully", async () => {
            const mockCreated = {
                id: "sy_1",
                schoolYear: "2026-2027",
                createdAt: new Date(),
            };
            candidateService.createReviewCenterSchoolYear.mockResolvedValue(mockCreated);
            const response = await request(app)
                .post("/api/review-center-app/candidates/school-years")
                .send({ schoolYear: "2026-2027" });
            expect(response.status).toBe(201);
            expect(response.body.data.schoolYear).toBeDefined();
            expect(response.body.data.schoolYear.schoolYear).toBe("2026-2027");
        });
        it("should return 400 if schoolYear field is missing", async () => {
            const response = await request(app)
                .post("/api/review-center-app/candidates/school-years")
                .send({});
            expect(response.status).toBe(400);
        });
    });
    describe("DELETE /api/review-center-app/candidates/school-years/:schoolYear", () => {
        it("should delete school year cohort successfully", async () => {
            candidateService.deleteReviewCenterSchoolYear.mockResolvedValue(true);
            const response = await request(app).delete("/api/review-center-app/candidates/school-years/2026-2027");
            expect(response.status).toBe(200);
            expect(response.body.message).toContain("removed successfully");
        });
    });
    describe("GET /api/review-center-app/candidates/get", () => {
        it("should return candidates list successfully", async () => {
            const mockResult = {
                candidates: [
                    {
                        id: "c_1",
                        name: "Maria Santos",
                        email: "maria@school.edu",
                        schoolYear: "2026-2027",
                        status: "ENROLLED",
                    },
                ],
                schoolYears: ["2026-2027"],
                batches: [],
                total: 1,
            };
            candidateService.getReviewCenterCandidates.mockResolvedValue(mockResult);
            const response = await request(app).get("/api/review-center-app/candidates/get");
            expect(response.status).toBe(200);
            expect(response.body.data.candidates).toBeDefined();
            expect(response.body.data.total).toBe(1);
        });
    });
    describe("POST /api/review-center-app/candidates/enroll", () => {
        it("should enroll candidate successfully", async () => {
            const mockCandidate = {
                id: "c_1",
                name: "Maria Santos",
                email: "maria@school.edu",
                schoolYear: "2026-2027",
                status: "ENROLLED",
            };
            candidateService.enrollCandidate.mockResolvedValue(mockCandidate);
            const response = await request(app)
                .post("/api/review-center-app/candidates/enroll")
                .send({
                name: "Maria Santos",
                email: "maria@school.edu",
                schoolYear: "2026-2027",
            });
            expect(response.status).toBe(201);
            expect(response.body.data.candidate.name).toBe("Maria Santos");
        });
        it("should return 400 if required fields are missing", async () => {
            const response = await request(app)
                .post("/api/review-center-app/candidates/enroll")
                .send({ name: "Maria Santos" });
            expect(response.status).toBe(400);
        });
    });
    describe("POST /api/review-center-app/candidates/bulk-enroll", () => {
        it("should bulk enroll candidates successfully", async () => {
            const mockBulkResult = {
                enrolledCount: 2,
                skippedCount: 0,
                totalSubmitted: 2,
                enrolled: [
                    { id: "c_1", name: "Maria Santos", email: "maria@school.edu" },
                    { id: "c_2", name: "Juan Dela Cruz", email: "juan@school.edu" },
                ],
            };
            candidateService.bulkEnrollCandidates.mockResolvedValue(mockBulkResult);
            const response = await request(app)
                .post("/api/review-center-app/candidates/bulk-enroll")
                .send({
                schoolYear: "2026-2027",
                students: [
                    { name: "Maria Santos", email: "maria@school.edu" },
                    { name: "Juan Dela Cruz", email: "juan@school.edu" },
                ],
            });
            expect(response.status).toBe(201);
            expect(response.body.data.enrolledCount).toBe(2);
        });
    });
    describe("PUT /api/review-center-app/candidates/update/:id", () => {
        it("should update candidate successfully", async () => {
            const updated = {
                id: "c_1",
                name: "Maria Santos Updated",
                email: "maria@school.edu",
                schoolYear: "2026-2027",
                status: "COMPLETED",
            };
            candidateService.updateCandidate.mockResolvedValue(updated);
            const response = await request(app)
                .put("/api/review-center-app/candidates/update/c_1")
                .send({ name: "Maria Santos Updated", status: "COMPLETED" });
            expect(response.status).toBe(200);
            expect(response.body.data.candidate.status).toBe("COMPLETED");
        });
    });
    describe("DELETE /api/review-center-app/candidates/delete/:id", () => {
        it("should delete candidate successfully", async () => {
            candidateService.deleteCandidate.mockResolvedValue(true);
            const response = await request(app).delete("/api/review-center-app/candidates/delete/c_1");
            expect(response.status).toBe(200);
            expect(response.body.message).toContain("removed successfully");
        });
    });
});
