# Настройка Supabase для военного приложения

## Шаг 1: Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub или создайте аккаунт
4. Нажмите "New project"
5. Выберите организацию и введите данные проекта:
   - **Name**: military-unit-app (или любое другое название)
   - **Database Password**: создайте надежный пароль
   - **Region**: выберите ближайший регион
6. Нажмите "Create new project"

## Шаг 2: Получение ключей API

1. В панели управления проекта перейдите в **Settings** → **API**
2. Скопируйте следующие значения:
   - **Project URL** (например: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** ключ (начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Шаг 3: Настройка переменных окружения

1. Откройте файл `.env` в корне проекта
2. Замените значения Supabase:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Замените:**
- `your-project-ref` на ваш Project URL
- `your-anon-key-here` на ваш anon public ключ

## Шаг 4: Создание таблиц в базе данных

1. В панели управления Supabase перейдите в **SQL Editor**
2. Нажмите "New query"
3. Скопируйте содержимое файла `supabase-schema.sql` и вставьте в редактор
4. Нажмите "Run" для выполнения скрипта

Этот скрипт создаст:
- Таблицы: users, tasks, reports, chats, messages, events, notifications
- Индексы для оптимизации
- Триггеры для автоматического обновления timestamps
- Политики Row Level Security (RLS)
- Тестовые данные

## Шаг 5: Настройка аутентификации

1. Перейдите в **Authentication** → **Settings**
2. В разделе **Site URL** добавьте:
   - `http://localhost:19006` (для веб-разработки)
   - `exp://localhost:19000` (для Expo Go)
   - Ваш production URL (когда будете деплоить)

3. В разделе **Auth Providers** включите нужные провайдеры:
   - **Email** (уже включен по умолчанию)
   - **Google**, **GitHub** и др. (по желанию)

## Шаг 6: Настройка Storage (для файлов)

1. Перейдите в **Storage**
2. Создайте buckets (корзины) для файлов:
   - `avatars` (публичный) - для аватаров пользователей
   - `documents` (приватный) - для документов
   - `chat-files` (приватный) - для файлов в чатах

## Шаг 7: Тестирование подключения

1. Запустите приложение: `npm run start`
2. Перейдите в **Настройки** → **Тест Supabase**
3. Проверьте подключение и попробуйте:
   - Тест подключения к базе данных
   - Регистрацию нового пользователя
   - Вход в систему
   - Создание тестовых данных

## Шаг 8: Настройка Real-time (опционально)

1. В панели Supabase перейдите в **Database** → **Replication**
2. Включите реплицию для таблиц, где нужны real-time обновления:
   - `messages` (для чатов)
   - `notifications` (для уведомлений)
   - `tasks` (для задач)

## Возможные проблемы и решения

### Ошибка подключения
- Проверьте правильность URL и ключа API
- Убедитесь, что переменные окружения правильно настроены
- Перезапустите приложение после изменения .env

### Ошибки аутентификации
- Проверьте настройки Site URL в Supabase
- Убедитесь, что RLS политики настроены правильно
- Проверьте, что пользователь подтвердил email (если включено)

### Ошибки доступа к данным
- Проверьте RLS политики в таблицах
- Убедитесь, что пользователь аутентифицирован
- Проверьте права доступа к таблицам

## Полезные команды

```bash
# Установка Supabase CLI (опционально)
npm install -g supabase

# Логин в Supabase CLI
supabase login

# Инициализация локального проекта
supabase init

# Запуск локального Supabase (для разработки)
supabase start

# Остановка локального Supabase
supabase stop
```

## Дополнительные возможности

### Миграции
Используйте Supabase CLI для управления миграциями базы данных:

```bash
# Создание новой миграции
supabase migration new add_new_table

# Применение миграций
supabase db push
```

### Типы TypeScript
Supabase может автоматически генерировать типы TypeScript:

```bash
# Генерация типов
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Мониторинг
В панели Supabase доступны:
- **Logs** - логи запросов и ошибок
- **Database** - мониторинг производительности
- **Auth** - статистика пользователей
- **Storage** - использование хранилища

## Безопасность

1. **Никогда не коммитьте** реальные ключи API в git
2. Используйте **service_role** ключ только на сервере
3. Настройте **RLS политики** для всех таблиц
4. Регулярно **ротируйте ключи** API
5. Используйте **HTTPS** в production

## Поддержка

- [Документация Supabase](https://supabase.com/docs)
- [Примеры кода](https://github.com/supabase/supabase/tree/master/examples)
- [Discord сообщество](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)