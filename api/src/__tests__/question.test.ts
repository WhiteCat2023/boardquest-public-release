import './setup';
import request from 'supertest';
import express, { Express } from 'express';
import questionRouter from '../routes/admin/question.routes';
import * as questionService from '../services/admin/question.services';
import * as categoryService from '../services/admin/category.services';
import { ApiError } from '../utils/apiError';

// Mock question services
jest.mock('../services/admin/question.services');
// Mock category services
jest.mock('../services/admin/category.services');
// Mock background queue service to avoid DB connection leaks during tests
jest.mock('../services/queue.service', () => ({
  agenda: {
    now: jest.fn().mockResolvedValue({}),
    define: jest.fn(),
    start: jest.fn().mockResolvedValue({}),
    stop: jest.fn().mockResolvedValue({}),
  },
  startQueue: jest.fn().mockResolvedValue({}),
  stopQueue: jest.fn().mockResolvedValue({}),
}));

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
      (questionService.getQuestionById as jest.Mock).mockResolvedValue(mockQuestion);
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
      (questionService.getQuestionById as jest.Mock).mockResolvedValue(mockQuestion);
      (questionService.updateQuestion as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Validation failed')
      );

      const response = await request(app)
        .put('/api/questions/question-1')
        .send({ question: 'Incomplete update' });

      expect(response.status).toBe(400);
    });

    it('should return 404 when question to update does not exist', async () => {
      (questionService.getQuestionById as jest.Mock).mockRejectedValue(
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
      (questionService.getQuestionById as jest.Mock).mockResolvedValue(mockQuestion);
      (questionService.deleteQuestion as jest.Mock).mockResolvedValue(mockQuestion);

      const response = await request(app).delete('/api/questions/question-1');

      expect(response.status).toBe(200);
      expect(response.body.data.question).toBeDefined();
      expect(response.body.data.question.id).toBe('question-1');
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 when question to delete does not exist', async () => {
      (questionService.getQuestionById as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Question not found')
      );

      const response = await request(app).delete('/api/questions/nonexistent-id');

      expect(response.status).toBe(404);
    });

    it('should call deleteQuestion service with the correct questionId', async () => {
      (questionService.getQuestionById as jest.Mock).mockResolvedValue(mockQuestion);
      (questionService.deleteQuestion as jest.Mock).mockResolvedValue(mockQuestion);

      await request(app).delete('/api/questions/question-1');

      expect(questionService.deleteQuestion).toHaveBeenCalledWith('question-1');
    });
  });

  // ── PUT /publish/:questionId ──────────────────────────────────────────────

  describe('PUT /api/questions/publish/:questionId', () => {
    it('should toggle a question publish state and return 200', async () => {
      const mockPublishedQuestion = {
        ...mockQuestion,
        isPublished: true,
      };
      (questionService.togglePublishState as jest.Mock).mockResolvedValue(mockPublishedQuestion);

      const response = await request(app)
        .put('/api/questions/publish/question-1')
        .send({ isPublished: true });

      expect(response.status).toBe(200);
      expect(response.body.data.question.isPublished).toBe(true);
      expect(response.body.message).toContain('published successfully');
      expect(questionService.togglePublishState).toHaveBeenCalledWith('question-1', true);
    });

    it('should return 400 if isPublished is not a boolean', async () => {
      const response = await request(app)
        .put('/api/questions/publish/question-1')
        .send({ isPublished: "invalid-type" });

      expect(response.status).toBe(400);
    });
  });

  // ── Category routes ────────────────────────────────────────────────────────

  describe('POST /api/questions/category/create', () => {
    it('should create a new category and return 201', async () => {
      const mockNewCategory = {
        id: 'category-1',
        name: 'Clinical Chemistry',
        authorId: 'author-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (categoryService.createNewCategory as jest.Mock).mockResolvedValue(mockNewCategory);

      const response = await request(app)
        .post('/api/questions/category/create')
        .send({
          name: 'Clinical Chemistry',
          authorId: 'author-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.category).toBeDefined();
      expect(response.body.data.category.id).toBe('category-1');
      expect(response.body.message).toContain('created successfully');
    });
  });

  describe('GET /api/questions/category/get', () => {
    it('should return all categories and 200', async () => {
      const mockCategoriesList = [
        {
          id: 'category-1',
          name: 'Clinical Chemistry',
          authorId: 'author-1',
        },
      ];
      (categoryService.getAllCategories as jest.Mock).mockResolvedValue(mockCategoriesList);

      const response = await request(app).get('/api/questions/category/get');

      expect(response.status).toBe(200);
      expect(response.body.data.categories).toBeDefined();
      expect(response.body.data.categories.length).toBe(1);
      expect(response.body.message).toContain('retrieved successfully');
    });
  });

  describe('GET /api/questions/category/single/:categoryId', () => {
    it('should return category by ID and 200', async () => {
      const mockCat = {
        id: 'category-1',
        name: 'Clinical Chemistry',
        authorId: 'author-1',
      };
      (categoryService.getCategoryById as jest.Mock).mockResolvedValue(mockCat);

      const response = await request(app).get('/api/questions/category/single/category-1');

      expect(response.status).toBe(200);
      expect(response.body.data.category).toBeDefined();
      expect(response.body.data.category.id).toBe('category-1');
      expect(response.body.message).toContain('retrieved successfully');
    });
  });

  describe('PUT /api/questions/category/single/:categoryId', () => {
    it('should update a category and return 200', async () => {
      const mockUpdatedCategory = {
        id: 'category-1',
        name: 'Clinical Chemistry Updated',
        authorId: 'author-1',
      };
      (categoryService.updateCategory as jest.Mock).mockResolvedValue(mockUpdatedCategory);

      const response = await request(app)
        .put('/api/questions/category/single/category-1')
        .send({
          name: 'Clinical Chemistry Updated',
          categoryId: 'category-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.category).toBeDefined();
      expect(response.body.data.category.name).toBe('Clinical Chemistry Updated');
      expect(response.body.message).toContain('updated successfully');
    });
  });

  describe('DELETE /api/questions/category/single/:categoryId', () => {
    it('should delete category and return 200', async () => {
      const mockDeletedCat = {
        id: 'category-1',
        name: 'Clinical Chemistry',
        authorId: 'author-1',
      };
      (categoryService.deleteCategory as jest.Mock).mockResolvedValue(mockDeletedCat);

      const response = await request(app).delete('/api/questions/category/single/category-1');

      expect(response.status).toBe(200);
      expect(response.body.data.category).toBeDefined();
      expect(response.body.data.category.id).toBe('category-1');
      expect(response.body.message).toContain('deleted successfully');
    });
  });
});
