import "./setup";
import request from "supertest";
import express from "express";
import gameRouter from "../routes/admin/game_module/game.routes";
import { gameBadgeService } from "../services/admin/gameBadge.service";
jest.mock("../services/admin/gameBadge.service");
let app;
beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/game", gameRouter);
});
describe("Game Module Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("GET /api/game/badges", () => {
        it("should return all badges", async () => {
            const mockBadges = [
                {
                    id: "badge-1",
                    badgeId: "first_win",
                    name: "First Victory",
                    title: "First Victory",
                    category: "QUEST",
                    isActive: true,
                },
            ];
            gameBadgeService.getAllBadges.mockResolvedValue(mockBadges);
            const response = await request(app).get("/api/game/badges");
            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].name).toBe("First Victory");
        });
    });
    describe("GET /api/game/badges/:id", () => {
        it("should return badge by id", async () => {
            const mockBadge = {
                id: "badge-1",
                name: "First Victory",
                title: "First Victory",
                isActive: true,
            };
            gameBadgeService.getBadgeById.mockResolvedValue(mockBadge);
            const response = await request(app).get("/api/game/badges/badge-1");
            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBe("badge-1");
        });
    });
    describe("POST /api/game/badges", () => {
        it("should create a new badge", async () => {
            const createdBadge = {
                id: "badge-2",
                name: "Streak Master",
                title: "Streak Master",
                category: "STREAK",
                isActive: true,
            };
            gameBadgeService.createBadge.mockResolvedValue(createdBadge);
            const response = await request(app).post("/api/game/badges").send({
                title: "Streak Master",
                name: "Streak Master",
                description: "Maintain a 7-day streak",
                category: "STREAK",
                icon: "Flame",
                color: "#f59e0b",
                unlockCondition: "streak_7",
            });
            expect(response.status).toBe(201);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.name).toBe("Streak Master");
        });
    });
    describe("PUT /api/game/badges/:id", () => {
        it("should update a badge", async () => {
            const updatedBadge = {
                id: "badge-1",
                name: "Updated Victory",
                title: "Updated Victory",
                isActive: true,
            };
            gameBadgeService.updateBadge.mockResolvedValue(updatedBadge);
            const response = await request(app).put("/api/game/badges/badge-1").send({
                name: "Updated Victory",
            });
            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe("Updated Victory");
        });
    });
    describe("PATCH /api/game/badges/:id/toggle", () => {
        it("should toggle badge status", async () => {
            const toggledBadge = {
                id: "badge-1",
                isActive: false,
            };
            gameBadgeService.toggleBadgeActive.mockResolvedValue(toggledBadge);
            const response = await request(app).patch("/api/game/badges/badge-1/toggle");
            expect(response.status).toBe(200);
            expect(response.body.data.isActive).toBe(false);
        });
    });
    describe("DELETE /api/game/badges/:id", () => {
        it("should delete a badge", async () => {
            gameBadgeService.deleteBadge.mockResolvedValue({ id: "badge-1" });
            const response = await request(app).delete("/api/game/badges/badge-1");
            expect(response.status).toBe(200);
            expect(response.body.message).toContain("successfully");
        });
    });
    describe("GET /api/game/config", () => {
        it("should return game config", async () => {
            const response = await request(app).get("/api/game/config");
            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.baseXP).toBeDefined();
        });
    });
    describe("GET /api/game/leaderboard", () => {
        it("should return leaderboard entries", async () => {
            const response = await request(app).get("/api/game/leaderboard");
            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
        });
    });
});
