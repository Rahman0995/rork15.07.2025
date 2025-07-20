-- Создание таблиц для военного приложения в Supabase

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  rank TEXT,
  role TEXT DEFAULT 'soldier' CHECK (role IN ('admin', 'officer', 'soldier')),
  avatar_url TEXT,
  unit TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица задач
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица отчетов
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'incident', 'training', 'equipment', 'personnel')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица чатов
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'group' CHECK (type IN ('direct', 'group', 'channel')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'voice')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица событий календаря
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'meeting' CHECK (type IN ('meeting', 'training', 'operation', 'maintenance', 'other')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Настройка Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для пользователей
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Политики безопасности для задач
CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update tasks assigned to them or created by them" ON tasks FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

-- Политики безопасности для отчетов
CREATE POLICY "Users can view all reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own reports" ON reports FOR UPDATE USING (auth.uid() = created_by);

-- Политики безопасности для чатов
CREATE POLICY "Users can view all chats" ON chats FOR SELECT USING (true);
CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Политики безопасности для сообщений
CREATE POLICY "Users can view all messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can create messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Политики безопасности для событий
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = created_by);

-- Политики безопасности для уведомлений
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Вставка тестовых данных (опционально)
-- Примечание: В реальном проекте пароли должны быть захешированы
INSERT INTO users (id, email, password_hash, first_name, last_name, rank, role, avatar_url, unit, phone) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@military.gov', '$2b$10$example.hash.for.demo.purposes.only', 'Иван', 'Зингиев', 'Полковник', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', '1-й батальон', '+7-900-123-4567'),
  ('550e8400-e29b-41d4-a716-446655440002', 'petrov@military.gov', '$2b$10$example.hash.for.demo.purposes.only', 'Алексей', 'Петров', 'Майор', 'officer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '1-я рота', '+7-900-234-5678'),
  ('550e8400-e29b-41d4-a716-446655440003', 'sidorov@military.gov', '$2b$10$example.hash.for.demo.purposes.only', 'Михаил', 'Сидоров', 'Капитан', 'officer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '2-я рота', '+7-900-345-6789'),
  ('550e8400-e29b-41d4-a716-446655440004', 'kozlov@military.gov', '$2b$10$example.hash.for.demo.purposes.only', 'Сергей', 'Козлов', 'Сержант', 'soldier', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face', '1-я рота', '+7-900-456-7890')
ON CONFLICT (id) DO NOTHING;

-- Создание storage buckets для файлов
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view chat files" ON storage.objects FOR SELECT USING (bucket_id = 'chat-files');
CREATE POLICY "Users can upload chat files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-files');