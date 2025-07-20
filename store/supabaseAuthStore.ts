import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { auth, supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

export const [SupabaseAuthProvider, useSupabaseAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    let mounted = true;

    // Проверяем, настроен ли Supabase
    if (!supabase) {
      console.warn('Supabase не настроен, используется mock режим');
      if (mounted) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }
      return;
    }

    // Получаем текущую сессию
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Ошибка получения сессии:', error);
          }
          
          setAuthState({
            user: session?.user ?? null,
            session: session,
            loading: false,
            initialized: true,
          });
        }
      } catch (error) {
        console.error('Ошибка инициализации аутентификации:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    };

    getInitialSession();

    // Подписываемся на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Изменение состояния аутентификации:', event, session?.user?.email);
        
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            user: session?.user ?? null,
            session: session,
            loading: false,
            initialized: true,
          }));

          // Сохраняем токен в AsyncStorage для использования в API запросах
          try {
            if (session?.access_token) {
              await AsyncStorage.setItem('supabase_token', session.access_token);
            } else {
              await AsyncStorage.removeItem('supabase_token');
            }
          } catch (error) {
            console.error('Ошибка сохранения токена:', error);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase не настроен' } };
    }
    
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('Ошибка входа:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase) {
      return { error: { message: 'Supabase не настроен' } };
    }
    
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { data, error } = await auth.signUp(email, password, userData);
      
      if (error) {
        console.error('Ошибка регистрации:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      if (supabase) {
        const { error } = await auth.signOut();
        if (error) {
          console.error('Ошибка выхода:', error);
        }
      }

      // Очищаем локальное хранилище
      try {
        await AsyncStorage.removeItem('supabase_token');
      } catch (error) {
        console.error('Ошибка очистки токена:', error);
      }
      
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateProfile = async (updates: any) => {
    if (!supabase) {
      return { error: { message: 'Supabase не настроен' } };
    }
    
    try {
      const { data, error } = await supabase.auth.updateUser(updates);
      
      if (error) {
        console.error('Ошибка обновления профиля:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      return { error };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!authState.user,
  };
});

// Хук для получения токена аутентификации
export const useSupabaseToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setToken(null);
      return;
    }

    const getToken = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        setToken(session?.access_token || null);
      } catch (error) {
        console.error('Ошибка получения токена:', error);
        setToken(null);
      }
    };

    getToken();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setToken(session?.access_token || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return token;
};