import "./setup";
import request from "supertest";
import express, { Express } from "express";
import notificationRouter from "../routes/admin/notification.routes";
import * as notificationService from "../services/admin/notification.service";

// Mock notification service
jest.mock("../services/admin/notification.service");

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/notifications", notificationRouter);
});

describe("Notification Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notifications/get", () => {
    it("should fetch notifications successfully", async () => {
      const mockNotifications = [
        {
          id: "notif_1",
          title: "New Student Enrolled",
          message: "A new candidate completed initial quest.",
          isRead: false,
          type: "INFO",
        },
      ];

      (notificationService.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      const response = await request(app).get("/api/notifications/get");

      expect(response.status).toBe(200);
      expect(response.body.data.notifications).toBeDefined();
      expect(response.body.data.unreadCount).toBe(1);
    });
  });

  describe("PATCH /api/notifications/:id/read", () => {
    it("should mark a notification as read", async () => {
      (notificationService.markNotificationAsRead as jest.Mock).mockResolvedValue({
        success: true,
      });

      const response = await request(app).patch("/api/notifications/notif_1/read");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });
  });

  describe("PATCH /api/notifications/read-all", () => {
    it("should mark all notifications as read", async () => {
      (notificationService.markAllNotificationsAsRead as jest.Mock).mockResolvedValue({
        count: 5,
      });

      const response = await request(app).patch("/api/notifications/read-all");

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(5);
    });
  });

  describe("POST /api/notifications/create", () => {
    it("should create a notification successfully", async () => {
      const newNotif = {
        id: "notif_2",
        title: "System Update",
        message: "Gamification engine updated.",
        type: "SUCCESS",
      };

      (notificationService.createNotification as jest.Mock).mockResolvedValue(newNotif);

      const response = await request(app)
        .post("/api/notifications/create")
        .send({
          title: "System Update",
          message: "Gamification engine updated.",
          type: "SUCCESS",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe("System Update");
    });
  });

  describe("DELETE /api/notifications/:id", () => {
    it("should delete a notification successfully", async () => {
      (notificationService.deleteNotification as jest.Mock).mockResolvedValue({
        success: true,
      });

      const response = await request(app).delete("/api/notifications/notif_1");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });
  });
});
