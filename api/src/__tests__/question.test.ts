import './setup';
import request from 'supertest';
import express, { Express } from 'express';
import questionRouter from '../routes/admin/question.routes';
import * as questionService from '../services/admin/question.services';
import { ApiError } from '../utils/apiError';

// Mock question services
jest.mock('../services/admin/question.services');

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  // Inject mock auth user (middleware is globally mocked in setup.ts)
  app.use((req, res, next) => {
    (req as any).user = { id: '1', role: 'ADMIN', email: 'admin@example.com' };
    next();
  });
  app.use('/api/questions', questionRouter);
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared mock data
// ─────────────────────────────────────────────────────────────────────────────

const mockCategory = {
  id: 'category-1',
  name: 'Clinical Chemistry',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockQuestion = {
  id: 'question-1',
  question: 'what is the normal range of blood glucose?',
  choices: ['70-100 mg/dL', '100-140 mg/dL', '140-180 mg/dL', '180-220 mg/dL'],
  correctAnswer: '70-100 mg/dl',
  categoryId: 'category-1',
  authorId: 'author-1',
  category: mockCategory,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const validQuestionPayload = {
  question: 'What is the normal range of blood glucose?',
  choices: ['70-100 mg/dL', '100-140 mg/dL', '140-180 mg/dL', '180-220 mg/dL'],
  correctAnswer: '70-100 mg/dL',
  categoryId: 'category-1',
  authorId: 'author-1',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Question Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /create ──────────────────────────────────────────────────────────

  describe('POST /api/questions/create', () => {
    it('should create a new question and return 201', async () => {
      (questionService.createNewQuestion as jest.Mock).mockResolvedValue(mockQuestion);

      const response = await request(app)
        .post('/api/questions/create')
        .send(validQuestionPayload);

      expect(response.status).toBe(201);
      expect(response.body.data.question).toBeDefined();
      expect(response.body.data.question.id).toBe('question-1');
      expect(response.body.message).toContain('created successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      (questionService.createNewQuestion as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Validation failed')
      );

      const response = await request(app)
        .post('/api/questions/create')
        .send({ question: 'Incomplete question' });

      expect(response.status).toBe(400);
    });

    it('should return 400 when choices array is empty', async () => {
      (questionService.createNewQuestion as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Validation failed')
      );

      const response = await request(app)
        .post('/api/questions/create')
        .send({ ...validQuestionPayload, choices: [] });

      expect(response.status).toBe(400);
    });

    it('should return 400 when categoryId is missing', async () => {
      (questionService.createNewQuestion as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Validation failed')
      );

      const { categoryId, ...payloadWithoutCategory } = validQuestionPayload;
      const response = await request(app)
        .post('/api/questions/create')
        .send(payloadWithoutCategory);

      expect(response.status).toBe(400);
    });
  });

  // ── GET /get ──────────────────────────────────────────────────────────────

  describe('GET /api/questions/get', () => {
    it('should return all questions with 200', async () => {
      const mockQuestions = [
        mockQuestion,
        { ...mockQuestion, id: 'question-2', question: 'what is hemoglobin?' },
      ];
      (questionService.getAllQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      const response = await request(app).get('/api/questions/get');

      expect(response.status).toBe(200);
      expect(response.body.data.questions).toHaveLength(2);
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return an empty array when no questions exist', async () => {
      (questionService.getAllQuestions as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/questions/get');

      expect(response.status).toBe(200);
      expect(response.body.data.questions).toHaveLength(0);
    });
  });

  // ── GET /get/:questionId ──────────────────────────────────────────────────

  describe('GET /api/questions/get/:questionId', () => {
    it('should return a question by ID with 200', async () => {
      (questionService.getQuestionById as jest.Mock).mockResolvedValue(mockQuestion);

      const response = await request(app).get('/api/questions/get/question-1');

      expect(response.status).toBe(200);
      expect(response.body.data.question).toBeDefined();
      expect(response.body.data.question.id).toBe('question-1');
      expect(response.body.data.question.category).toBeDefined();
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return 404 when question does not exist', async () => {
      (questionService.getQuestionById as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Question not found')
      );

      const response = await request(app).get('/api/questions/get/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  // ── GET /category/:categoryId ─────────────────────────────────────────────

  describe('GET /api/questions/category/:categoryId', () => {
    it('should return all questions for a given category', async () => {
      const categoryQuestions = [
        mockQuestion,
        { ...mockQuestion, id: 'question-2', question: 'what is albumin?' },
      ];
      (questionService.getQuestionsByCategory as jest.Mock).mockResolvedValue(categoryQuestions);

      const response = await request(app).get('/api/questions/category/category-1');

      expect(response.status).toBe(200);
      expect(response.body.data.questions).toHaveLength(2);
      expect(response.body.data.questions[0].categoryId).toBe('category-1');
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return 404 when no questions exist for the category', async () => {
      (questionService.getQuestionsByCategory as jest.Mock).mockRejectedValue(
        new ApiError(404, 'No questions found for this category')
      );

      const response = await request(app).get('/api/questions/category/empty-category');

      expect(response.status).toBe(404);
    });
  });

  // ── PUT /:questionId ──────────────────────────────────────────────────────

  describe('PUT /api/questions/:questionId', () => {
    it('should update a question and return 200', async () => {
      const updatedQuestion = {
        ...mockQuestion,
        question: 'what is the updated normal range of blood glucose?',
      };
      (questionService.updateQuestion as jest.Mock).mockResolvedValue(updatedQuestion);

      const response = await request(app)
        .put('/api/questions/question-1')
        .send({
          id: 'question-1',
          question: 'What is the updated normal range of blood glucose?',
          choices: ['70-100 mg/dL', '100-140 mg/dL', '140-180 mg/dL', '180-220 mg/dL'],
          correctAnswer: '70-100 mg/dL',
          categoryId: 'category-1',
          authorId: 'author-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.question).toBeDefined();
      expect(response.body.data.question.question).toContain('updated');
      expect(response.body.message).toContain('updated successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      (questionService.updateQuestion as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Validation failed')
      );

      const response = await request(app)
        .put('/api/questions/question-1')
        .send({ question: 'Incomplete update' });

      expect(response.status).toBe(400);
    });

    it('should return 404 when question to update does not exist', async () => {
      (questionService.updateQuestion as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Question not found')
      );

      const response = await request(app)
        .put('/api/questions/nonexistent-id')
        .send({
          id: 'nonexistent-id',
          ...validQuestionPayload,
        });

      expect(response.status).toBe(404);
    });
  });

  // ── DELETE /:questionId ───────────────────────────────────────────────────

  describe('DELETE /api/questions/:questionId', () => {
    it('should delete a question and return 200 with the deleted question', async () => {
      (questionService.deleteQuestion as jest.Mock).mockResolvedValue(mockQuestion);

      const response = await request(app).delete('/api/questions/question-1');

      expect(response.status).toBe(200);
      expect(response.body.data.question).toBeDefined();
      expect(response.body.data.question.id).toBe('question-1');
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 when question to delete does not exist', async () => {
      (questionService.deleteQuestion as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Question not found')
      );

      const response = await request(app).delete('/api/questions/nonexistent-id');

      expect(response.status).toBe(404);
    });

    it('should call deleteQuestion service with the correct questionId', async () => {
      (questionService.deleteQuestion as jest.Mock).mockResolvedValue(mockQuestion);

      await request(app).delete('/api/questions/question-1');

      expect(questionService.deleteQuestion).toHaveBeenCalledWith('question-1');
    });
  });
});
