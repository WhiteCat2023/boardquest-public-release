import { create } from "zustand";
import type { Question } from "../types/question";
import {
  bulkUploadQuestions,
  extractQuestions,
} from "../services/QuestionBankServices";
import { toast } from "sonner";

interface QuestionBankStore {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
}

export interface QuestionBankFilter {
  search: string;
  setSearch: (search: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export const useQuestionBankFilterStore = create<QuestionBankFilter>((set) => ({
  search: "",
  selectedCategory: "",
  selectedDifficulty: "",
  selectedType: "",
  setSearch: (search: string) => set({ search }),
  setSelectedCategory: (selectedCategory: string) => set({ selectedCategory }),
  setSelectedDifficulty: (selectedDifficulty: string) =>
    set({ selectedDifficulty }),
  setSelectedType: (selectedType: string) => set({ selectedType }),
}));

export const useQuestionBankStore = create<QuestionBankStore>((set) => ({
  questions: [],
  setQuestions: (questions: Question[]) => set({ questions }),
}));

interface QuestionFormStore {
  categoryId: string;
  setCategoryId: (categoryId: string) => void;

  topic: string;
  setTopic: (topic: string) => void;

  difficulty: string;
  setDifficulty: (difficulty: string) => void;

  format: string;
  setFormat: (format: string) => void;

  questionWording: string;
  setQuestionWording: (questionWording: string) => void;
}

export const useQuestionFormStore = create<QuestionFormStore>((set) => ({
  categoryId: "",
  setCategoryId: (categoryId: string) => set({ categoryId }),
  topic: "",
  setTopic: (topic: string) => set({ topic }),
  difficulty: "",
  setDifficulty: (difficulty: string) => set({ difficulty }),
  format: "",
  setFormat: (format: string) => set({ format }),
  questionWording: "",
  setQuestionWording: (questionWording: string) => set({ questionWording }),
}));

interface MCQFormStore {
  mcqChoices: string[];
  setMcqChoices: (mcqChoices: string[]) => void;

  mcqCorrectIndex: number;
  setMcqCorrectIndex: (mcqCorrectIndex: number) => void;
}

export const useMCQFormStore = create<MCQFormStore>((set) => ({
  mcqChoices: ["", ""],
  setMcqChoices: (mcqChoices: string[]) => set({ mcqChoices }),

  mcqCorrectIndex: 0,
  setMcqCorrectIndex: (mcqCorrectIndex: number) => set({ mcqCorrectIndex }),
}));

interface TrueFalseFormStore {
  tfCorrect: string;
  setTfCorrect: (tfCorrect: string) => void;
}

export const useTrueFalseFormStore = create<TrueFalseFormStore>((set) => ({
  tfCorrect: "",
  setTfCorrect: (tfCorrect: string) => set({ tfCorrect }),
}));

interface ShortAnswerFormStore {
  saCorrectAnswer: string;
  setSaCorrectAnswer: (saCorrectAnswer: string) => void;
}

export const useShortAnswerFormStore = create<ShortAnswerFormStore>((set) => ({
  saCorrectAnswer: "",
  setSaCorrectAnswer: (saCorrectAnswer: string) => set({ saCorrectAnswer }),
}));

interface EditQuestionStore {
  question: Question | null;
  setQuestion: (question: Question | null) => void;
}

export const useEditQuestionStore = create<EditQuestionStore>((set) => ({
  question: null,
  setQuestion: (question: Question | null) => set({ question }),
}));

interface EditBulkQuestionStore {
  editingIndex: number | null;
  setEditingIndex: (editingIndex: number | null) => void;
  editWording: string;
  setEditWording: (editWording: string) => void;
  editChoices: string;
  setEditChoices: (editChoices: string) => void;
  editCorrectAnswer: string;
  setEditCorrectAnswer: (editCorrectAnswer: string) => void;
  editTopic: string;
  setEditTopic: (editTopic: string) => void;
  editDifficulty: string;
  setEditDifficulty: (editDifficulty: string) => void;
  editType: string;
  setEditType: (editType: string) => void;
  editFeedback: string;
  setEditFeedback: (editFeedback: string) => void;
}

export const useEditBulkQuestionStore = create<EditBulkQuestionStore>(
  (set) => ({
    editingIndex: null,
    setEditingIndex: (editingIndex: number | null) => set({ editingIndex }),

    editWording: "",
    setEditWording: (editWording: string) => set({ editWording }),

    editChoices: "",
    setEditChoices: (editChoices: string) => set({ editChoices }),

    editCorrectAnswer: "",
    setEditCorrectAnswer: (editCorrectAnswer: string) =>
      set({ editCorrectAnswer }),

    editTopic: "",
    setEditTopic: (editTopic: string) => set({ editTopic }),

    editDifficulty: "EASY",
    setEditDifficulty: (editDifficulty: string) => set({ editDifficulty }),

    editType: "MCQ",
    setEditType: (editType: string) => set({ editType }),

    editFeedback: "",
    setEditFeedback: (editFeedback: string) => set({ editFeedback }),
  }),
);

interface ExtractedQuestionsProps {
  extractedQuestions: any[];
  setExtractedQuestions: (extractedQuestions: any[]) => void;
}

export const useExtractedQuestionsStore = create<ExtractedQuestionsProps>(
  (set) => ({
    extractedQuestions: [],
    setExtractedQuestions: (extractedQuestions: any[]) =>
      set({ extractedQuestions }),
  }),
);

export interface BulkUploadQuestionState {
  file: File | null;
  setFile: (file: File | null) => void;

  selectedCategoryId: string;
  setSelectedCategoryId: (selectedCategoryId: string) => void;

  isExtracting: boolean;
  setIsExtracting: (isExtracting: boolean) => void;

  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;

  handleBulkUpload: (axiosPrivate: any, navigate: any, from: string) => void;
  handleCancel: () => void;
  handleExtraction: (axiosPrivate: any) => void;
}

export const useBulkUploadQuestionStore = create<BulkUploadQuestionState>(
  (set) => ({
    file: null,
    setFile: (file: File | null) => set({ file }),

    selectedCategoryId: "",
    setSelectedCategoryId: (selectedCategoryId: string) =>
      set({ selectedCategoryId }),

    isExtracting: false,
    setIsExtracting: (isExtracting: boolean) => set({ isExtracting }),

    isUploading: false,
    setIsUploading: (isUploading: boolean) => set({ isUploading }),

    handleBulkUpload: (axiosPrivate: any, navigate: any, from: string) =>
      bulkUploadQuestions(axiosPrivate, navigate, from),
    handleCancel: () => {
      useExtractedQuestionsStore.getState().setExtractedQuestions([]);
      set({ file: null, selectedCategoryId: "" });
    },
    handleExtraction: (axiosPrivate: any) => extractQuestions(axiosPrivate),
  }),
);

interface UploadZoneState {
  dragActive: boolean;
  setDragActive: (dragActive: boolean) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useUploadZoneState = create<UploadZoneState>((set) => ({
  dragActive: false,
  setDragActive: (dragActive: boolean) => set({ dragActive }),

  handleDrop: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set({ dragActive: false });

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [".csv", ".xlsx", ".xls"];
      const matchesType = validTypes.some((type) =>
        droppedFile.name.toLowerCase().endsWith(type),
      );

      if (matchesType) {
        useBulkUploadQuestionStore.getState().setFile(droppedFile);
      } else {
        toast.error("Invalid file format. Please upload a CSV or Excel file.");
      }
    }
  },
  handleDrag: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set({ dragActive: true });
  },
  handleDragLeave: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set({ dragActive: false });
  },
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      useBulkUploadQuestionStore.getState().setFile(e.target.files[0]);
    }
  },
}));
