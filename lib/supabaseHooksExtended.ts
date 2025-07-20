import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { analytics } from '@/lib/supabaseAnalytics';
import { pushNotifications } from '@/lib/supabasePushNotifications';
import { offlineSync } from '@/lib/supabaseOfflineSync';

// Хук для настроек пользователя
export const useUserSettings = (userId?: string) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        // Если настроек нет, создаем их с значениями по умолчанию
        if (!data) {
          const defaultSettings = {
            user_id: userId,
            theme: 'light',
            language: 'ru',
            notifications_enabled: true,
            push_notifications_enabled: true,
            email_notifications_enabled: true,
            sound_enabled: true,
            vibration_enabled: true,
          };

          const { data: newSettings, error: createError } = await supabase
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings);
        } else {
          setSettings(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const updateSettings = async (updates: Partial<any>) => {
    if (!userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      
      // Отслеживаем изменение настроек
      await analytics.track('settings_updated', updates, userId);
    } catch (err) {
      setError(err);
    }
  };

  return { settings, loading, error, updateSettings };
};

// Хук для тегов
export const useTags = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');

        if (error) throw error;
        setTags(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const createTag = async (name: string, color: string = '#007AFF') => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({ name, color })
        .select()
        .single();

      if (error) throw error;
      setTags(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err);
      return null;
    }
  };

  return { tags, loading, error, createTag };
};

// Хук для участников чата
export const useChatParticipants = (chatId: string) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!chatId || !supabase) {
      setLoading(false);
      return;
    }

    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_participants')
          .select(`
            *,
            user:users(*)
          `)
          .eq('chat_id', chatId);

        if (error) throw error;
        setParticipants(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();

    // Подписка на изменения участников
    const subscription = supabase
      .channel(`chat_participants:${chatId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_participants', filter: `chat_id=eq.${chatId}` },
        () => fetchParticipants()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId]);

  const addParticipant = async (userId: string, role: string = 'member') => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .insert({ chat_id: chatId, user_id: userId, role })
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err);
      return null;
    }
  };

  const removeParticipant = async (userId: string) => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  return { participants, loading, error, addParticipant, removeParticipant };
};

// Хук для комментариев к отчетам
export const useReportComments = (reportId: string) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!reportId || !supabase) {
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('report_comments')
          .select(`
            *,
            user:users(*)
          `)
          .eq('report_id', reportId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Подписка на новые комментарии
    const subscription = supabase
      .channel(`report_comments:${reportId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'report_comments', filter: `report_id=eq.${reportId}` },
        (payload) => {
          setComments(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [reportId]);

  const addComment = async (content: string, userId: string) => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('report_comments')
        .insert({ report_id: reportId, user_id: userId, content })
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      
      // Отслеживаем добавление комментария
      await analytics.track('report_comment_added', { report_id: reportId }, userId);
      
      return data;
    } catch (err) {
      setError(err);
      return null;
    }
  };

  return { comments, loading, error, addComment };
};

// Хук для офлайн синхронизации
export const useOfflineSync = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await offlineSync.getPendingActionsCount();
      setPendingCount(count);
    };

    updatePendingCount();
    
    // Обновляем счетчик каждые 30 секунд
    const interval = setInterval(updatePendingCount, 30000);
    
    // Запускаем автосинхронизацию
    const unsubscribe = offlineSync.startAutoSync();

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const syncNow = async () => {
    setSyncing(true);
    try {
      await offlineSync.syncOfflineActions();
      const count = await offlineSync.getPendingActionsCount();
      setPendingCount(count);
    } finally {
      setSyncing(false);
    }
  };

  return { pendingCount, syncing, syncNow };
};

// Хук для push-уведомлений
export const usePushNotifications = (userId?: string) => {
  const [token, setToken] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const registerPush = async () => {
      const pushToken = await pushNotifications.registerForPushNotifications(userId);
      setToken(pushToken);
      setRegistered(!!pushToken);
    };

    registerPush();
  }, [userId]);

  const sendNotification = async (targetUserId: string, title: string, body: string, data?: any) => {
    await pushNotifications.sendPushNotification(targetUserId, title, body, data);
  };

  return { token, registered, sendNotification };
};