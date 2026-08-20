import "./setup";
import request from "supertest";
import express from "express";
import logsRouter from "../routes/admin/logs.routes";
import * as loggerService from "../services/admin/logger.service";
// Mock logger service
jest.mock("../services/admin/logger.service");
let app;
beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/logs", logsRouter);
});
describe("Logs Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("GET /api/logs/get", () => {
        it("should fetch system logs successfully", async () => {
            const mockLogs = [
                {
                    id: "log_1",
                    level: "INFO",
                    action: "STUDENT_LOGIN",
                    message: "Student logged in successfully.",
                    userEmail: "student@example.com",
                    createdAt: new Date().toISOString(),
                },
            ];
            loggerService.getSystemLogs.mockResolvedValue(mockLogs);
            const response = await request(app).get("/api/logs/get?limit=50");
            expect(response.status).toBe(200);
            expect(response.body.data.logs).toBeDefined();
            expect(response.body.data.logs.length).toBe(1);
        });
    });
    describe("GET /api/logs/stats", () => {
        it("should fetch system log statistics successfully", async () => {
            const mockStats = {
                totalLogs: 125,
                infoCount: 100,
                warnCount: 20,
                errorCount: 5,
            };
            loggerService.getSystemLogStats.mockResolvedValue(mockStats);
            const response = await request(app).get("/api/logs/stats");
            expect(response.status).toBe(200);
            expect(response.body.data.stats).toBeDefined();
            expect(response.body.data.stats.totalLogs).toBe(125);
        });
    });
    describe("POST /api/logs/clear", () => {
        it("should clear system logs successfully", async () => {
            loggerService.clearSystemLogs.mockResolvedValue({});
            loggerService.logInfo.mockResolvedValue({});
            const response = await request(app).post("/api/logs/clear");
            expect(response.status).toBe(200);
            expect(response.body.message).toContain("cleared successfully");
        });
    });
});
