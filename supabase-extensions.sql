-- Дополнительные таблицы для расширенной функциональности

-- Таблица для push-токенов
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Таблица для аналитики
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  properties JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для настроек пользователей
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'en')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  push_notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для участников чатов
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Таблица для вложений в сообщениях
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для комментариев к отчетам
CREATE TABLE IF NOT EXISTS report_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для истории изменений отчетов
CREATE TABLE IF NOT EXISTS report_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для участников событий
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'maybe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Таблица для тегов
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#007AFF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для связи задач с тегами
CREATE TABLE IF NOT EXISTS task_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(task_id, tag_id)
);

-- Таблица для связи отчетов с тегами
CREATE TABLE IF NOT EXISTS report_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(report_id, tag_id)
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_revisions_report_id ON report_revisions(report_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_report_tags_report_id ON report_tags(report_id);
CREATE INDEX IF NOT EXISTS idx_report_tags_tag_id ON report_tags(tag_id);

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_user_push_tokens_updated_at BEFORE UPDATE ON user_push_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_comments_updated_at BEFORE UPDATE ON report_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_participants_updated_at BEFORE UPDATE ON event_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Настройка RLS для новых таблиц
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_tags ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can manage their own push tokens" ON user_push_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view analytics events" ON analytics_events FOR SELECT USING (true);
CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view chat participants" ON chat_participants FOR SELECT USING (true);
CREATE POLICY "Users can view message attachments" ON message_attachments FOR SELECT USING (true);
CREATE POLICY "Users can view all report comments" ON report_comments FOR SELECT USING (true);
CREATE POLICY "Users can create report comments" ON report_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view report revisions" ON report_revisions FOR SELECT USING (true);
CREATE POLICY "Users can view event participants" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can manage their own event participation" ON event_participants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Users can view task tags" ON task_tags FOR SELECT USING (true);
CREATE POLICY "Users can view report tags" ON report_tags FOR SELECT USING (true);

-- Функции для аналитики
CREATE OR REPLACE FUNCTION get_popular_screens(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE(screen_name TEXT, view_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (properties->>'screen_name')::TEXT as screen_name,
    COUNT(*) as view_count
  FROM analytics_events 
  WHERE event_name = 'screen_view' 
    AND timestamp >= start_date 
    AND timestamp <= end_date
    AND properties->>'screen_name' IS NOT NULL
  GROUP BY properties->>'screen_name'
  ORDER BY view_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_activity(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE(date DATE, active_users BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    timestamp::DATE as date,
    COUNT(DISTINCT user_id) as active_users
  FROM analytics_events 
  WHERE timestamp >= start_date 
    AND timestamp <= end_date
    AND user_id IS NOT NULL
  GROUP BY timestamp::DATE
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Вставка базовых тегов
INSERT INTO tags (name, color) VALUES
  ('Срочно', '#FF3B30'),
  ('Важно', '#FF9500'),
  ('Обучение', '#007AFF'),
  ('Техника', '#34C759'),
  ('Персонал', '#AF52DE'),
  ('Безопасность', '#FF2D92'),
  ('Документы', '#5AC8FA'),
  ('Планирование', '#FFCC00')
ON CONFLICT (name) DO NOTHING;

-- Создание настроек по умолчанию для существующих пользователей
INSERT INTO user_settings (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_settings WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;