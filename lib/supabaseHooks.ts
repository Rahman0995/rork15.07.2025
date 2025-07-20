import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { database, realtime } from '@/lib/supabase';
import { useEffect } from 'react';

// Хуки для пользователей
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await database.users.getAll();
      if (error) throw error;
      return data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data, error } = await database.users.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: any) => {
      const { data, error } = await database.users.create(userData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await database.users.update(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', data.id] });
    },
  });
};

// Хуки для задач
export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await database.tasks.getAll();
      if (error) throw error;
      return data;
    },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data, error } = await database.tasks.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useUserTasks = (userId: string) => {
  return useQuery({
    queryKey: ['tasks', 'user', userId],
    queryFn: async () => {
      const { data, error } = await database.tasks.getByAssignee(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: any) => {
      const { data, error } = await database.tasks.create(taskData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await database.tasks.update(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', data.id] });
    },
  });
};

// Хуки для отчетов
export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await database.reports.getAll();
      if (error) throw error;
      return data;
    },
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: async () => {
      const { data, error } = await database.reports.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useUserReports = (userId: string) => {
  return useQuery({
    queryKey: ['reports', 'user', userId],
    queryFn: async () => {
      const { data, error } = await database.reports.getByAuthor(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: any) => {
      const { data, error } = await database.reports.create(reportData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await database.reports.update(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', data.id] });
    },
  });
};

// Хуки для чатов и сообщений
export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data, error } = await database.chats.getAll();
      if (error) throw error;
      return data;
    },
  });
};

export const useMessages = (chatId: string) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data, error } = await database.messages.getByChatId(chatId);
      if (error) throw error;
      return data;
    },
    enabled: !!chatId,
  });

  // Подписываемся на новые сообщения в реальном времени
  useEffect(() => {
    if (!chatId) return;

    const subscription = realtime.subscribeToMessages(chatId, (payload) => {
      console.log('Новое сообщение:', payload);
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    });

    return () => {
      realtime.unsubscribe(subscription);
    };
  }, [chatId, queryClient]);

  return query;
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageData: any) => {
      const { data, error } = await database.messages.create(messageData);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.chat_id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

// Хуки для событий календаря
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await database.events.getAll();
      if (error) throw error;
      return data;
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await database.events.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useEventsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['events', 'range', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await database.events.getByDateRange(startDate, endDate);
      if (error) throw error;
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: any) => {
      const { data, error } = await database.events.create(eventData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await database.events.update(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', data.id] });
    },
  });
};

// Хук для real-time подписок на таблицы
export const useRealtimeSubscription = (table: string, callback: (payload: any) => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = realtime.subscribeToTable(table, (payload) => {
      console.log(`Изменение в таблице ${table}:`, payload);
      callback(payload);
      
      // Обновляем соответствующие запросы
      queryClient.invalidateQueries({ queryKey: [table] });
    });

    return () => {
      realtime.unsubscribe(subscription);
    };
  }, [table, callback, queryClient]);
};