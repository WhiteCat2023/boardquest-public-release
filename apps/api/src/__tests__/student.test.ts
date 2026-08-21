import './setup';
import request from 'supertest';
import express, { Express } from 'express';
import studentRouter from '../routes/admin/student.routes';
import * as studentService from '../services/admin/student.service';
import { ApiError } from '../utils/apiError';

// Mock student services
jest.mock('../services/admin/student.service');

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  // Inject mock auth user (middleware is mocked globally in setup.ts)
  app.use((req, res, next) => {
    (req as any).user = { id: '1', role: 'DEAN', email: 'admin@example.com' };
    next();
  });
  app.use('/api/students', studentRouter);
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared mock data
// ─────────────────────────────────────────────────────────────────────────────

const mockStudent = {
  id: 'student-1',
  email: 'student@example.com',
  name: 'Test Student',
  location: 'Test Location',
  level: 1,
  xp: 0,
  streak: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStudyPlan = {
  id: 'plan-1',
  studentId: 'student-1',
  subject: 'Clinical Chemistry',
  targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
};

const mockMastery = {
  id: 'mastery-1',
  studentId: 'student-1',
  subject: 'Clinical Chemistry',
  proficiency: 75,
  status: 'in_progress',
};

const mockExamResult = {
  id: 'exam-1',
  studentId: 'student-1',
  score: 85,
  total: 100,
  subject: 'Clinical Chemistry',
  createdAt: new Date().toISOString(),
};

const mockAchievement = {
  id: 'achievement-1',
  studentId: 'student-1',
  task: 'Complete first lesson',
  type: 'quest',
  xp: 100,
  badge: 'first-lesson',
  subject: 'Clinical Chemistry',
  createdAt: new Date().toISOString(),
};

const mockCompletion = {
  id: 'completion-1',
  studentId: 'student-1',
  subject: 'Clinical Chemistry',
  lessonId: 'cc-lesson-001',
  status: 'completed',
  createdAt: new Date().toISOString(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Student Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Student Management ────────────────────────────────────────────────────

  describe('POST /api/students/create', () => {
    it('should create a new student and return 201', async () => {
      (studentService.createStudent as jest.Mock).mockResolvedValue(mockStudent);

      const response = await request(app)
        .post('/api/students/create')
        .send({
          email: 'student@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Test Student',
          location: 'Test Location',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.student).toBeDefined();
      expect(response.body.data.student.email).toBe('student@example.com');
      expect(response.body.message).toContain('created successfully');
    });

    it('should create a student with separate firstName and lastName without explicit password', async () => {
      const studentWithSplitNames = {
        ...mockStudent,
        name: 'Alexander Wright',
        firstName: 'Alexander',
        lastName: 'Wright',
      };
      (studentService.createStudent as jest.Mock).mockResolvedValue(studentWithSplitNames);

      const response = await request(app)
        .post('/api/students/create')
        .send({
          email: 'alexander@example.com',
          firstName: 'Alexander',
          lastName: 'Wright',
          location: 'Manila',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.student.firstName).toBe('Alexander');
      expect(response.body.data.student.lastName).toBe('Wright');
      expect(response.body.data.student.name).toBe('Alexander Wright');
    });

    it('should return 400 when service throws ApiError', async () => {
      (studentService.createStudent as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Email already in use')
      );

      const response = await request(app)
        .post('/api/students/create')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Duplicate Student',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students/get', () => {
    it('should return paginated list of students', async () => {
      const paginatedResult = {
        data: [mockStudent],
        pagination: { total: 1, skip: 0, take: 10 },
      };

      (studentService.getAllStudents as jest.Mock).mockResolvedValue(paginatedResult);

      const response = await request(app).get('/api/students/get?skip=0&take=10');

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.pagination.total).toBe(1);
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return an empty list when no students exist', async () => {
      (studentService.getAllStudents as jest.Mock).mockResolvedValue({
        data: [],
        pagination: { total: 0, skip: 0, take: 10 },
      });

      const response = await request(app).get('/api/students/get');

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(0);
    });
  });

  describe('GET /api/students/get/:studentId', () => {
    it('should return a student profile by ID', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue(mockStudent);

      const response = await request(app).get('/api/students/get/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.student).toBeDefined();
      expect(response.body.data.student.id).toBe('student-1');
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return 404 when student is not found', async () => {
      (studentService.getStudentById as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Student not found')
      );

      const response = await request(app).get('/api/students/get/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/students/:studentId', () => {
    it('should update a student profile and return 200', async () => {
      const updatedStudent = { ...mockStudent, name: 'Updated Name' };
      (studentService.updateStudent as jest.Mock).mockResolvedValue(updatedStudent);

      const response = await request(app)
        .put('/api/students/student-1')
        .send({
          studentId: 'student-1',
          name: 'Updated Name',
          location: 'New Location',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.student.name).toBe('Updated Name');
      expect(response.body.message).toContain('updated successfully');
    });

    it('should return 400 when update fails', async () => {
      (studentService.updateStudent as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Student not found')
      );

      const response = await request(app)
        .put('/api/students/nonexistent-id')
        .send({ studentId: 'nonexistent-id', name: 'Ghost' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/students/:studentId', () => {
    it('should delete a student and return 200', async () => {
      (studentService.deleteStudent as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/api/students/student-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 400 when student does not exist', async () => {
      (studentService.deleteStudent as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Student not found')
      );

      const response = await request(app).delete('/api/students/nonexistent-id');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students/stats/:studentId', () => {
    it('should return student statistics', async () => {
      const mockStats = { level: 5, xp: 1200, streak: 7, achievementCount: 3 };
      (studentService.getStudentStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app).get('/api/students/stats/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.level).toBe(5);
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return 404 when student stats are not found', async () => {
      (studentService.getStudentStats as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Student not found')
      );

      const response = await request(app).get('/api/students/stats/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  // ── Study Plan ────────────────────────────────────────────────────────────

  describe('POST /api/students/study-plan/create', () => {
    it('should create a study plan and return 201', async () => {
      (studentService.createStudyPlan as jest.Mock).mockResolvedValue(mockStudyPlan);

      const response = await request(app)
        .post('/api/students/study-plan/create')
        .send({
          studentId: 'student-1',
          subject: 'Clinical Chemistry',
          targetDate: mockStudyPlan.targetDate,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.studyPlan).toBeDefined();
      expect(response.body.data.studyPlan.subject).toBe('Clinical Chemistry');
      expect(response.body.message).toContain('created successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      (studentService.createStudyPlan as jest.Mock).mockRejectedValue(
        new ApiError(400, 'studentId and subject are required')
      );

      const response = await request(app)
        .post('/api/students/study-plan/create')
        .send({ subject: 'Clinical Chemistry' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students/study-plan/:studentId', () => {
    it('should return all study plans for a student', async () => {
      (studentService.getStudyPlans as jest.Mock).mockResolvedValue([mockStudyPlan]);

      const response = await request(app).get('/api/students/study-plan/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.studyPlans).toHaveLength(1);
      expect(response.body.data.studyPlans[0].studentId).toBe('student-1');
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return empty array when no study plans exist', async () => {
      (studentService.getStudyPlans as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/students/study-plan/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.studyPlans).toHaveLength(0);
    });
  });

  describe('DELETE /api/students/study-plan/:studentId/:subject', () => {
    it('should delete a study plan and return 200', async () => {
      (studentService.deleteStudyPlan as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete(
        '/api/students/study-plan/student-1/Clinical%20Chemistry'
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 400 when study plan is not found', async () => {
      (studentService.deleteStudyPlan as jest.Mock).mockRejectedValue(
        new ApiError(400, 'Study plan not found')
      );

      const response = await request(app).delete(
        '/api/students/study-plan/nonexistent-id/Unknown'
      );

      expect(response.status).toBe(400);
    });
  });

  // ── Subject Mastery ───────────────────────────────────────────────────────

  describe('PUT /api/students/mastery/update', () => {
    it('should update subject mastery and return 200', async () => {
      (studentService.updateSubjectMastery as jest.Mock).mockResolvedValue(mockMastery);

      const response = await request(app)
        .put('/api/students/mastery/update')
        .send({
          studentId: 'student-1',
          subject: 'Clinical Chemistry',
          proficiency: 75,
          status: 'in_progress',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.mastery).toBeDefined();
      expect(response.body.data.mastery.proficiency).toBe(75);
      expect(response.body.message).toContain('updated successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      (studentService.updateSubjectMastery as jest.Mock).mockRejectedValue(
        new ApiError(400, 'studentId and subject are required')
      );

      const response = await request(app)
        .put('/api/students/mastery/update')
        .send({ proficiency: 75 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students/mastery/:studentId', () => {
    it('should return subject mastery for a student', async () => {
      (studentService.getSubjectMastery as jest.Mock).mockResolvedValue([mockMastery]);

      const response = await request(app).get('/api/students/mastery/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.mastery).toBeDefined();
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return empty mastery list when none recorded', async () => {
      (studentService.getSubjectMastery as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/students/mastery/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.mastery).toHaveLength(0);
    });
  });

  // ── Exam Results ──────────────────────────────────────────────────────────

  describe('POST /api/students/exam/record', () => {
    it('should record an exam result and return 201', async () => {
      (studentService.recordExamResult as jest.Mock).mockResolvedValue(mockExamResult);

      const response = await request(app)
        .post('/api/students/exam/record')
        .send({
          studentId: 'student-1',
          score: 85,
          total: 100,
          subject: 'Clinical Chemistry',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.examResult).toBeDefined();
      expect(response.body.data.examResult.score).toBe(85);
      expect(response.body.message).toContain('recorded successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      (studentService.recordExamResult as jest.Mock).mockRejectedValue(
        new ApiError(400, 'studentId, score and total are required')
      );

      const response = await request(app)
        .post('/api/students/exam/record')
        .send({ score: 85 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students/exam/:studentId', () => {
    it('should return exam results for a student', async () => {
      (studentService.getExamResults as jest.Mock).mockResolvedValue([mockExamResult]);

      const response = await request(app).get('/api/students/exam/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0].score).toBe(85);
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return empty array when no exam results exist', async () => {
      (studentService.getExamResults as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/students/exam/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.results).toHaveLength(0);
    });
  });

  describe('GET /api/students/exam/stats/:studentId', () => {
    it('should return exam result statistics', async () => {
      const mockExamStats = { average: 88, highest: 95, lowest: 72, total: 5 };
      (studentService.getExamResultStats as jest.Mock).mockResolvedValue(mockExamStats);

      const response = await request(app).get('/api/students/exam/stats/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.average).toBe(88);
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return 404 when student stats are not found', async () => {
      (studentService.getExamResultStats as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Student not found')
      );

      const response = await request(app).get('/api/students/exam/stats/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  // ── Achievements ──────────────────────────────────────────────────────────

  describe('POST /api/students/achievement/award', () => {
    it('should award an achievement and return 201', async () => {
      (studentService.awardAchievement as jest.Mock).mockResolvedValue(mockAchievement);

      const response = await request(app)
        .post('/api/students/achievement/award')
        .send({
          studentId: 'student-1',
          task: 'Complete first lesson',
          type: 'quest',
          xp: 100,
          badge: 'first-lesson',
          subject: 'Clinical Chemistry',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.achievement).toBeDefined();
      expect(response.body.data.achievement.badge).toBe('first-lesson');
      expect(response.body.message).toContain('awarded successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      (studentService.awardAchievement as jest.Mock).mockRejectedValue(
        new ApiError(400, 'studentId, task and type are required')
      );

      const response = await request(app)
        .post('/api/students/achievement/award')
        .send({ xp: 100 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students/achievement/:studentId', () => {
    it('should return achievements for a student', async () => {
      (studentService.getAchievements as jest.Mock).mockResolvedValue([mockAchievement]);

      const response = await request(app).get('/api/students/achievement/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.achievements).toHaveLength(1);
      expect(response.body.data.achievements[0].type).toBe('quest');
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return empty array when no achievements exist', async () => {
      (studentService.getAchievements as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/students/achievement/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.achievements).toHaveLength(0);
    });
  });

  // ── Lesson Completions ────────────────────────────────────────────────────

  describe('POST /api/students/lesson/record', () => {
    it('should record a lesson completion and return 201', async () => {
      (studentService.recordLessonCompletion as jest.Mock).mockResolvedValue(mockCompletion);

      const response = await request(app)
        .post('/api/students/lesson/record')
        .send({
          studentId: 'student-1',
          subject: 'Clinical Chemistry',
          lessonId: 'cc-lesson-001',
          status: 'completed',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.completion).toBeDefined();
      expect(response.body.data.completion.lessonId).toBe('cc-lesson-001');
      expect(response.body.message).toContain('recorded successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      (studentService.recordLessonCompletion as jest.Mock).mockRejectedValue(
        new ApiError(400, 'studentId, subject and lessonId are required')
      );

      const response = await request(app)
        .post('/api/students/lesson/record')
        .send({ status: 'completed' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/students/lesson/:studentId', () => {
    it('should return lesson completions for a student', async () => {
      (studentService.getLessonCompletions as jest.Mock).mockResolvedValue([mockCompletion]);

      const response = await request(app).get('/api/students/lesson/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.completions).toHaveLength(1);
      expect(response.body.data.completions[0].status).toBe('completed');
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should filter completions by subject when query param is provided', async () => {
      (studentService.getLessonCompletions as jest.Mock).mockResolvedValue([mockCompletion]);

      const response = await request(app).get(
        '/api/students/lesson/student-1?subject=Clinical%20Chemistry'
      );

      expect(response.status).toBe(200);
      expect(studentService.getLessonCompletions).toHaveBeenCalledWith(
        'student-1',
        'Clinical Chemistry'
      );
    });

    it('should return empty array when no completions exist', async () => {
      (studentService.getLessonCompletions as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/students/lesson/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.completions).toHaveLength(0);
    });
  });

  describe('GET /api/students/lesson/progress/:studentId', () => {
    it('should return lesson completion progress', async () => {
      const mockProgress = {
        total: 20,
        completed: 12,
        inProgress: 3,
        percentage: 60,
      };
      (studentService.getLessonCompletionProgress as jest.Mock).mockResolvedValue(mockProgress);

      const response = await request(app).get('/api/students/lesson/progress/student-1');

      expect(response.status).toBe(200);
      expect(response.body.data.progress).toBeDefined();
      expect(response.body.data.progress.percentage).toBe(60);
      expect(response.body.message).toContain('retrieved successfully');
    });

    it('should return 404 when student progress is not found', async () => {
      (studentService.getLessonCompletionProgress as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Student not found')
      );

      const response = await request(app).get('/api/students/lesson/progress/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });
});
