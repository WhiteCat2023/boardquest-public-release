export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ' | 'True/False' | 'Short Answer';
export type QuestionStatus = 'Approved' | 'Pending Review' | 'Needs Revision' | 'Draft';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  category: Category;
  topic: string;
  authorId: string;
  author: { name: string } | string;
  choices?: string[];
  correctAnswer: string;
  status: QuestionStatus;
  feedback?: string;
  createdAt: string;

}

export interface Category {
  id: string;
  name: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}