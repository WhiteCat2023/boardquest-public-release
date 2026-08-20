import "./setup";
import request from "supertest";
import express, { Express } from "express";
import uploadRouter from "../routes/admin/upload.routes";
import * as cloudService from "../services/cloud.service";

// Mock cloud service
jest.mock("../services/cloud.service");

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json({ limit: "25mb" }));
  app.use("/api/upload", uploadRouter);
});

describe("Upload Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/upload/badge-image", () => {
    it("should upload a badge image to Cloudinary successfully", async () => {
      const mockResult = {
        secure_url: "https://res.cloudinary.com/demo/image/upload/badge_icon_image/sample.png",
        url: "http://res.cloudinary.com/demo/image/upload/badge_icon_image/sample.png",
        public_id: "badge_icon_image/badge_12345",
        format: "png",
        width: 512,
        height: 512,
        bytes: 20480,
        created_at: new Date().toISOString(),
      };

      (cloudService.uploadImage as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/upload/badge-image")
        .send({
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          fileName: "sharp_mind",
          folder: "badge_icon_image",
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.imageUrl).toBe(mockResult.secure_url);
      expect(response.body.data.publicId).toBe(mockResult.public_id);
      expect(response.body.message).toContain("uploaded");
    });

    it("should return 400 if image payload is missing", async () => {
      const response = await request(app)
        .post("/api/upload/badge-image")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Image payload is required");
    });
  });

  describe("POST /api/upload", () => {
    it("should handle general uploads via alias endpoint", async () => {
      const mockResult = {
        secure_url: "https://res.cloudinary.com/demo/image/upload/badge_icon_image/sample.png",
        url: "http://res.cloudinary.com/demo/image/upload/badge_icon_image/sample.png",
        public_id: "badge_icon_image/badge_test",
        format: "png",
        width: 256,
        height: 256,
        bytes: 10240,
        created_at: new Date().toISOString(),
      };

      (cloudService.uploadImage as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/upload")
        .send({
          image: "data:image/png;base64,sample_data",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.imageUrl).toBe(mockResult.secure_url);
    });
  });
});
