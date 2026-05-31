'use client';

import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
