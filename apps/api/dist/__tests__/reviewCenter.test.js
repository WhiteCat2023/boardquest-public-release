import "./setup";
import request from "supertest";
import express from "express";
import reviewCenterRouter from "../routes/review-center/reviewCenter.routes";
import * as reviewCenterService from "../services/review-center/reviewCenter.service";
import * as candidateService from "../services/review-center/candidate.service";
// Mock review center and candidate service
jest.mock("../services/review-center/reviewCenter.service");
jest.mock("../services/review-center/candidate.service");
jest.mock("../services/admin/calendar.service");
let app;
beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/review-center", reviewCenterRouter);
});
describe("Review Center Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("GET /api/review-center", () => {
        it("should fetch review centers successfully", async () => {
            const mockCenters = [
                {
                    id: "rc_1",
                    name: "Dr. Jane Doe",
                    email: "jane@toprank.edu",
                    companyName: "TopRank Review Academy",
                    phonenumber: "+639171234567",
                    location: "Manila",
                },
            ];
            reviewCenterService.getAllReviewCenters.mockResolvedValue(mockCenters);
            const response = await request(app).get("/api/review-center");
            expect(response.status).toBe(200);
            expect(response.body.data.reviewCenters).toBeDefined();
            expect(response.body.data.reviewCenters.length).toBe(1);
        });
    });
    describe("GET /api/review-center/representatives/:id", () => {
        it("should fetch a review center by id successfully", async () => {
            const mockCenter = {
                id: "rc_1",
                name: "Dr. Jane Doe",
                email: "jane@toprank.edu",
                companyName: "TopRank Review Academy",
                phonenumber: "+639171234567",
                location: "Manila",
            };
            reviewCenterService.getReviewCenterById.mockResolvedValue(mockCenter);
            const response = await request(app).get("/api/review-center/representatives/rc_1");
            expect(response.status).toBe(200);
            expect(response.body.data.reviewCenter).toBeDefined();
            expect(response.body.data.reviewCenter.companyName).toBe("TopRank Review Academy");
        });
    });
    describe("GET /api/review-center/:id/candidates", () => {
        it("should fetch candidates for a review center successfully", async () => {
            const mockCenter = {
                id: "rc_1",
                name: "Dr. Jane Doe",
                companyName: "TopRank Review Academy",
            };
            const mockCandidateData = {
                candidates: [
                    {
                        id: "cand_1",
                        name: "Maria Santos",
                        email: "maria@school.edu",
                        schoolYear: "2026-2027",
                        status: "ENROLLED",
                        studentId: "u_1",
                        studentDetails: { level: 5, xp: 1200, streak: 3, verified: true },
                    },
                    {
                        id: "cand_2",
                        name: "Juan Dela Cruz",
                        email: "juan@school.edu",
                        schoolYear: "2026-2027",
                        status: "ENROLLED",
                        studentId: null,
                        studentDetails: null,
                    },
                ],
                schoolYears: ["2026-2027"],
                batches: [],
                total: 2,
            };
            reviewCenterService.getReviewCenterById.mockResolvedValue(mockCenter);
            candidateService.getReviewCenterCandidates.mockResolvedValue(mockCandidateData);
            const response = await request(app).get("/api/review-center/rc_1/candidates");
            expect(response.status).toBe(200);
            expect(response.body.data.candidates).toBeDefined();
            expect(response.body.data.candidates.length).toBe(2);
            expect(response.body.data.candidates[0].studentDetails).toBeDefined();
            expect(response.body.data.candidates[1].studentDetails).toBeNull();
        });
        it("should return 404 if review center is not found", async () => {
            reviewCenterService.getReviewCenterById.mockResolvedValue(null);
            const response = await request(app).get("/api/review-center/rc_nonexistent/candidates");
            expect(response.status).toBe(404);
        });
    });
    describe("POST /api/review-center", () => {
        it("should create a review center representative successfully", async () => {
            const newCenter = {
                id: "rc_2",
                name: "Prof. John Smith",
                email: "john@apexreview.edu",
                companyName: "Apex Medical Review",
                phonenumber: "+639189876543",
                location: "Cebu",
            };
            reviewCenterService.createReviewCenter.mockResolvedValue(newCenter);
            const response = await request(app)
                .post("/api/review-center")
                .send({
                name: "Prof. John Smith",
                email: "john@apexreview.edu",
                companyName: "Apex Medical Review",
                phonenumber: "+639189876543",
            });
            expect(response.status).toBe(201);
            expect(response.body.data.reviewCenter).toBeDefined();
        });
        it("should return 400 if required fields are missing", async () => {
            const response = await request(app)
                .post("/api/review-center")
                .send({ name: "Incomplete Name" });
            expect(response.status).toBe(400);
        });
    });
    describe("PUT /api/review-center/:id", () => {
        it("should update a review center representative successfully", async () => {
            const updated = {
                id: "rc_1",
                name: "Dr. Jane Doe",
                companyName: "TopRank Review Academy Global",
            };
            reviewCenterService.updateReviewCenter.mockResolvedValue(updated);
            const response = await request(app)
                .put("/api/review-center/rc_1")
                .send({ companyName: "TopRank Review Academy Global" });
            expect(response.status).toBe(200);
            expect(response.body.data.reviewCenter.companyName).toBe("TopRank Review Academy Global");
        });
    });
    describe("DELETE /api/review-center/:id", () => {
        it("should delete a review center successfully", async () => {
            reviewCenterService.deleteReviewCenter.mockResolvedValue({});
            const response = await request(app).delete("/api/review-center/rc_1");
            expect(response.status).toBe(200);
            expect(response.body.message).toContain("deleted successfully");
        });
    });
});
