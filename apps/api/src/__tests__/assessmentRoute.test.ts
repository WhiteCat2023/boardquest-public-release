import "./setup";
import request from "supertest";
import express, { Express } from "express";
import assessmentRouter from "../routes/review-center/assessment.routes";
import { AssessmentService } from "../services/review-center/assessment.service";
import * as gradeEmailService from "../services/review-center/gradeEmail.service";

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

// Mock AssessmentService
jest.mock("../services/review-center/assessment.service");

// Mock gradeEmailService
jest.mock("../services/review-center/gradeEmail.service", () => ({
  sendAssessmentGradeReportEmails: jest.fn(),
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
  app.use("/api/review-center/assessments", assessmentRouter);
});

describe("Review Center Assessment Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/review-center/assessments/matrix", () => {
    it("should return grade matrix successfully", async () => {
      const mockMatrix = {
        assessments: [],
        candidates: [],
        matrix: [],
      };

      (AssessmentService.prototype.getGradeMatrix as jest.Mock).mockResolvedValue(mockMatrix);

      const response = await request(app).get("/api/review-center/assessments/matrix?schoolYear=2026-2027");

      expect(response.status).toBe(200);
      expect(response.body.data.assessments).toBeDefined();
      expect(response.body.message).toContain("Grade matrix retrieved successfully");
    });
  });

  describe("GET /api/review-center/assessments/candidate/:candidateId/scores", () => {
    it("should return candidate score transcript", async () => {
      const mockTranscript = {
        candidateId: "cand_1",
        scores: [{ assessmentTitle: "Mock 1", score: 85 }],
      };

      (AssessmentService.prototype.getCandidateScoreTranscript as jest.Mock).mockResolvedValue(mockTranscript);

      const response = await request(app).get(
        "/api/review-center/assessments/candidate/cand_1/scores",
      );

      expect(response.status).toBe(200);
      expect(response.body.data.candidateId).toBe("cand_1");
    });
  });

  describe("GET /api/review-center/assessments", () => {
    it("should return list of assessments", async () => {
      const mockAssessments = [
        {
          id: "assess_1",
          title: "Diagnostic Exam 1",
          companyName: "TopRank Review Academy",
        },
      ];

      (AssessmentService.prototype.getAssessments as jest.Mock).mockResolvedValue(mockAssessments);

      const response = await request(app).get("/api/review-center/assessments");

      expect(response.status).toBe(200);
      expect(response.body.data.assessments.length).toBe(1);
      expect(response.body.data.assessments[0].title).toBe("Diagnostic Exam 1");
    });
  });

  describe("POST /api/review-center/assessments", () => {
    it("should create assessment successfully", async () => {
      const newAssessment = {
        id: "assess_1",
        title: "Clinical Microscopy Board Review",
        subject: "Clinical Microscopy",
        schoolYear: "2026-2027",
      };

      (AssessmentService.prototype.createAssessment as jest.Mock).mockResolvedValue(newAssessment);

      const response = await request(app)
        .post("/api/review-center/assessments")
        .send({
          title: "Clinical Microscopy Board Review",
          subject: "Clinical Microscopy",
          schoolYear: "2026-2027",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.assessment.title).toBe("Clinical Microscopy Board Review");
    });
  });

  describe("GET /api/review-center/assessments/:id", () => {
    it("should get assessment details by ID", async () => {
      const mockAssessment = {
        id: "assess_1",
        title: "Clinical Microscopy Board Review",
        scores: [],
      };

      (AssessmentService.prototype.getAssessmentById as jest.Mock).mockResolvedValue(mockAssessment);

      const response = await request(app).get("/api/review-center/assessments/assess_1");

      expect(response.status).toBe(200);
      expect(response.body.data.assessment.id).toBe("assess_1");
    });
  });

  describe("PUT /api/review-center/assessments/:id", () => {
    it("should update assessment successfully", async () => {
      const updated = {
        id: "assess_1",
        title: "Updated Title",
      };

      (AssessmentService.prototype.updateAssessment as jest.Mock).mockResolvedValue(updated);

      const response = await request(app)
        .put("/api/review-center/assessments/assess_1")
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.data.assessment.title).toBe("Updated Title");
    });
  });

  describe("DELETE /api/review-center/assessments/:id", () => {
    it("should delete assessment successfully", async () => {
      (AssessmentService.prototype.deleteAssessment as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete("/api/review-center/assessments/assess_1");

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Assessment deleted successfully");
    });
  });

  describe("GET /api/review-center/assessments/:id/template", () => {
    it("should return CSV template file", async () => {
      const mockCsv = "Candidate ID,Name,Email,Score\n";

      (AssessmentService.prototype.generateAssessmentTemplateCsv as jest.Mock).mockResolvedValue(mockCsv);

      const response = await request(app).get("/api/review-center/assessments/assess_1/template");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
      expect(response.text).toContain("Candidate ID,Name,Email,Score");
    });
  });

  describe("POST /api/review-center/assessments/:id/scores/bulk", () => {
    it("should bulk save candidate scores successfully", async () => {
      const mockBulkResult = {
        success: true,
        createdCount: 2,
        updatedCount: 0,
        errors: [],
      };

      (AssessmentService.prototype.bulkSaveScores as jest.Mock).mockResolvedValue(mockBulkResult);

      const response = await request(app)
        .post("/api/review-center/assessments/assess_1/scores/bulk")
        .send({
          items: [
            { email: "student1@example.com", score: 85, status: "PRESENT" },
            { email: "student2@example.com", score: 90, status: "PRESENT" },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.createdCount).toBe(2);
    });

    it("should return 400 when items is not an array", async () => {
      const response = await request(app)
        .post("/api/review-center/assessments/assess_1/scores/bulk")
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/review-center/assessments/:id/email-reports", () => {
    it("should trigger grade report emails dispatch", async () => {
      const mockResult = {
        sentCount: 5,
        failedCount: 0,
        errors: [],
      };

      (gradeEmailService.sendAssessmentGradeReportEmails as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/review-center/assessments/assess_1/email-reports")
        .send({ candidateIds: ["c_1", "c_2"] });

      expect(response.status).toBe(200);
      expect(response.body.data.sentCount).toBe(5);
    });
  });
});
