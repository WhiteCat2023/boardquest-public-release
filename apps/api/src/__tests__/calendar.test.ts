import "./setup";
import request from "supertest";
import express, { Express } from "express";
import calendarRouter from "../routes/admin/calendar.routes";
import * as calendarService from "../services/admin/calendar.service";
import { authenticateToken } from "../middleware/auth.middleware";

// Mock calendar service
jest.mock("../services/admin/calendar.service");

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/calendar", calendarRouter);
});

describe("Calendar Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
    (authenticateToken as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
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

      (calendarService.getAllReviewSchedules as jest.Mock).mockResolvedValue(mockSchedules);

      const response = await request(app).get("/api/calendar/schedules/get");

      expect(response.status).toBe(200);
      expect(response.body.data.schedules).toBeDefined();
      expect(response.body.data.schedules.length).toBe(1);
      expect(response.body.message).toContain("retrieved successfully");
    });

    it("should allow TEACHER to view review schedules", async () => {
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER" };
        next();
      });

      (calendarService.getAllReviewSchedules as jest.Mock).mockResolvedValue([]);

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

      (calendarService.createReviewSchedule as jest.Mock).mockResolvedValue(newSchedule);

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
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: "tl_1", email: "teamlead@example.com", role: "TEAMLEAD" };
        next();
      });

      (calendarService.createReviewSchedule as jest.Mock).mockResolvedValue({
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
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: "sa_1", email: "superadmin@example.com", role: "SUPERADMIN" };
        next();
      });

      (calendarService.createReviewSchedule as jest.Mock).mockResolvedValue({
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
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
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

      (calendarService.updateReviewSchedule as jest.Mock).mockResolvedValue(updated);

      const response = await request(app)
        .put("/api/calendar/schedules/update/sched_1")
        .send({ title: "Updated Board Review Batch A", status: "ACTIVE" });

      expect(response.status).toBe(200);
      expect(response.body.data.schedule.title).toBe("Updated Board Review Batch A");
    });

    it("should reject schedule update if user is a TEACHER with 403 Forbidden", async () => {
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
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
      (calendarService.deleteReviewSchedule as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete("/api/calendar/schedules/delete/sched_1");

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted successfully");
    });

    it("should reject schedule deletion if user is a TEACHER with 403 Forbidden", async () => {
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER" };
        next();
      });

      const response = await request(app).delete("/api/calendar/schedules/delete/sched_1");

      expect(response.status).toBe(403);
    });
  });

  describe("Calendar Events (MongoDB)", () => {
    describe("GET /api/calendar/events", () => {
      it("should return calendar events successfully", async () => {
        const mockEvents = [
          {
            id: "evt_1",
            title: "Faculty Board Sync",
            category: "Events",
            startDate: "2026-10-25",
            endDate: "2026-10-25",
            authorName: "Dean User",
          },
        ];
        (calendarService.getAllCalendarEvents as jest.Mock).mockResolvedValue(mockEvents);

        const response = await request(app).get("/api/calendar/events");

        expect(response.status).toBe(200);
        expect(response.body.data.events).toBeDefined();
        expect(response.body.data.events.length).toBe(1);
        expect(response.body.data.events[0].title).toBe("Faculty Board Sync");
      });

      it("should pass req.user to getAllCalendarEvents for attendee filtering", async () => {
        (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
          req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER", name: "Teacher User" };
          next();
        });
        (calendarService.getAllCalendarEvents as jest.Mock).mockResolvedValue([]);

        const response = await request(app).get("/api/calendar/events");
        expect(response.status).toBe(200);
        expect(calendarService.getAllCalendarEvents).toHaveBeenCalledWith(
          expect.objectContaining({ email: "teacher@example.com" })
        );
      });
    });

    describe("POST /api/calendar/events", () => {
      it("should create a new calendar event", async () => {
        const createdEvent = {
          id: "evt_2",
          title: "Curriculum Brainstorming",
          startDate: "2026-10-26",
          category: "Events",
          authorName: "Dean User",
        };
        (calendarService.createCalendarEvent as jest.Mock).mockResolvedValue(createdEvent);

        const response = await request(app)
          .post("/api/calendar/events")
          .send({
            title: "Curriculum Brainstorming",
            startDate: "2026-10-26",
            category: "Events",
          });

        expect(response.status).toBe(201);
        expect(response.body.data.event.title).toBe("Curriculum Brainstorming");
      });

      it("should reject creation if title or startDate is missing with 400", async () => {
        const response = await request(app)
          .post("/api/calendar/events")
          .send({ title: "No Date Event" });

        expect(response.status).toBe(400);
      });

      it("should allow TEACHER to create calendar events", async () => {
        (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
          req.user = { id: "teach_1", email: "teacher@example.com", role: "TEACHER", name: "Teacher User" };
          next();
        });
        (calendarService.createCalendarEvent as jest.Mock).mockResolvedValue({
          id: "evt_teach",
          title: "Teacher Class Prep",
          authorName: "Teacher User",
        });

        const response = await request(app)
          .post("/api/calendar/events")
          .send({
            title: "Teacher Class Prep",
            startDate: "2026-10-26",
            category: "Events",
          });

        expect(response.status).toBe(201);
      });
    });

    describe("PUT /api/calendar/events/:id", () => {
      it("should update an event if user is the author", async () => {
        const existingEvent = {
          id: "evt_1",
          title: "Old Title",
          authorId: "1",
          authorName: "Dean User",
        };
        const updatedEvent = {
          ...existingEvent,
          title: "New Title",
        };
        (calendarService.getCalendarEventById as jest.Mock).mockResolvedValue(existingEvent);
        (calendarService.updateCalendarEvent as jest.Mock).mockResolvedValue(updatedEvent);

        const response = await request(app)
          .put("/api/calendar/events/evt_1")
          .send({ title: "New Title" });

        expect(response.status).toBe(200);
        expect(response.body.data.event.title).toBe("New Title");
      });

      it("should reject update if user is not the author or superadmin", async () => {
        const existingEvent = {
          id: "evt_1",
          title: "Someone Else Event",
          authorId: "user_other",
          authorName: "Other Person",
        };
        (calendarService.getCalendarEventById as jest.Mock).mockResolvedValue(existingEvent);

        const response = await request(app)
          .put("/api/calendar/events/evt_1")
          .send({ title: "Unauthorized Attempt" });

        expect(response.status).toBe(403);
      });
    });

    describe("DELETE /api/calendar/events/:id", () => {
      it("should delete an event if user is the author", async () => {
        const existingEvent = {
          id: "evt_1",
          authorId: "1",
        };
        (calendarService.getCalendarEventById as jest.Mock).mockResolvedValue(existingEvent);
        (calendarService.deleteCalendarEvent as jest.Mock).mockResolvedValue(true);

        const response = await request(app).delete("/api/calendar/events/evt_1");

        expect(response.status).toBe(200);
      });
    });
  });
});
