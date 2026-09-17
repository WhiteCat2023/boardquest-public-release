import './setup';
import prisma from '../services/prisma';
import { QuestionService } from '../services/admin/question.service';
import { QuestionStatus } from '../types/prisma.types';
import * as notificationService from '../services/admin/notification.service';

jest.mock('../services/admin/notification.service', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));

describe('Question Comment & Review Workflow', () => {
  let service: QuestionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestionService(prisma as any);
  });

  describe('createQuestionComment on APPROVED question', () => {
    it('should transition question from APPROVED to PENDING_REVISION when an admin reviewer (DEAN) comments', async () => {
      const mockApprovedQuestion = {
        id: 'q-approved-1',
        question: 'Sample Question',
        status: QuestionStatus.APPROVED,
        authorId: 'author-faculty-1',
      };

      const mockReviewerComment = {
        id: 'comment-1',
        questionId: 'q-approved-1',
        authorId: 'dean-user-1',
        content: 'Option B has a typo, please fix.',
        isResolved: false,
        author: {
          id: 'dean-user-1',
          name: 'Dr. Dean',
          email: 'dean@boardquest.internal',
          role: 'DEAN',
        },
      };

      (prisma.question.findUnique as jest.Mock).mockResolvedValue(mockApprovedQuestion);
      (prisma.questionComment.create as jest.Mock).mockResolvedValue(mockReviewerComment);
      (prisma.question.update as jest.Mock).mockResolvedValue({
        ...mockApprovedQuestion,
        status: QuestionStatus.PENDING_REVISION,
      });
      (prisma.questionComment.count as jest.Mock).mockResolvedValue(1);

      const result = await service.createQuestionComment(
        'q-approved-1',
        'dean-user-1',
        'Option B has a typo, please fix.',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('comment-1');

      // Verify question status was updated to PENDING_REVISION
      expect(prisma.question.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'q-approved-1' },
          data: { status: QuestionStatus.PENDING_REVISION },
        }),
      );

      // Verify notification sent to author
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'author-faculty-1',
          title: 'Revision Requested on Approved Question',
          type: 'WARNING',
        }),
      );
    });

    it('should transition question from APPROVED to PENDING_REVISION when a TEAMLEAD comments', async () => {
      const mockApprovedQuestion = {
        id: 'q-approved-2',
        question: 'Sample Chemistry Question',
        status: QuestionStatus.APPROVED,
        authorId: 'author-faculty-1',
      };

      const mockLeadComment = {
        id: 'comment-2',
        questionId: 'q-approved-2',
        authorId: 'lead-user-1',
        content: 'Explanation needs additional rationale.',
        isResolved: false,
        author: {
          id: 'lead-user-1',
          name: 'Lead Instructor',
          email: 'lead@boardquest.internal',
          role: 'TEAMLEAD',
        },
      };

      (prisma.question.findUnique as jest.Mock).mockResolvedValue(mockApprovedQuestion);
      (prisma.questionComment.create as jest.Mock).mockResolvedValue(mockLeadComment);
      (prisma.question.update as jest.Mock).mockResolvedValue({
        ...mockApprovedQuestion,
        status: QuestionStatus.PENDING_REVISION,
      });
      (prisma.questionComment.count as jest.Mock).mockResolvedValue(1);

      await service.createQuestionComment(
        'q-approved-2',
        'lead-user-1',
        'Explanation needs additional rationale.',
      );

      expect(prisma.question.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'q-approved-2' },
          data: { status: QuestionStatus.PENDING_REVISION },
        }),
      );
    });

    it('should NOT transition APPROVED question to PENDING_REVISION if comment is from a TEACHER', async () => {
      const mockApprovedQuestion = {
        id: 'q-approved-3',
        question: 'Sample Question',
        status: QuestionStatus.APPROVED,
        authorId: 'teacher-1',
      };

      const mockTeacherComment = {
        id: 'comment-3',
        questionId: 'q-approved-3',
        authorId: 'teacher-1',
        content: 'Personal notes on my own question.',
        isResolved: false,
        author: {
          id: 'teacher-1',
          name: 'Prof. Smith',
          email: 'teacher@boardquest.internal',
          role: 'TEACHER',
        },
      };

      (prisma.question.findUnique as jest.Mock).mockResolvedValue(mockApprovedQuestion);
      (prisma.questionComment.create as jest.Mock).mockResolvedValue(mockTeacherComment);
      (prisma.questionComment.count as jest.Mock).mockResolvedValue(1);

      await service.createQuestionComment(
        'q-approved-3',
        'teacher-1',
        'Personal notes on my own question.',
      );

      // Question update to PENDING_REVISION should not be called for non-reviewer
      expect(prisma.question.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'q-approved-3' },
          data: { status: QuestionStatus.PENDING_REVISION },
        }),
      );
    });
  });

  describe('syncQuestionRevisionStatus', () => {
    it('should transition PENDING_REVISION to PENDING_REVIEW when all comments are resolved', async () => {
      const mockRevisionQuestion = {
        id: 'q-rev-1',
        status: QuestionStatus.PENDING_REVISION,
      };

      (prisma.question.findUnique as jest.Mock).mockResolvedValue(mockRevisionQuestion);
      (prisma.questionComment.count as jest.Mock).mockResolvedValue(0); // 0 unresolved

      await service.syncQuestionRevisionStatus('q-rev-1');

      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q-rev-1' },
        data: { status: QuestionStatus.PENDING_REVIEW },
      });
    });

    it('should transition PENDING_REVIEW to PENDING_REVISION when there are unresolved comments', async () => {
      const mockReviewQuestion = {
        id: 'q-rev-2',
        status: QuestionStatus.PENDING_REVIEW,
      };

      (prisma.question.findUnique as jest.Mock).mockResolvedValue(mockReviewQuestion);
      (prisma.questionComment.count as jest.Mock).mockResolvedValue(2); // 2 unresolved

      await service.syncQuestionRevisionStatus('q-rev-2');

      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q-rev-2' },
        data: { status: QuestionStatus.PENDING_REVISION },
      });
    });
  });

  describe('getPendingReviewAuthors', () => {
    it('should include authors who have questions in PENDING_REVISION or PENDING_REVIEW', async () => {
      const mockPendingQuestions = [
        {
          id: 'q-1',
          authorId: 'author-1',
          createdAt: new Date('2026-09-01'),
          updatedAt: new Date('2026-09-17'),
        },
        {
          id: 'q-2',
          authorId: 'author-1',
          createdAt: new Date('2026-09-02'),
          updatedAt: new Date('2026-09-15'),
        },
      ];

      const mockAuthors = [
        {
          id: 'author-1',
          name: 'Dr. Faculty',
          email: 'faculty@boardquest.internal',
          role: 'TEACHER',
        },
      ];

      (prisma.question.findMany as jest.Mock).mockResolvedValue(mockPendingQuestions);
      (prisma.adminUser.findMany as jest.Mock).mockResolvedValue(mockAuthors);

      const authors = await service.getPendingReviewAuthors();

      expect(authors).toHaveLength(1);
      expect(authors[0].id).toBe('author-1');
      expect(authors[0].pendingCount).toBe(2);
      expect(authors[0].latestSubmissionAt).toEqual(new Date('2026-09-17'));
    });
  });
});
