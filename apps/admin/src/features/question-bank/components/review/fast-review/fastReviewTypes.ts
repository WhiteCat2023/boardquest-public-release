import type { Question } from "@/types/question";

export interface FastReviewWorkspaceProps {
  questions: Question[];
  isLoading: boolean;
  onRefresh?: () => void;
  selectedAuthor?: any;
  initialQuestionId?: string | null;
  onBackToTable?: () => void;
}

export interface QuestionDisplayData {
  questionContent: string;
  subjectName: string;
  topicName?: string;
  questionType: string;
  imageUrl?: string;
  choiceImages: string[];
  choicesList: any[];
  correctAnswer: string;
  rationale: string;
  displayStatus: string;
  commentsCount: number;
}

export function extractQuestionDisplayData(
  activeQuestion: Question
): QuestionDisplayData {
  const qAny = activeQuestion as any;
  const questionContent = qAny.question || activeQuestion.text || "";
  const subjectName = activeQuestion.category?.name || "Major Subject";
  const topicName = activeQuestion.topic;
  const questionType = activeQuestion.type || "MCQ";
  const imageUrl = qAny.imageUrl;
  const choiceImages = qAny.choiceImages || [];

  const rawChoices =
    qAny.choices || qAny.options || qAny.choiceOptions || [];

  const choicesList = Array.isArray(rawChoices)
    ? rawChoices
    : typeof rawChoices === "object" && rawChoices !== null
      ? Object.values(rawChoices)
      : [];

  const correctAnswer = qAny.correctAnswer || qAny.answer || "";
  const rationale = qAny.explanation || qAny.rationale || "";

  const commentsCount =
    qAny?._count?.comments ??
    qAny?._count?.questionComments ??
    (Array.isArray(qAny?.comments) ? qAny.comments.length : 0);

  const displayStatus =
    (activeQuestion.status === "PENDING_REVISION" ||
      qAny.status === "NEEDS_REVISION") &&
    commentsCount === 0
      ? "PENDING_REVIEW"
      : activeQuestion.status || "PENDING_REVIEW";

  return {
    questionContent,
    subjectName,
    topicName,
    questionType,
    imageUrl,
    choiceImages,
    choicesList,
    correctAnswer,
    rationale,
    displayStatus,
    commentsCount,
  };
}

export function getChoiceText(opt: any): string {
  if (typeof opt === "string") return opt;
  return opt?.text || opt?.label || "";
}

export function isChoiceCorrect(
  opt: any,
  index: number,
  correctAnswer: string
): boolean {
  const letter = String.fromCharCode(65 + index);
  const optText = getChoiceText(opt);
  const cleanCorrect = String(correctAnswer).trim();

  return (
    opt?.isCorrect === true ||
    opt?.correct === true ||
    optText.toLowerCase().trim() === cleanCorrect.toLowerCase() ||
    letter === cleanCorrect.toUpperCase()
  );
}
