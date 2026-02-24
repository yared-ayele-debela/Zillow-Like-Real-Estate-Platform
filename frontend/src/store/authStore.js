import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';
import realtimeService from '../services/realtimeService';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Set user and token
      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({ user, token, isAuthenticated: !!user });
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const data = await authService.login(credentials);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'Login failed',
          };
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const data = await authService.register(userData);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      // Logout
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          realtimeService.disconnectRealtime();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('token');
        }
      },

      // Update user
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      // Check authentication on app load
      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getUser();
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
