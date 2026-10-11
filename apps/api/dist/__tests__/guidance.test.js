import "./setup";
import request from "supertest";
import express from "express";
import guidanceRouter from "../routes/admin/guidance.routes";
import * as guidanceService from "../services/admin/guidance.service";
// Mock guidance service
jest.mock("../services/admin/guidance.service");
let app;
beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/guidance", guidanceRouter);
});
describe("Guidance Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("GET /api/guidance", () => {
        it("should fetch guidance assignments successfully", async () => {
            const mockAssignments = [
                {
                    id: "guidance_1",
                    studentId: "student_123",
                    advisorId: "advisor_456",
                    status: "PENDING",
                    subjectCategory: "Clinical Chemistry",
                    reason: "Low diagnostic evaluation score",
                },
            ];
            guidanceService.getGuidanceAssignments.mockResolvedValue(mockAssignments);
            const response = await request(app).get("/api/guidance");
            expect(response.status).toBe(200);
            expect(response.body.data.assignments).toBeDefined();
            expect(response.body.data.assignments.length).toBe(1);
        });
    });
    describe("POST /api/guidance", () => {
        it("should create a guidance assignment successfully", async () => {
            const newAssignment = {
                id: "guidance_2",
                studentId: "student_789",
                advisorId: "advisor_456",
                status: "PENDING",
                reason: "Need subject coaching",
            };
            guidanceService.createGuidanceAssignment.mockResolvedValue(newAssignment);
            const response = await request(app)
                .post("/api/guidance")
                .send({
                studentId: "student_789",
                advisorId: "advisor_456",
                reason: "Need subject coaching",
            });
            expect(response.status).toBe(201);
            expect(response.body.data.assignment).toBeDefined();
        });
    });
    describe("PUT /api/guidance/:id", () => {
        it("should update guidance assignment successfully", async () => {
            const updated = {
                id: "guidance_1",
                status: "IN_PROGRESS",
                guidanceNotes: "Scheduled initial 1-on-1 session",
            };
            guidanceService.updateGuidanceAssignment.mockResolvedValue(updated);
            const response = await request(app)
                .put("/api/guidance/guidance_1")
                .send({
                status: "IN_PROGRESS",
                guidanceNotes: "Scheduled initial 1-on-1 session",
            });
            expect(response.status).toBe(200);
            expect(response.body.data.assignment.status).toBe("IN_PROGRESS");
        });
    });
    describe("GET /api/guidance/failing-students", () => {
        it("should fetch failing student candidates successfully", async () => {
            const mockStudents = [
                {
                    id: "student_999",
                    name: "Struggling Student",
                    averageScore: 54,
                    failingSubjects: ["Microbiology"],
                },
            ];
            guidanceService.getFailingStudents.mockResolvedValue(mockStudents);
            const response = await request(app).get("/api/guidance/failing-students");
            expect(response.status).toBe(200);
            expect(response.body.data.students).toBeDefined();
        });
    });
    describe("POST /api/guidance/bulk", () => {
        it("should create bulk guidance assignments successfully", async () => {
            const mockResult = {
                count: 2,
                assignments: [
                    { id: "g_1", studentId: "s_1", advisorId: "adv_1" },
                    { id: "g_2", studentId: "s_2", advisorId: "adv_1" },
                ],
            };
            guidanceService.bulkCreateGuidanceAssignments.mockResolvedValue(mockResult);
            const response = await request(app)
                .post("/api/guidance/bulk")
                .send({
                studentIds: ["s_1", "s_2"],
                advisorId: "adv_1",
                reason: "Bulk referral for cohort guidance",
            });
            expect(response.status).toBe(201);
            expect(response.body.data.count).toBe(2);
            expect(response.body.data.assignments).toHaveLength(2);
        });
    });
});
