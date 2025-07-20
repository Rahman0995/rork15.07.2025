import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL или Anon Key не настроены. Проверьте переменные окружения.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Хелперы для работы с аутентификацией
export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Хелперы для работы с данными
export const database = {
  // Пользователи
  users: {
    getAll: () => supabase.from('users').select('*'),
    getById: (id: string) => supabase.from('users').select('*').eq('id', id).single(),
    create: (user: any) => supabase.from('users').insert(user).select().single(),
    update: (id: string, updates: any) => supabase.from('users').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('users').delete().eq('id', id),
  },

  // Задачи
  tasks: {
    getAll: () => supabase.from('tasks').select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)'),
    getById: (id: string) => supabase.from('tasks').select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').eq('id', id).single(),
    create: (task: any) => supabase.from('tasks').insert(task).select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').single(),
    update: (id: string, updates: any) => supabase.from('tasks').update(updates).eq('id', id).select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').single(),
    delete: (id: string) => supabase.from('tasks').delete().eq('id', id),
    getByAssignee: (userId: string) => supabase.from('tasks').select('*, assigned_to:users!tasks_assigned_to_fkey(*), created_by:users!tasks_created_by_fkey(*)').eq('assigned_to', userId),
  },

  // Отчеты
  reports: {
    getAll: () => supabase.from('reports').select('*, created_by:users!reports_created_by_fkey(*)'),
    getById: (id: string) => supabase.from('reports').select('*, created_by:users!reports_created_by_fkey(*)').eq('id', id).single(),
    create: (report: any) => supabase.from('reports').insert(report).select('*, created_by:users!reports_created_by_fkey(*)').single(),
    update: (id: string, updates: any) => supabase.from('reports').update(updates).eq('id', id).select('*, created_by:users!reports_created_by_fkey(*)').single(),
    delete: (id: string) => supabase.from('reports').delete().eq('id', id),
    getByAuthor: (userId: string) => supabase.from('reports').select('*, created_by:users!reports_created_by_fkey(*)').eq('created_by', userId),
  },

  // Чаты
  chats: {
    getAll: () => supabase.from('chats').select('*'),
    getById: (id: string) => supabase.from('chats').select('*').eq('id', id).single(),
    create: (chat: any) => supabase.from('chats').insert(chat).select().single(),
    update: (id: string, updates: any) => supabase.from('chats').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('chats').delete().eq('id', id),
  },

  // Сообщения
  messages: {
    getAll: () => supabase.from('messages').select('*, sender:users!messages_sender_id_fkey(*)'),
    getByChatId: (chatId: string) => supabase.from('messages').select('*, sender:users!messages_sender_id_fkey(*)').eq('chat_id', chatId).order('created_at', { ascending: true }),
    create: (message: any) => supabase.from('messages').insert(message).select('*, sender:users!messages_sender_id_fkey(*)').single(),
    update: (id: string, updates: any) => supabase.from('messages').update(updates).eq('id', id).select('*, sender:users!messages_sender_id_fkey(*)').single(),
    delete: (id: string) => supabase.from('messages').delete().eq('id', id),
  },

  // События календаря
  events: {
    getAll: () => supabase.from('events').select('*, created_by:users!events_created_by_fkey(*)'),
    getById: (id: string) => supabase.from('events').select('*, created_by:users!events_created_by_fkey(*)').eq('id', id).single(),
    create: (event: any) => supabase.from('events').insert(event).select('*, created_by:users!events_created_by_fkey(*)').single(),
    update: (id: string, updates: any) => supabase.from('events').update(updates).eq('id', id).select('*, created_by:users!events_created_by_fkey(*)').single(),
    delete: (id: string) => supabase.from('events').delete().eq('id', id),
    getByDateRange: (startDate: string, endDate: string) => 
      supabase.from('events').select('*, created_by:users!events_created_by_fkey(*)')
        .gte('start_date', startDate)
        .lte('end_date', endDate),
  },
};

// Хелперы для работы с файлами
export const storage = {
  uploadFile: async (bucket: string, path: string, file: File | Blob) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  downloadFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  deleteFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },
};

// Хелперы для real-time подписок
export const realtime = {
  subscribeToTable: (table: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  },

  subscribeToMessages: (chatId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, 
        callback
      )
      .subscribe();
  },

  unsubscribe: (subscription: any) => {
    return supabase.removeChannel(subscription);
  },
};