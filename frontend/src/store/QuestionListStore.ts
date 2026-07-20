import { create } from 'zustand';

interface QuestionListState {
  cursorsStack: (string | undefined)[];
  currentPageIndex: number;
  itemsPerPage: number;
  rowSelection: Record<string, boolean>;
  isFeedbackOpen: boolean;

  setCursorsStack: (stack: (string | undefined)[] | ((prev: (string | undefined)[]) => (string | undefined)[])) => void;
  setCurrentPageIndex: (index: number | ((prev: number) => number)) => void;
  setItemsPerPage: (limit: number) => void;
  setRowSelection: (selection: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  setIsFeedbackOpen: (open: boolean) => void;
  resetPagination: () => void;
  clearRowSelection: () => void;
}

export const useQuestionListStore = create<QuestionListState>((set) => ({
  cursorsStack: [undefined],
  currentPageIndex: 0,
  itemsPerPage: 9,
  rowSelection: {},
  isFeedbackOpen: false,

  setCursorsStack: (stack) =>
    set((state) => ({
      cursorsStack: typeof stack === 'function' ? stack(state.cursorsStack) : stack,
    })),
  setCurrentPageIndex: (index) =>
    set((state) => ({
      currentPageIndex: typeof index === 'function' ? index(state.currentPageIndex) : index,
    })),
  setItemsPerPage: (itemsPerPage) =>
    set({ itemsPerPage, cursorsStack: [undefined], currentPageIndex: 0, rowSelection: {} }),
  setRowSelection: (selection) =>
    set((state) => ({
      rowSelection: typeof selection === 'function' ? selection(state.rowSelection) : selection,
    })),
  setIsFeedbackOpen: (isFeedbackOpen) => set({ isFeedbackOpen }),
  resetPagination: () => set({ cursorsStack: [undefined], currentPageIndex: 0, rowSelection: {} }),
  clearRowSelection: () => set({ rowSelection: {} }),
}));
