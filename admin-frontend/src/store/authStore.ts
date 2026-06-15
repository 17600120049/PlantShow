import { create } from 'zustand';
import { Admin } from '../types';

interface AuthStore {
  admin: Admin | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  admin: null,
  isLoggedIn: false,
  login: async (username, password) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        set({ admin: data.admin, isLoggedIn: true });
        localStorage.setItem('admin-token', data.accessToken);
      } else {
        throw new Error(data.message || '登录失败');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  logout: () => {
    set({ admin: null, isLoggedIn: false });
    localStorage.removeItem('admin-token');
  },
}));
