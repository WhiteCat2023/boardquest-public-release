import "./setup";
import request from "supertest";
import express from "express";
import calendarRouter from "../routes/admin/calendar.routes";
import * as calendarService from "../services/admin/calendar.service";
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
    });
    describe("DELETE /api/calendar/schedules/delete/:id", () => {
        it("should delete a review schedule successfully", async () => {
            calendarService.deleteReviewSchedule.mockResolvedValue({});
            const response = await request(app).delete("/api/calendar/schedules/delete/sched_1");
            expect(response.status).toBe(200);
            expect(response.body.message).toContain("deleted successfully");
        });
    });
});
