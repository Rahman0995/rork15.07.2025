import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Получаем переменные окружения с fallback значениями из .env файла
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qcdqofdmflhgsabyopfe.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZHFvZmRtZmxoZ3NhYnlvcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODkxNTMsImV4cCI6MjA2ODU2NTE1M30.qYn87AuahL4H9Tin8nVIKlH9-3UnCmtHGEBOA3RhyjU';

// Проверяем наличие конфигурации Supabase
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://qcdqofdmflhgsabyopfe.supabase.co' && 
  supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZHFvZmRtZmxoZ3NhYnlvcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODkxNTMsImV4cCI6MjA2ODU2NTE1M30.qYn87AuahL4H9Tin8nVIKlH9-3UnCmtHGEBOA3RhyjU' &&
  supabaseUrl.includes('supabase.co') &&
  supabaseAnonKey.length > 50;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase не настроен. Используется mock режим.');
}

// Создаем клиент только если Supabase настроен
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Хелперы для работы с аутентификацией
export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase не настроен' } };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase не настроен' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    if (!supabase) {
      return { error: { message: 'Supabase не настроен' } };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    if (!supabase) {
      return { user: null, error: { message: 'Supabase не настроен' } };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Хелперы для работы с данными
export const database = {
  // Пользователи
  users: {
    getAll: () => supabase?.from('users').select('*') || Promise.resolve({ data: [], error: null }),
    getById: (id: string) => supabase?.from('users').select('*').eq('id', id).single() || Promise.resolve({ data: null, error: null }),
    create: (user: any) => supabase?.from('users').insert(user).select().single() || Promise.resolve({ data: null, error: null }),
    update: (id: string, updates: any) => supabase?.from('users').update(updates).eq('id', id).select().single() || Promise.resolve({ data: null, error: null }),
    delete: (id: string) => supabase?.from('users').delete().eq('id', id) || Promise.resolve({ data: null, error: null }),
  },

  // Задачи
  tasks: {
    getAll: () => supabase?.from('tasks').select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)') || Promise.resolve({ data: [], error: null }),
    getById: (id: string) => supabase?.from('tasks').select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').eq('id', id).single() || Promise.resolve({ data: null, error: null }),
    create: (task: any) => supabase?.from('tasks').insert(task).select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    update: (id: string, updates: any) => supabase?.from('tasks').update(updates).eq('id', id).select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    delete: (id: string) => supabase?.from('tasks').delete().eq('id', id) || Promise.resolve({ data: null, error: null }),
    getByAssignee: (userId: string) => supabase?.from('tasks').select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').eq('assigned_to', userId) || Promise.resolve({ data: [], error: null }),
  },

  // Отчеты
  reports: {
    getAll: () => supabase?.from('reports').select('*, created_by:users!reports_created_by_fkey(*)') || Promise.resolve({ data: [], error: null }),
    getById: (id: string) => supabase?.from('reports').select('*, created_by:users!reports_created_by_fkey(*)').eq('id', id).single() || Promise.resolve({ data: null, error: null }),
    create: (report: any) => supabase?.from('reports').insert(report).select('*, created_by:users!reports_created_by_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    update: (id: string, updates: any) => supabase?.from('reports').update(updates).eq('id', id).select('*, created_by:users!reports_created_by_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    delete: (id: string) => supabase?.from('reports').delete().eq('id', id) || Promise.resolve({ data: null, error: null }),
    getByAuthor: (userId: string) => supabase?.from('reports').select('*, created_by:users!reports_created_by_fkey(*)').eq('created_by', userId) || Promise.resolve({ data: [], error: null }),
  },

  // Чаты
  chats: {
    getAll: () => supabase?.from('chats').select('*') || Promise.resolve({ data: [], error: null }),
    getById: (id: string) => supabase?.from('chats').select('*').eq('id', id).single() || Promise.resolve({ data: null, error: null }),
    create: (chat: any) => supabase?.from('chats').insert(chat).select().single() || Promise.resolve({ data: null, error: null }),
    update: (id: string, updates: any) => supabase?.from('chats').update(updates).eq('id', id).select().single() || Promise.resolve({ data: null, error: null }),
    delete: (id: string) => supabase?.from('chats').delete().eq('id', id) || Promise.resolve({ data: null, error: null }),
  },

  // Сообщения
  messages: {
    getAll: () => supabase?.from('messages').select('*, sender:users!messages_sender_id_fkey(*)') || Promise.resolve({ data: [], error: null }),
    getByChatId: (chatId: string) => supabase?.from('messages').select('*, sender:users!messages_sender_id_fkey(*)').eq('chat_id', chatId).order('created_at', { ascending: true }) || Promise.resolve({ data: [], error: null }),
    create: (message: any) => supabase?.from('messages').insert(message).select('*, sender:users!messages_sender_id_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    update: (id: string, updates: any) => supabase?.from('messages').update(updates).eq('id', id).select('*, sender:users!messages_sender_id_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    delete: (id: string) => supabase?.from('messages').delete().eq('id', id) || Promise.resolve({ data: null, error: null }),
  },

  // События календаря
  events: {
    getAll: () => supabase?.from('events').select('*, created_by:users!events_created_by_fkey(*)') || Promise.resolve({ data: [], error: null }),
    getById: (id: string) => supabase?.from('events').select('*, created_by:users!events_created_by_fkey(*)').eq('id', id).single() || Promise.resolve({ data: null, error: null }),
    create: (event: any) => supabase?.from('events').insert(event).select('*, created_by:users!events_created_by_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    update: (id: string, updates: any) => supabase?.from('events').update(updates).eq('id', id).select('*, created_by:users!events_created_by_fkey(*)').single() || Promise.resolve({ data: null, error: null }),
    delete: (id: string) => supabase?.from('events').delete().eq('id', id) || Promise.resolve({ data: null, error: null }),
    getByDateRange: (startDate: string, endDate: string) => 
      supabase?.from('events').select('*, created_by:users!events_created_by_fkey(*)')
        .gte('start_date', startDate)
        .lte('end_date', endDate) || Promise.resolve({ data: [], error: null }),
  },
};

// Хелперы для работы с файлами
export const storage = {
  uploadFile: async (bucket: string, path: string, file: File | Blob) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase не настроен' } };
    }
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  downloadFile: async (bucket: string, path: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase не настроен' } };
    }
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  getPublicUrl: (bucket: string, path: string) => {
    if (!supabase) {
      return '';
    }
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  deleteFile: async (bucket: string, path: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase не настроен' } };
    }
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },
};

// Хелперы для real-time подписок
export const realtime = {
  subscribeToTable: (table: string, callback: (payload: any) => void) => {
    if (!supabase) {
      return { unsubscribe: () => {} };
    }
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  },

  subscribeToMessages: (chatId: string, callback: (payload: any) => void) => {
    if (!supabase) {
      return { unsubscribe: () => {} };
    }
    return supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, 
        callback
      )
      .subscribe();
  },

  unsubscribe: (subscription: any) => {
    if (!supabase) {
      return;
    }
    return supabase.removeChannel(subscription);
  },
};