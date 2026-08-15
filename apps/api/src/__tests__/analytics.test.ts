import './setup';
import request from 'supertest';
import express, { Express } from 'express';
import analyticsRouter from '../routes/admin/analytics.routes';
import * as analyticsService from '../services/admin/analytics.service';
import { ApiError } from '../utils/apiError';
import { authenticateToken } from '../middleware/auth.middleware';

// Mock analytics services
jest.mock('../services/admin/analytics.service');

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/analytics', analyticsRouter);
});

describe('Analytics Routes', () => {
  const mockAnalyticsResult = {
    studentInfo: {
      id: 'student-1',
      name: 'John Doe',
      email: 'john@example.com',
      level: 5,
      xp: 1200,
      streak: 3,
    },
    metrics: {
      examsCount: 4,
      avgScore: 82,
      avgAccuracy: 78,
      lessonsCompleted: 10,
      mastery: [
        {
          subject: 'Clinical Chemistry',
          proficiency: 85,
          status: 'mastered',
        }
      ],
    },
    aiInsights: {
      strongAreas: ['Clinical Chemistry'],
      weakAreas: ['Microbiology'],
      recommendations: ['Focus on Microbiology flashcards'],
      studyPlan: 'Review microbiology for 30 minutes daily.',
    },
    cacheStats: {
      cached: false,
      hash: 'somehash',
      updatedAt: new Date(),
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
    // Restore default auth mock implementation (ADMIN role)
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'admin@example.com', role: 'ADMIN', username: 'admin', name: 'Admin User' };
      next();
    });
  });

  describe('GET /api/analytics/student/:studentId', () => {
    it('should retrieve student analytics successfully', async () => {
      (analyticsService.getStudentAnalytics as jest.Mock).mockResolvedValue(mockAnalyticsResult);

      const response = await request(app).get('/api/analytics/student/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.studentInfo.name).toBe('John Doe');
      expect(response.body.data.metrics.examsCount).toBe(4);
      expect(response.body.data.aiInsights.strongAreas).toContain('Clinical Chemistry');
      expect(analyticsService.getStudentAnalytics).toHaveBeenCalledWith('student-1');
    });

    it('should return 404 if student is not found', async () => {
      (analyticsService.getStudentAnalytics as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Student not found')
      );

      const response = await request(app).get('/api/analytics/student/invalid-student');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Student not found');
    });

    it('should allow TEACHER role to retrieve student analytics successfully', async () => {
      (analyticsService.getStudentAnalytics as jest.Mock).mockResolvedValue(mockAnalyticsResult);
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: '3', email: 'teacher@example.com', role: 'TEACHER' };
        next();
      });

      const response = await request(app).get('/api/analytics/student/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.studentInfo.name).toBe('John Doe');
    });

    it('should block request if user role is unauthorized (e.g. STUDENT)', async () => {
      (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: '4', email: 'student@example.com', role: 'STUDENT' };
        next();
      });

      const response = await request(app).get('/api/analytics/student/student-1');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('INSUFFICIENT_PRIVILEGES');
    });
  });
});
