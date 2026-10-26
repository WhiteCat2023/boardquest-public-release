import "./setup";
import request from "supertest";
import express, { Express } from "express";
import scheduleRouter from "../routes/review-center/schedule.routes";
import * as scheduleService from "../services/review-center/schedule.service";

// Mock review center auth middleware
jest.mock("../middleware/reviewCenterAuth.middleware", () => ({
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

// Mock schedule service
jest.mock("../services/review-center/schedule.service", () => ({
  getReviewCenterSchedules: jest.fn(),
  createReviewCenterSchedule: jest.fn(),
  updateReviewCenterSchedule: jest.fn(),
  deleteReviewCenterSchedule: jest.fn(),
}));

// Mock rcNotification service
jest.mock("../services/review-center/rcNotification.service.js", () => ({
  __esModule: true,
  default: {
    createRCNotification: jest.fn().mockResolvedValue({}),
  },
}));

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/review-center/schedules", scheduleRouter);
});

describe("Review Center Schedule Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/review-center/schedules", () => {
    it("should return schedules via root endpoint", async () => {
      const mockSchedules = [
        {
          id: "sched_1",
          title: "Comprehensive Mock Exam 1",
          companyName: "TopRank Review Academy",
          category: "Board Review",
          startDate: "2026-08-01",
          endDate: "2026-08-05",
          status: "UPCOMING",
          schoolYear: "2026-2027",
        },
      ];

      (scheduleService.getReviewCenterSchedules as jest.Mock).mockResolvedValue(mockSchedules);

      const response = await request(app).get("/api/review-center/schedules?schoolYear=2026-2027");

      expect(response.status).toBe(200);
      expect(response.body.data.schedules).toBeDefined();
      expect(response.body.data.schedules.length).toBe(1);
      expect(response.body.data.schedules[0].title).toBe("Comprehensive Mock Exam 1");
    });

    it("should return schedules via legacy /schedules/get endpoint", async () => {
      (scheduleService.getReviewCenterSchedules as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get("/api/review-center/schedules/schedules/get");

      expect(response.status).toBe(200);
      expect(response.body.data.schedules).toEqual([]);
    });
  });

  describe("POST /api/review-center/schedules", () => {
    it("should create review schedule successfully via root endpoint", async () => {
      const mockCreated = {
        id: "sched_1",
        title: "Intensive Clinical Microscopy",
        startDate: "2026-09-01",
        endDate: "2026-09-05",
        category: "Coaching",
        companyName: "TopRank Review Academy",
      };

      (scheduleService.createReviewCenterSchedule as jest.Mock).mockResolvedValue(mockCreated);

      const response = await request(app)
        .post("/api/review-center/schedules")
        .send({
          title: "Intensive Clinical Microscopy",
          startDate: "2026-09-01",
          endDate: "2026-09-05",
          category: "Coaching",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.schedule.title).toBe("Intensive Clinical Microscopy");
      expect(response.body.message).toContain("Review schedule created");
    });

    it("should create review schedule successfully via legacy /schedules/create endpoint", async () => {
      const mockCreated = {
        id: "sched_2",
        title: "Legacy Route Coaching",
        startDate: "2026-09-10",
        endDate: "2026-09-15",
      };

      (scheduleService.createReviewCenterSchedule as jest.Mock).mockResolvedValue(mockCreated);

      const response = await request(app)
        .post("/api/review-center/schedules/schedules/create")
        .send({
          title: "Legacy Route Coaching",
          startDate: "2026-09-10",
          endDate: "2026-09-15",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.schedule.id).toBe("sched_2");
    });

    it("should return 400 when title or dates are missing", async () => {
      const response = await request(app)
        .post("/api/review-center/schedules")
        .send({
          title: "Incomplete Schedule",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/review-center/schedules/:id", () => {
    it("should update schedule successfully via REST endpoint", async () => {
      const updated = {
        id: "sched_1",
        title: "Updated Coaching Schedule",
      };

      (scheduleService.updateReviewCenterSchedule as jest.Mock).mockResolvedValue(updated);

      const response = await request(app)
        .put("/api/review-center/schedules/sched_1")
        .send({ title: "Updated Coaching Schedule" });

      expect(response.status).toBe(200);
      expect(response.body.data.schedule.title).toBe("Updated Coaching Schedule");
      expect(response.body.message).toContain("updated successfully");
    });

    it("should update schedule successfully via legacy /schedules/update/:id endpoint", async () => {
      const updated = {
        id: "sched_1",
        title: "Updated Coaching Schedule Legacy",
      };

      (scheduleService.updateReviewCenterSchedule as jest.Mock).mockResolvedValue(updated);

      const response = await request(app)
        .put("/api/review-center/schedules/schedules/update/sched_1")
        .send({ title: "Updated Coaching Schedule Legacy" });

      expect(response.status).toBe(200);
      expect(response.body.data.schedule.title).toBe("Updated Coaching Schedule Legacy");
    });
  });

  describe("DELETE /api/review-center/schedules/:id", () => {
    it("should delete schedule successfully via REST endpoint", async () => {
      (scheduleService.deleteReviewCenterSchedule as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete("/api/review-center/schedules/sched_1");

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted successfully");
    });

    it("should delete schedule successfully via legacy /schedules/delete/:id endpoint", async () => {
      (scheduleService.deleteReviewCenterSchedule as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete(
        "/api/review-center/schedules/schedules/delete/sched_1",
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted successfully");
    });
  });
});
