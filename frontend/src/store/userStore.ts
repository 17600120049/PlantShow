import { create } from 'zustand';
import { User } from '@/types';
import { userService } from '@/services/userService';

interface UserStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (code: string) => Promise<void>;
  logout: () => void;
  initUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoggedIn: false,
  login: async (code) => {
    try {
      const result = await userService.login(code);
      localStorage.setItem('plant-wander-token', result.accessToken);
      set({ user: result.user, isLoggedIn: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  },
  logout: () => {
    localStorage.removeItem('plant-wander-token');
    set({ user: null, isLoggedIn: false });
  },
  initUser: () => {
    const token = localStorage.getItem('plant-wander-token');
    if (token) {
      set({ isLoggedIn: true });
    }
  },
}));
