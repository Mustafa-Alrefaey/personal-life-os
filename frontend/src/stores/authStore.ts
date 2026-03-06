import { create } from 'zustand';
import type { User } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  // Set user and authentication status
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  // Logout user
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  // Initialize auth state from localStorage - must be synchronous
  initialize: () => {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    set({ user, isAuthenticated, isInitialized: true });
  },
}));
