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