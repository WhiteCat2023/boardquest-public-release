import "./setup";
import request from "supertest";
import express, { Express } from "express";
import systemSettingsRouter from "../routes/admin/systemSettings.routes";
import * as systemSettingsService from "../services/admin/systemSettings.service";

// Mock systemSettings service
jest.mock("../services/admin/systemSettings.service", () => ({
  getSystemSettingsService: jest.fn(),
  updateSystemSettingsService: jest.fn(),
  resetSystemSettingsService: jest.fn(),
}));

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/system-settings", systemSettingsRouter);
});

describe("System Settings Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/system-settings", () => {
    it("should return system settings successfully without authentication requirement", async () => {
      const mockSettings = {
        id: "settings_1",
        systemName: "BoardQuest",
        institutionSubtitle: "SWU PHINMA",
        logoUrl: "https://example.com/logo.png",
        adminThemeId: "maroon-heritage",
        adminCustomColor: null,
        reviewCenterThemeId: "monochrome-zinc",
        reviewCenterCustomColor: null,
      };

      (systemSettingsService.getSystemSettingsService as jest.Mock).mockResolvedValue(mockSettings);

      const response = await request(app).get("/api/system-settings");

      expect(response.status).toBe(200);
      expect(response.body.data.systemName).toBe("BoardQuest");
      expect(response.body.message).toContain("retrieved successfully");
    });
  });

  describe("PUT /api/system-settings", () => {
    it("should update institutional settings successfully", async () => {
      const updatedMock = {
        id: "settings_1",
        systemName: "BoardQuest New",
        institutionSubtitle: "SWU PHINMA Updated",
        logoUrl: "https://example.com/new-logo.png",
        adminThemeId: "emerald",
        adminCustomColor: "#059669",
        reviewCenterThemeId: "indigo",
        reviewCenterCustomColor: "#4f46e5",
      };

      (systemSettingsService.updateSystemSettingsService as jest.Mock).mockResolvedValue(updatedMock);

      const response = await request(app)
        .put("/api/system-settings")
        .send({
          systemName: "BoardQuest New",
          institutionSubtitle: "SWU PHINMA Updated",
          logoUrl: "https://example.com/new-logo.png",
          adminThemeId: "emerald",
          adminCustomColor: "#059669",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.systemName).toBe("BoardQuest New");
      expect(response.body.message).toContain("saved successfully");
    });
  });

  describe("POST /api/system-settings/reset", () => {
    it("should reset settings to default successfully", async () => {
      const defaultMock = {
        id: "settings_1",
        systemName: "BoardQuest",
        institutionSubtitle: "SWU PHINMA",
        logoUrl: null,
        adminThemeId: "maroon-heritage",
        adminCustomColor: null,
        reviewCenterThemeId: "monochrome-zinc",
        reviewCenterCustomColor: null,
      };

      (systemSettingsService.resetSystemSettingsService as jest.Mock).mockResolvedValue(defaultMock);

      const response = await request(app).post("/api/system-settings/reset");

      expect(response.status).toBe(200);
      expect(response.body.data.systemName).toBe("BoardQuest");
      expect(response.body.message).toContain("reset to default");
    });
  });
});
