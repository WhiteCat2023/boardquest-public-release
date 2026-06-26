import { create } from 'zustand';

interface LoginErrorStore {
    emailError: string | null;
    passwordError: string | null;
    setError: (emailError: string | null, passwordError: string | null) => void;
    clearError: () => void;
}

export const useLoginErrorStore = create<LoginErrorStore>((set) => ({
    emailError: null,
    passwordError: null,
    setError: (emailError: string | null, passwordError: string | null) => set({ emailError, passwordError }),
    clearError: () => set({ emailError: null, passwordError: null }),
}));

