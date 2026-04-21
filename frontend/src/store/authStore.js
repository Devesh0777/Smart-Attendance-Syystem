import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  userId: localStorage.getItem('userId') || null,
  role: localStorage.getItem('role') || null,
  name: localStorage.getItem('userName') || null,

  login: (token, userId, role, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    localStorage.setItem('userName', name || '');
    set({ token, userId, role, name });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    set({ token: null, userId: null, role: null, name: null });
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}));
