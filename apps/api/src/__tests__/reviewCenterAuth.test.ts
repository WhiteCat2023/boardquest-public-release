import "./setup";
import request from "supertest";
import express, { Express } from "express";
import reviewCenterAuthRouter from "../routes/review-center/auth.routes";
import { reviewCenterAuthService } from "../services/review-center/reviewCenterAuth.service";
import { ApiError } from "../utils/apiError";

jest.mock("../services/review-center/reviewCenterAuth.service");

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/review-center-app/auth", reviewCenterAuthRouter);
});

describe("Review Center Auth Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/review-center-app/auth/login", () => {
    it("should login representative successfully and set cookies", async () => {
      const mockUser = {
        id: "rc-user-1",
        email: "rep@reviewcenter.edu.ph",
        name: "Test Representative",
        companyName: "TopNotch Review Center",
        role: "REVIEW_CENTER_REPRESENTATIVE",
        reviewCenterId: "rc-1",
      };

      (reviewCenterAuthService.login as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/review-center-app/auth/login")
        .send({
          email: "rep@reviewcenter.edu.ph",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe("rep@reviewcenter.edu.ph");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return 401 for invalid credentials", async () => {
      (reviewCenterAuthService.login as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/review-center-app/auth/login")
        .send({
          email: "rep@reviewcenter.edu.ph",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/review-center-app/auth/logout", () => {
    it("should logout representative successfully", async () => {
      const response = await request(app).post(
        "/api/review-center-app/auth/logout"
      );

      expect(response.status).toBe(200);
      expect(response.body.message.toLowerCase()).toContain("logged out");
    });
  });

  describe("GET /api/review-center-app/auth/me", () => {
    it("should return 401 if token is missing", async () => {
      const response = await request(app).get("/api/review-center-app/auth/me");

      expect(response.status).toBe(401);
    });
  });
});
