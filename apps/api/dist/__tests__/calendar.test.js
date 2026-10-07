import "./setup";
import request from "supertest";
import express from "express";
import calendarRouter from "../routes/admin/calendar.routes";
import * as calendarService from "../services/admin/calendar.service";
import { authenticateToken } from "../middleware/auth.middleware";
// Mock calendar service
jest.mock("../services/admin/calendar.service");
let app;
beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/calendar", calendarRouter);
});
describe("Calendar Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
        authenticateToken.mockImplementation((req, res, next) => {
            req.user = { id: "1", email: "admin@example.com", role: "DEAN", name: "Dean User" };
            next();
        });
    });
    describe("GET /api/calendar/schedules/get", () => {
        it("should return review schedules successfully", async () => {
            const mockSchedules = [
                {
                    id: "sched_1",
                    title: "Comprehensive Board Review Batch A",
                    companyName: "Apex Review Center",
                    startDate: "2026-09-01",
                    endDate: "2026-11-30",
                    category: "Medical Technology",
                    status: "UPCOMING",
                },
            ];
            calendarService.getAllReviewSchedules.mockResolvedValue(mockSchedules);
            const response = await request(app).get("/api/calendar/schedules/get");
            expect(response.status).toBe(200);
            expect(response.body.data.schedules).toBeDefined();
            expect(response.body.data.schedules.length).toBe(1);
            expect(response.body.message).toContain("retrieved successfully");
        });
        it("should allow TEACHER to view review schedules", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER" };
                next();
            });
            calendarService.getAllReviewSchedules.mockResolvedValue([]);
            const response = await request(app).get("/api/calendar/schedules/get");
            expect(response.status).toBe(200);
        });
    });
    describe("POST /api/calendar/schedules/create", () => {
        it("should create a new review schedule", async () => {
            const newSchedule = {
                id: "sched_2",
                title: "Intensive Diagnostic Coaching",
                companyName: "Prime Review Hub",
                startDate: "2026-10-01",
                endDate: "2026-10-15",
                category: "Clinical Chemistry",
                status: "UPCOMING",
            };
            calendarService.createReviewSchedule.mockResolvedValue(newSchedule);
            const response = await request(app)
                .post("/api/calendar/schedules/create")
                .send({
                title: "Intensive Diagnostic Coaching",
                companyName: "Prime Review Hub",
                startDate: "2026-10-01",
                endDate: "2026-10-15",
                category: "Clinical Chemistry",
            });
            expect(response.status).toBe(201);
            expect(response.body.data.schedule).toBeDefined();
            expect(response.body.data.schedule.title).toBe("Intensive Diagnostic Coaching");
        });
        it("should allow TEAMLEAD to create review schedules", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = { id: "tl_1", email: "teamlead@example.com", role: "TEAMLEAD" };
                next();
            });
            calendarService.createReviewSchedule.mockResolvedValue({
                id: "sched_tl",
                title: "Team Lead Created Schedule",
            });
            const response = await request(app)
                .post("/api/calendar/schedules/create")
                .send({
                title: "Team Lead Created Schedule",
                startDate: "2026-10-01",
                endDate: "2026-10-15",
            });
            expect(response.status).toBe(201);
        });
        it("should allow SUPERADMIN to create review schedules", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = { id: "sa_1", email: "superadmin@example.com", role: "SUPERADMIN" };
                next();
            });
            calendarService.createReviewSchedule.mockResolvedValue({
                id: "sched_sa",
                title: "Superadmin Created Schedule",
            });
            const response = await request(app)
                .post("/api/calendar/schedules/create")
                .send({
                title: "Superadmin Created Schedule",
                startDate: "2026-10-01",
                endDate: "2026-10-15",
            });
            expect(response.status).toBe(201);
        });
        it("should reject schedule creation if user is a TEACHER with 403 Forbidden", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER" };
                next();
            });
            const response = await request(app)
                .post("/api/calendar/schedules/create")
                .send({
                title: "Teacher Attempted Schedule",
                startDate: "2026-10-01",
                endDate: "2026-10-15",
            });
            expect(response.status).toBe(403);
        });
        it("should return 400 if required fields are missing", async () => {
            const response = await request(app)
                .post("/api/calendar/schedules/create")
                .send({ title: "Incomplete Schedule" });
            expect(response.status).toBe(400);
        });
    });
    describe("PUT /api/calendar/schedules/update/:id", () => {
        it("should update a review schedule successfully", async () => {
            const updated = {
                id: "sched_1",
                title: "Updated Board Review Batch A",
                status: "ACTIVE",
            };
            calendarService.updateReviewSchedule.mockResolvedValue(updated);
            const response = await request(app)
                .put("/api/calendar/schedules/update/sched_1")
                .send({ title: "Updated Board Review Batch A", status: "ACTIVE" });
            expect(response.status).toBe(200);
            expect(response.body.data.schedule.title).toBe("Updated Board Review Batch A");
        });
        it("should reject schedule update if user is a TEACHER with 403 Forbidden", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER" };
                next();
            });
            const response = await request(app)
                .put("/api/calendar/schedules/update/sched_1")
                .send({ title: "Teacher Attempted Update" });
            expect(response.status).toBe(403);
        });
    });
    describe("DELETE /api/calendar/schedules/delete/:id", () => {
        it("should delete a review schedule successfully", async () => {
            calendarService.deleteReviewSchedule.mockResolvedValue({});
            const response = await request(app).delete("/api/calendar/schedules/delete/sched_1");
            expect(response.status).toBe(200);
            expect(response.body.message).toContain("deleted successfully");
        });
        it("should reject schedule deletion if user is a TEACHER with 403 Forbidden", async () => {
            authenticateToken.mockImplementation((req, res, next) => {
                req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER" };
                next();
            });
            const response = await request(app).delete("/api/calendar/schedules/delete/sched_1");
            expect(response.status).toBe(403);
        });
    });
});
