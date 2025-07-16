import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { mockUsers } from '@/constants/mockData';
import { isDebugMode } from '@/utils/config';

interface AuthState {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getCurrentUser: () => User | null;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        if (isDebugMode()) {
          console.log('Auth: Attempting login for:', email);
        }
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, this would be an API call to validate credentials
          const user = mockUsers.find(u => u.email === email);
          
          if (user && password === '123456') { // Simple mock password check
            if (isDebugMode()) {
              console.log('Auth: Login successful for user:', user.name);
            }
            set({ user, currentUser: user, isAuthenticated: true, isLoading: false, error: null });
          } else {
            if (isDebugMode()) {
              console.log('Auth: Login failed - invalid credentials');
            }
            set({ error: 'Неверный email или пароль', isLoading: false });
          }
        } catch (error) {
          if (isDebugMode()) {
            console.error('Auth: Login error:', error);
          }
          set({ error: 'Ошибка при входе в систему', isLoading: false });
        }
      },
      logout: async () => {
        set({ isLoading: true });
        
        if (isDebugMode()) {
          console.log('Auth: Logging out user');
        }
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ user: null, currentUser: null, isAuthenticated: false, isLoading: false, error: null });
          
          if (isDebugMode()) {
            console.log('Auth: Logout successful');
          }
        } catch (error) {
          if (isDebugMode()) {
            console.error('Auth: Logout error:', error);
          }
          set({ error: 'Ошибка при выходе из системы', isLoading: false });
        }
      },
      clearError: () => set({ error: null }),
      getCurrentUser: () => get().user,
      initialize: () => {
        set({ isInitialized: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // Always initialize, even if state is null
        setTimeout(() => {
          const currentState = useAuthStore.getState();
          currentState.initialize();
        }, 100);
      },
    }
  )
);