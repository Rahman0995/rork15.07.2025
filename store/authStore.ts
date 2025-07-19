import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { isDebugMode } from '@/utils/config';
import { trpcClient } from '@/lib/trpc';

interface AuthState {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  clearError: () => void;
  getCurrentUser: () => User | null;
  initialize: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  rank: string;
  unit: string;
  phone?: string;
  role?: UserRole;
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
          // Try to authenticate with backend
          const response = await trpcClient.auth.login.mutate({ email, password });
          
          if (response.success && response.user) {
            if (isDebugMode()) {
              console.log('Auth: Login successful for user:', response.user.name);
            }
            // Ensure user has correct role type
            const user: User = {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              rank: response.user.rank || 'Рядовой',
              role: response.user.role as UserRole,
              avatar: response.user.avatar || '',
              unit: response.user.unit,
              phone: response.user.phone || '',
            };
            set({ 
              user, 
              currentUser: user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
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
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        if (isDebugMode()) {
          console.log('Auth: Attempting registration for:', data.email);
        }
        
        try {
          // Try to register with backend
          const response = await trpcClient.auth.register.mutate(data);
          
          if (response.success && response.user) {
            if (isDebugMode()) {
              console.log('Auth: Registration successful for user:', response.user.name);
            }
            // Ensure user has correct role type
            const user: User = {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              rank: response.user.rank || 'Рядовой',
              role: response.user.role as UserRole,
              avatar: response.user.avatar || '',
              unit: response.user.unit,
              phone: response.user.phone || '',
            };
            set({ 
              user, 
              currentUser: user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
          } else {
            if (isDebugMode()) {
              console.log('Auth: Registration failed');
            }
            set({ error: 'Ошибка при регистрации', isLoading: false });
          }
        } catch (error) {
          if (isDebugMode()) {
            console.error('Auth: Registration error:', error);
          }
          set({ error: 'Ошибка при регистрации', isLoading: false });
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
      updateUser: (updatedUser: User) => {
        set({ user: updatedUser, currentUser: updatedUser });
      },
      clearError: () => set({ error: null }),
      getCurrentUser: () => get().user,
      initialize: async () => {
        try {
          const state = get();
          
          if (isDebugMode()) {
            console.log('Auth: Initializing with state:', {
              hasUser: !!state.user,
              isAuthenticated: state.isAuthenticated
            });
          }
          
          // Always set initialized to true first to prevent loops
          set({ isInitialized: true });
          
          // If user is authenticated but we need to verify with backend
          if (state.user && state.isAuthenticated) {
            try {
              // Verify user session with backend
              const response = await trpcClient.auth.verify.query();
              if (!response.success) {
                // Session invalid, logout
                set({ user: null, currentUser: null, isAuthenticated: false });
              }
            } catch (error) {
              if (isDebugMode()) {
                console.warn('Auth: Session verification failed, but continuing with stored session');
              }
              // Don't logout on verification failure - could be network issue
              // set({ user: null, currentUser: null, isAuthenticated: false });
            }
          }
        } catch (error) {
          console.error('Auth: Error during initialization:', error);
          // Ensure we're always initialized even if there's an error
          set({ isInitialized: true });
        }
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
        try {
          // Always initialize, even if state is null
          if (isDebugMode()) {
            console.log('Auth: Rehydrating storage, state:', state);
          }
          
          // Use requestAnimationFrame to ensure initialization happens after rehydration
          requestAnimationFrame(async () => {
            try {
              const currentState = useAuthStore.getState();
              if (!currentState.isInitialized) {
                await currentState.initialize();
              }
              
              if (isDebugMode()) {
                console.log('Auth: Storage rehydrated and initialized');
              }
            } catch (error) {
              console.error('Auth: Error during post-rehydration initialization:', error);
            }
          });
        } catch (error) {
          console.error('Auth: Error during rehydration:', error);
          // Ensure initialization even on error
          requestAnimationFrame(async () => {
            try {
              const currentState = useAuthStore.getState();
              await currentState.initialize();
            } catch (initError) {
              console.error('Auth: Error during fallback initialization:', initError);
            }
          });
        }
      },
    }
  )
);