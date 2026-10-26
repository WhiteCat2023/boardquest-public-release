import "./setup";
import request from "supertest";
import express, { Express } from "express";
import rcNotificationRouter from "../routes/review-center/rcNotification.routes";
import rcNotificationService from "../services/review-center/rcNotification.service.js";
import rcSseService from "../services/review-center/rcSse.service.js";

// Mock review center auth middleware
jest.mock("../middleware/reviewCenterAuth.middleware.js", () => ({
  authenticateReviewCenterToken: jest.fn((req: any, res: any, next: any) => {
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

// Mock rcNotification service
jest.mock("../services/review-center/rcNotification.service.js", () => ({
  __esModule: true,
  default: {
    getRCNotifications: jest.fn(),
    getRCUnreadCount: jest.fn(),
    markRCNotificationAsRead: jest.fn(),
    markAllRCNotificationsAsRead: jest.fn(),
    deleteRCNotification: jest.fn(),
    clearAllRCNotifications: jest.fn(),
  },
}));

// Mock rcSse service
jest.mock("../services/review-center/rcSse.service.js", () => ({
  __esModule: true,
  default: {
    addClient: jest.fn(),
    removeClient: jest.fn(),
  },
}));

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/review-center/notifications", rcNotificationRouter);
});

describe("Review Center Notification Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/review-center/notifications", () => {
    it("should retrieve notifications successfully", async () => {
      const mockResult = {
        notifications: [
          {
            id: "notif_1",
            title: "Scores Published",
            message: "Scores have been calculated",
            isRead: false,
            createdAt: new Date(),
          },
        ],
        total: 1,
        unreadCount: 1,
      };

      (rcNotificationService.getRCNotifications as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).get("/api/review-center/notifications?unreadOnly=false");

      expect(response.status).toBe(200);
      expect(response.body.data.notifications.length).toBe(1);
      expect(response.body.data.unreadCount).toBe(1);
    });

    it("should also support GET /get endpoint", async () => {
      (rcNotificationService.getRCNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 0,
        unreadCount: 0,
      });

      const response = await request(app).get("/api/review-center/notifications/get");

      expect(response.status).toBe(200);
      expect(response.body.data.notifications).toEqual([]);
    });
  });

  describe("GET /api/review-center/notifications/unread-count", () => {
    it("should return the unread count", async () => {
      (rcNotificationService.getRCUnreadCount as jest.Mock).mockResolvedValue(5);

      const response = await request(app).get("/api/review-center/notifications/unread-count");

      expect(response.status).toBe(200);
      expect(response.body.data.unreadCount).toBe(5);
    });
  });

  describe("PATCH /api/review-center/notifications/read/:id and /:id/read", () => {
    it("should mark notification as read via /read/:id", async () => {
      (rcNotificationService.markRCNotificationAsRead as jest.Mock).mockResolvedValue(true);

      const response = await request(app).patch("/api/review-center/notifications/read/notif_1");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });

    it("should mark notification as read via /:id/read", async () => {
      (rcNotificationService.markRCNotificationAsRead as jest.Mock).mockResolvedValue(true);

      const response = await request(app).patch("/api/review-center/notifications/notif_1/read");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });
  });

  describe("PATCH /api/review-center/notifications/read-all", () => {
    it("should mark all notifications as read", async () => {
      (rcNotificationService.markAllRCNotificationsAsRead as jest.Mock).mockResolvedValue(true);

      const response = await request(app).patch("/api/review-center/notifications/read-all");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });
  });

  describe("DELETE /api/review-center/notifications/delete/:id and /:id", () => {
    it("should delete notification via /delete/:id", async () => {
      (rcNotificationService.deleteRCNotification as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete("/api/review-center/notifications/delete/notif_1");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });

    it("should delete notification via /:id", async () => {
      (rcNotificationService.deleteRCNotification as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete("/api/review-center/notifications/notif_1");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });
  });

  describe("DELETE /api/review-center/notifications/clear-all", () => {
    it("should clear all notifications", async () => {
      (rcNotificationService.clearAllRCNotifications as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete("/api/review-center/notifications/clear-all");

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
    });
  });
});
