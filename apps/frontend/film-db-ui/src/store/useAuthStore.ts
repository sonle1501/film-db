import { create } from 'zustand';

interface User {
  username: string;
  userId?: string;
  role?: string;
  displayName?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isInitializing: boolean;
  setAuth: (token: string, user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isInitializing: true,
  setAuth: (token, user) => set({ token, user, isInitializing: false }),
  setToken: (token) => set({ token }),
  logout: () => set({ token: null, user: null, isInitializing: false }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));

