import { supabase } from '@/lib/supabase';

export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export const analytics = {
  // Отслеживание событий
  track: async (eventName: string, properties?: Record<string, any>, userId?: string) => {
    if (!supabase) {
      console.warn('Supabase не настроен');
      return;
    }

    try {
      const event: AnalyticsEvent = {
        event_name: eventName,
        user_id: userId,
        properties: properties || {},
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert(event);

      if (error) {
        console.error('Ошибка отслеживания события:', error);
      }
    } catch (error) {
      console.error('Ошибка отслеживания события:', error);
    }
  },

  // Отслеживание времени на экране
  trackScreenView: async (screenName: string, userId?: string) => {
    await analytics.track('screen_view', { screen_name: screenName }, userId);
  },

  // Отслеживание действий пользователя
  trackUserAction: async (action: string, details?: Record<string, any>, userId?: string) => {
    await analytics.track('user_action', { action, ...details }, userId);
  },

  // Получение аналитики
  getAnalytics: async (startDate: string, endDate: string) => {
    if (!supabase) {
      return { data: [], error: 'Supabase не настроен' };
    }

    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Получение популярных экранов
  getPopularScreens: async (days: number = 7) => {
    if (!supabase) {
      return { data: [], error: 'Supabase не настроен' };
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .rpc('get_popular_screens', {
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString(),
        });

      return { data, error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Получение активности пользователей
  getUserActivity: async (days: number = 30) => {
    if (!supabase) {
      return { data: [], error: 'Supabase не настроен' };
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .rpc('get_user_activity', {
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString(),
        });

      return { data, error };
    } catch (error) {
      return { data: [], error };
    }
  },
};