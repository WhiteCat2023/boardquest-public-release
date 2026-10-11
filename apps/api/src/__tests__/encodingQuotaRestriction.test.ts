import './setup';
import prisma from '../services/prisma';
import { QuestionService } from '../services/admin/question.service';
import { encodingTrackerService } from '../services/admin/encoding-tracker.service';
import { QuestionDifficulty, QuestionType } from '../types/prisma.types';

jest.mock('../services/admin/notification.service', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));

describe('Teacher Question Quota Restrictions', () => {
  let questionService: QuestionService;

  beforeEach(() => {
    jest.clearAllMocks();
    questionService = new QuestionService(prisma as any);
  });

  describe('encodingTrackerService.checkTeacherQuota', () => {
    it('should report quota met when encodedCount equals or exceeds targetCount', async () => {
      (prisma.questionQuotaAssignment.findFirst as jest.Mock).mockResolvedValue({
        id: 'quota-1',
        teacherId: 'teacher-1',
        subjectId: 'sub-1',
        targetCount: 50,
        schoolYear: 'S.Y. 2025-2026',
      });
      (prisma.question.count as jest.Mock).mockResolvedValue(50);

      const result = await encodingTrackerService.checkTeacherQuota('teacher-1', 'sub-1');

      expect(result.isQuotaMet).toBe(true);
      expect(result.encodedCount).toBe(50);
      expect(result.targetCount).toBe(50);
      expect(result.remainingCount).toBe(0);
    });

    it('should report quota not met when encodedCount is less than targetCount', async () => {
      (prisma.questionQuotaAssignment.findFirst as jest.Mock).mockResolvedValue({
        id: 'quota-1',
        teacherId: 'teacher-1',
        subjectId: 'sub-1',
        targetCount: 50,
        schoolYear: 'S.Y. 2025-2026',
      });
      (prisma.question.count as jest.Mock).mockResolvedValue(35);

      const result = await encodingTrackerService.checkTeacherQuota('teacher-1', 'sub-1');

      expect(result.isQuotaMet).toBe(false);
      expect(result.encodedCount).toBe(35);
      expect(result.targetCount).toBe(50);
      expect(result.remainingCount).toBe(15);
    });

    it('should default targetCount baseline to 50 when no assignment exists', async () => {
      (prisma.questionQuotaAssignment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.question.count as jest.Mock).mockResolvedValue(55);

      const result = await encodingTrackerService.checkTeacherQuota('teacher-1', 'sub-1');

      expect(result.isQuotaMet).toBe(true);
      expect(result.targetCount).toBe(50);
      expect(result.encodedCount).toBe(55);
      expect(result.remainingCount).toBe(0);
    });
  });

  describe('QuestionService.createNewQuestion with teacher quota', () => {
    const validQuestionData = {
      question: 'What is the primary function of DNA polymerase in replication?',
      choices: ['Synthesize DNA', 'Degrade RNA', 'Ligate primers', 'Unwind helix'],
      choiceImages: [] as string[],
      correctAnswer: 'Synthesize DNA',
      categoryId: '507f1f77bcf86cd799439011',
      authorId: '507f1f77bcf86cd799439022',
      topic: 'Genetics',
      difficulty: QuestionDifficulty.MEDIUM,
      type: QuestionType.MCQ,
      status: 'PENDING_REVIEW' as any,
    };

    it('should throw 403 ApiError if teacher has already met quota for the subject', async () => {
      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({
        id: '507f1f77bcf86cd799439022',
        name: 'Prof. Gomez',
        email: 'gomez@school.edu',
        role: 'TEACHER',
        handledSubjectIds: ['507f1f77bcf86cd799439011'],
      });

      (prisma.questionQuotaAssignment.findFirst as jest.Mock).mockResolvedValue({
        targetCount: 50,
        schoolYear: 'S.Y. 2025-2026',
      });

      (prisma.question.count as jest.Mock).mockResolvedValue(50);

      (prisma.subject.findUnique as jest.Mock).mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        name: 'Molecular Biology',
      });

      await expect(questionService.createNewQuestion(validQuestionData)).rejects.toThrow(
        /You have already met your question authoring quota \(50\/50\) for Molecular Biology/,
      );
    });

    it('should allow creation if teacher has not yet met their quota', async () => {
      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({
        id: '507f1f77bcf86cd799439022',
        name: 'Prof. Gomez',
        email: 'gomez@school.edu',
        role: 'TEACHER',
        handledSubjectIds: ['507f1f77bcf86cd799439011'],
      });

      (prisma.questionQuotaAssignment.findFirst as jest.Mock).mockResolvedValue({
        targetCount: 50,
        schoolYear: 'S.Y. 2025-2026',
      });

      (prisma.question.count as jest.Mock).mockResolvedValue(20);

      (prisma.question.findMany as jest.Mock).mockResolvedValue([]);

      const mockCreated = {
        id: 'new-q-1',
        ...validQuestionData,
        status: 'PENDING_REVIEW',
        schoolYear: 'S.Y. 2025-2026',
      };
      (prisma.question.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await questionService.createNewQuestion(validQuestionData);
      expect(result).toBeDefined();
      expect(result.id).toBe('new-q-1');
    });
  });
});
