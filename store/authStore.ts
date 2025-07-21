import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { isDebugMode } from '@/utils/config';
import { trpcClient } from '@/lib/trpc';
import { auth, database } from '@/lib/supabase';

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
          // Authenticate with Supabase
          const { data, error } = await auth.signIn(email, password);
          
          if (error) {
            if (isDebugMode()) {
              console.log('Auth: Login failed -', error.message);
            }
            set({ error: 'Неверный email или пароль', isLoading: false });
            return;
          }
          
          if (data && data.user) {
            // Get user profile from database
            const { data: userProfile, error: profileError } = await database.users.getById(data.user.id);
            
            if (profileError || !userProfile) {
              if (isDebugMode()) {
                console.log('Auth: Profile error:', profileError);
              }
              set({ error: 'Ошибка загрузки профиля пользователя', isLoading: false });
              return;
            }
            
            if (isDebugMode()) {
              console.log('Auth: Login successful for user:', `${userProfile.first_name} ${userProfile.last_name}`);
            }
            
            const user: User = {
              id: userProfile.id,
              email: userProfile.email,
              name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
              rank: userProfile.rank || 'Рядовой',
              role: userProfile.role as UserRole,
              avatar: userProfile.avatar_url || '',
              unit: userProfile.unit || '',
              phone: userProfile.phone || '',
            };
            
            set({ 
              user, 
              currentUser: user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
          } else {
            set({ error: 'Ошибка аутентификации', isLoading: false });
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
          // Register with Supabase Auth
          const { data: authData, error } = await auth.signUp(data.email, data.password, {
            first_name: data.name.split(' ')[0],
            last_name: data.name.split(' ').slice(1).join(' ') || '',
            rank: data.rank,
            role: data.role || 'soldier',
            unit: data.unit,
            phone: data.phone,
          });
          
          if (error) {
            if (isDebugMode()) {
              console.log('Auth: Registration failed -', error.message);
            }
            set({ error: error.message || 'Ошибка при регистрации', isLoading: false });
            return;
          }
          
          if (authData && authData.user) {
            // Create user profile in database
            const { data: userProfile, error: profileError } = await database.users.create({
              id: authData.user.id,
              email: data.email,
              first_name: data.name.split(' ')[0],
              last_name: data.name.split(' ').slice(1).join(' ') || '',
              rank: data.rank,
              role: data.role || 'soldier',
              unit: data.unit,
              phone: data.phone || '',
              password_hash: '', // This will be handled by Supabase Auth
            });
            
            if (profileError) {
              if (isDebugMode()) {
                console.error('Error creating user profile:', profileError);
              }
              set({ error: `Ошибка создания профиля: ${profileError.message || 'Неизвестная ошибка'}`, isLoading: false });
              return;
            }
            
            if (isDebugMode()) {
              console.log('Auth: Registration successful for user:', data.name);
            }
            
            const user: User = {
              id: authData.user.id,
              email: data.email,
              name: data.name,
              rank: data.rank,
              role: (data.role as UserRole) || 'soldier',
              avatar: '',
              unit: data.unit,
              phone: data.phone || '',
            };
            
            set({ 
              user, 
              currentUser: user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
          } else {
            set({ error: 'Ошибка регистрации', isLoading: false });
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
          // Sign out from Supabase
          const { error } = await auth.signOut();
          
          if (error) {
            console.warn('Auth: Logout warning:', error.message);
          }
          
          set({ user: null, currentUser: null, isAuthenticated: false, isLoading: false, error: null });
          
          if (isDebugMode()) {
            console.log('Auth: Logout successful');
          }
        } catch (error) {
          if (isDebugMode()) {
            console.error('Auth: Logout error:', error);
          }
          // Force logout even if there's an error
          set({ user: null, currentUser: null, isAuthenticated: false, isLoading: false, error: null });
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
          
          // If user is authenticated but we need to verify with Supabase
          if (state.user && state.isAuthenticated) {
            try {
              // Verify user session with Supabase
              const { user, error } = await auth.getCurrentUser();
              if (error || !user) {
                // Session invalid, logout
                set({ user: null, currentUser: null, isAuthenticated: false });
              }
            } catch (error) {
              if (isDebugMode()) {
                console.warn('Auth: Session verification failed, but continuing with stored session');
              }
              // Don't logout on verification failure - could be network issue
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