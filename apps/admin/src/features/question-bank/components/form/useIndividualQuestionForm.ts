import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { useQuestionFormStore } from "@/store/QuestionBankStore";
import { useQuestionQualityCheck } from "@/features/question-bank/api/useQuestionQualityCheck";
import { useQuestionDetail } from "@/features/question-bank/api/useQuestionBank";
import {
  useCreateQuestion,
  useUpdateQuestion,
} from "@/features/question-bank/api/useSaveQuestion";
import type { QuestionFormat } from "./QuestionFormatSelector";

interface UseIndividualQuestionFormProps {
  questionId?: string;
  isEditMode?: boolean;
  onSuccessNavigate: () => void;
}

export function useIndividualQuestionForm({
  questionId,
  isEditMode = false,
  onSuccessNavigate,
}: UseIndividualQuestionFormProps) {
  const { auth } = useAuth();
  const authorName = (auth as any)?.data?.user?.name || "Author";

  const {
    categoryId,
    setCategoryId,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    format,
    setFormat,
    questionWording,
    setQuestionWording,
    status,
    setStatus,
  } = useQuestionFormStore();

  // MCQ States
  const [mcqChoices, setMcqChoices] = useState<string[]>(["", ""]);
  const [mcqChoiceImages, setMcqChoiceImages] = useState<string[]>(["", ""]);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState<number>(0);

  // Question Prompt Image State
  const [imageUrl, setImageUrl] = useState<string>("");

  // True/False States
  const [tfCorrect, setTfCorrect] = useState<"True" | "False">("True");

  // Short Answer States
  const [saCorrectAnswer, setSaCorrectAnswer] = useState("");

  // AI Paraphrase & Backup States
  const [isParaphraseOpen, setIsParaphraseOpen] = useState(false);
  const [originalQuestionDraft, setOriginalQuestionDraft] = useState<
    string | null
  >(null);
  const [originalBackup, setOriginalBackup] = useState<{
    question: string;
    choices: string[];
    correctAnswer: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    format: QuestionFormat;
  } | null>(null);

  // Collocated Query & Mutations
  const { data: existingQuestion } = useQuestionDetail(
    isEditMode ? questionId : null
  );
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion(questionId);
  const { validateQuestionQuality } = useQuestionQualityCheck();

  const isSubmitting =
    createQuestionMutation.isPending || updateQuestionMutation.isPending;

  // Pre-populate form when editing or initialize defaults
  useEffect(() => {
    if (isEditMode && existingQuestion) {
      setCategoryId(
        existingQuestion.categoryId ||
          (existingQuestion as any).category?.id ||
          ""
      );
      setTopic(existingQuestion.topic || "");
      setDifficulty(existingQuestion.difficulty || "MEDIUM");
      setFormat((existingQuestion.type as QuestionFormat) || "MCQ");
      setQuestionWording(existingQuestion.question || "");
      setImageUrl((existingQuestion as any).imageUrl || "");
      setStatus((existingQuestion as any).status || "");

      if (existingQuestion.type === "MCQ") {
        setMcqChoices(
          existingQuestion.choices && existingQuestion.choices.length >= 2
            ? existingQuestion.choices
            : ["", ""]
        );
        setMcqChoiceImages(
          (existingQuestion as any).choiceImages &&
            (existingQuestion as any).choiceImages.length > 0
            ? (existingQuestion as any).choiceImages
            : (existingQuestion.choices || ["", ""]).map(() => "")
        );
        const correctIdx = existingQuestion.choices
          ? existingQuestion.choices.indexOf(existingQuestion.correctAnswer)
          : -1;
        setMcqCorrectIndex(correctIdx >= 0 ? correctIdx : 0);
      } else if (existingQuestion.type === "TRUE_FALSE") {
        setTfCorrect(
          existingQuestion.correctAnswer === "True" ? "True" : "False"
        );
      } else if (existingQuestion.type === "SHORT_ANSWER") {
        setSaCorrectAnswer(existingQuestion.correctAnswer || "");
      }
    } else if (!isEditMode) {
      if (!difficulty) setDifficulty("MEDIUM");
      if (!format) setFormat("MCQ");
    }
  }, [
    existingQuestion,
    isEditMode,
    setCategoryId,
    setTopic,
    setDifficulty,
    setFormat,
    setQuestionWording,
    setStatus,
  ]);

  // MCQ Handlers
  const handleMcqChoiceChange = (index: number, val: string) => {
    const updated = [...mcqChoices];
    updated[index] = val;
    setMcqChoices(updated);
  };

  const handleChoiceImageChange = (index: number, imgUrl: string) => {
    const updated = [...mcqChoiceImages];
    while (updated.length <= index) {
      updated.push("");
    }
    updated[index] = imgUrl;
    setMcqChoiceImages(updated);
  };

  const handleAddChoice = () => {
    setMcqChoices([...mcqChoices, ""]);
    setMcqChoiceImages([...mcqChoiceImages, ""]);
  };

  const handleRemoveChoice = (index: number) => {
    if (mcqChoices.length <= 2) return;
    const updated = mcqChoices.filter((_, i) => i !== index);
    const updatedImages = mcqChoiceImages.filter((_, i) => i !== index);
    setMcqChoices(updated);
    setMcqChoiceImages(updatedImages);
    if (mcqCorrectIndex >= updated.length) {
      setMcqCorrectIndex(updated.length - 1);
    } else if (mcqCorrectIndex === index) {
      setMcqCorrectIndex(0);
    }
  };

  // AI Paraphrase & Backup Helpers
  const captureOriginalBackup = () => {
    if (!originalBackup && questionWording.trim()) {
      let computedCorrectAnswer = "";
      let finalChoices: string[] = [];

      if (format === "MCQ") {
        computedCorrectAnswer =
          mcqChoices[mcqCorrectIndex] || mcqChoices[0] || "";
        finalChoices = [...mcqChoices];
      } else if (format === "TRUE_FALSE") {
        computedCorrectAnswer = tfCorrect;
        finalChoices = ["True", "False"];
      } else if (format === "SHORT_ANSWER") {
        computedCorrectAnswer = saCorrectAnswer.trim();
        finalChoices = [];
      }

      setOriginalBackup({
        question: questionWording,
        choices: finalChoices,
        correctAnswer: computedCorrectAnswer,
        difficulty: (difficulty as any) || "MEDIUM",
        format: (format as QuestionFormat) || "MCQ",
      });
    }
  };

  const handleRestoreOriginal = () => {
    if (!originalBackup) return;
    setQuestionWording(originalBackup.question);
    setDifficulty(originalBackup.difficulty);
    setFormat(originalBackup.format);

    if (originalBackup.format === "MCQ") {
      setMcqChoices(originalBackup.choices);
      const matchIndex = originalBackup.choices.findIndex(
        (c) =>
          c.trim().toLowerCase() ===
          originalBackup.correctAnswer.trim().toLowerCase()
      );
      setMcqCorrectIndex(matchIndex >= 0 ? matchIndex : 0);
    } else if (originalBackup.format === "TRUE_FALSE") {
      setTfCorrect(
        originalBackup.correctAnswer === "True" ? "True" : "False"
      );
    } else if (originalBackup.format === "SHORT_ANSWER") {
      setSaCorrectAnswer(originalBackup.correctAnswer);
    }

    toast.success("Restored original base question to form!");
  };

  const handleOpenParaphraser = () => {
    if (!questionWording.trim()) {
      toast.error(
        "Please enter the question text before paraphrasing with AI."
      );
      return;
    }
    setOriginalQuestionDraft(questionWording);
    captureOriginalBackup();
    setIsParaphraseOpen(true);
  };

  const handleApplyParaphrase = (newStem: string) => {
    captureOriginalBackup();
    if (!originalQuestionDraft) {
      setOriginalQuestionDraft(questionWording);
    }
    setQuestionWording(newStem);
    toast.success("Applied paraphrased wording to question!");
  };

  const isNotOriginalQuestion =
    originalBackup !== null &&
    questionWording.trim().toLowerCase() !==
      originalBackup.question.trim().toLowerCase();

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateQuestionQuality({
      questionWording,
      format,
      mcqChoices,
      mcqChoiceImages,
      mcqCorrectIndex,
      tfCorrect,
      saCorrectAnswer,
      categoryId,
    });

    if (!isValid) return;

    let computedCorrectAnswer = "";
    let finalChoices: string[] = [];

    if (format === "MCQ") {
      finalChoices = mcqChoices.map((c, i) => {
        const text = c.trim();
        if (!text && mcqChoiceImages[i]) {
          return `Option ${String.fromCharCode(65 + i)}`;
        }
        return text;
      });
      computedCorrectAnswer =
        finalChoices[mcqCorrectIndex] || mcqChoices[mcqCorrectIndex] || "";
    } else if (format === "TRUE_FALSE") {
      computedCorrectAnswer = tfCorrect;
      finalChoices = ["True", "False"];
    } else if (format === "SHORT_ANSWER") {
      computedCorrectAnswer = saCorrectAnswer.trim();
      finalChoices = [];
    }

    const payload = {
      ...(isEditMode && { id: questionId }),
      question: questionWording,
      imageUrl: imageUrl.trim() || undefined,
      type: format || "MCQ",
      categoryId,
      topic: topic || "General",
      difficulty: difficulty || "MEDIUM",
      correctAnswer: computedCorrectAnswer,
      choices: finalChoices,
      choiceImages: format === "MCQ" ? mcqChoiceImages : [],
    };

    try {
      if (isEditMode) {
        await updateQuestionMutation.mutateAsync(payload);
      } else {
        await createQuestionMutation.mutateAsync(payload);
      }
      onSuccessNavigate();
    } catch {
      // Error handled by mutation toasts
    }
  };

  return {
    authorName,
    categoryId,
    setCategoryId,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    format,
    setFormat,
    questionWording,
    setQuestionWording,
    imageUrl,
    setImageUrl,
    status,
    mcqChoices,
    mcqChoiceImages,
    mcqCorrectIndex,
    setMcqCorrectIndex,
    handleMcqChoiceChange,
    handleChoiceImageChange,
    handleAddChoice,
    handleRemoveChoice,
    tfCorrect,
    setTfCorrect,
    saCorrectAnswer,
    setSaCorrectAnswer,
    isParaphraseOpen,
    setIsParaphraseOpen,
    originalBackup,
    isNotOriginalQuestion,
    handleOpenParaphraser,
    handleApplyParaphrase,
    handleRestoreOriginal,
    isSubmitting,
    handleSubmit,
  };
}
