import { create } from 'zustand';
import type { Question } from '../types/question';

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
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
}

export const useQuestionBankFilterStore = create<QuestionBankFilter>((set) => ({
    search: "",
    selectedCategory: "",
    selectedDifficulty: "",
    selectedType: "",
    selectedStatus: "",
    setSearch: (search: string) => set({ search }),
    setSelectedCategory: (selectedCategory: string) => set({ selectedCategory }),
    setSelectedDifficulty: (selectedDifficulty: string) => set({ selectedDifficulty }),
    setSelectedType: (selectedType: string) => set({ selectedType }),
    setSelectedStatus: (selectedStatus: string) => set({ selectedStatus }),
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

    status: string;
    setStatus: (status: string) => void;
    
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
    status: "",
    setStatus: (status: string) => set({ status }),
}));

interface MCQFormStore {
    mcqChoices: string[];
    setMcqChoices: (mcqChoices: string[]) => void;

    mcqCorrectIndex: number;
    setMcqCorrectIndex: (mcqCorrectIndex: number) => void;
}

export const useMCQFormStore = create<MCQFormStore>((set) => ({
    mcqChoices: ["", "", "", ""],
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