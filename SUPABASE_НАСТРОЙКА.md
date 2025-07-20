# Настройка Supabase для приложения

## Шаг 1: Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project" или "Sign up"
3. Войдите через GitHub или создайте аккаунт
4. Нажмите "New project"
5. Выберите организацию (или создайте новую)
6. Заполните данные проекта:
   - **Name**: Название вашего проекта (например, "military-unit-app")
   - **Database Password**: Создайте надежный пароль
   - **Region**: Выберите ближайший регион
7. Нажмите "Create new project"

## Шаг 2: Получение ключей API

1. После создания проекта перейдите в **Settings** → **API**
2. Скопируйте следующие значения:
   - **Project URL** (например: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** ключ (длинная строка, начинающаяся с `eyJ...`)

## Шаг 3: Настройка переменных окружения

1. Откройте файл `.env` в корне проекта
2. Найдите секцию Supabase Configuration
3. Замените значения:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://ваш-проект-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ-здесь
```

## Шаг 4: Создание таблиц базы данных

1. В панели Supabase перейдите в **SQL Editor**
2. Создайте новый запрос и выполните SQL из файла `supabase-schema.sql`
3. Или создайте таблицы через **Table Editor**:

### Основные таблицы:

#### users (Пользователи)
- `id` (uuid, primary key)
- `email` (text, unique)
- `full_name` (text)
- `rank` (text)
- `unit` (text)
- `role` (text)
- `avatar_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### tasks (Задачи)
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `status` (text)
- `priority` (text)
- `assigned_to` (uuid, foreign key → users.id)
- `created_by` (uuid, foreign key → users.id)
- `due_date` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### reports (Отчеты)
- `id` (uuid, primary key)
- `title` (text)
- `content` (text)
- `status` (text)
- `type` (text)
- `created_by` (uuid, foreign key → users.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Шаг 5: Настройка аутентификации

1. Перейдите в **Authentication** → **Settings**
2. В разделе **Site URL** добавьте:
   - `http://localhost:8081` (для разработки)
   - Ваш production URL (если есть)
3. В разделе **Auth Providers** настройте нужные провайдеры

## Шаг 6: Настройка Row Level Security (RLS)

1. Перейдите в **Authentication** → **Policies**
2. Включите RLS для всех таблиц
3. Создайте политики доступа для каждой таблицы

Пример политики для таблицы `users`:
```sql
-- Пользователи могут читать свои данные
CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять свои данные
CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth.uid() = id);
```

## Шаг 7: Тестирование подключения

1. Перезапустите приложение
2. Перейдите в **Настройки** → **Тест Supabase**
3. Проверьте статус подключения
4. Если все настроено правильно, вы увидите "✅ Supabase работает"

## Возможные проблемы и решения

### Ошибка "supabaseUrl is required"
- Проверьте, что переменные окружения правильно настроены
- Перезапустите приложение после изменения .env файла

### Ошибка подключения
- Проверьте правильность URL и ключа API
- Убедитесь, что проект Supabase активен
- Проверьте интернет-соединение

### Ошибки аутентификации
- Проверьте настройки Site URL в Supabase
- Убедитесь, что RLS настроен правильно
- Проверьте политики доступа

## Полезные ссылки

- [Документация Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## Поддержка

Если у вас возникли проблемы с настройкой Supabase, проверьте:
1. Логи в консоли разработчика
2. Статус проекта в панели Supabase
3. Настройки переменных окружения
4. Тест подключения в приложении