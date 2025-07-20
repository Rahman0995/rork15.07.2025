# 🚀 Полное руководство по настройке Supabase

## ✅ Что уже готово:

1. **Supabase клиент настроен** - `lib/supabase.ts`
2. **TypeScript типы** - `types/supabase.ts`
3. **SQL схема** - `supabase-schema.sql`
4. **tRPC интеграция** - обновлены роуты для работы с Supabase
5. **Аутентификация** - `store/supabaseAuthStore.ts`
6. **Тестирование** - компонент для проверки подключения

## 🔧 Что нужно сделать:

### 1. Создать проект в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в аккаунт или зарегистрируйтесь
3. Нажмите "New Project"
4. Выберите организацию и введите:
   - **Name**: `military-unit-app`
   - **Database Password**: создайте надежный пароль
   - **Region**: выберите ближайший регион
5. Нажмите "Create new project"

### 2. Настроить базу данных

1. Дождитесь создания проекта (2-3 минуты)
2. Перейдите в **SQL Editor**
3. Скопируйте содержимое файла `supabase-schema.sql`
4. Вставьте в SQL Editor и нажмите **Run**

### 3. Получить ключи API

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public** ключ

### 4. Обновить переменные окружения

Обновите файл `.env`:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://ваш-проект-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
```

### 5. Настроить Row Level Security (RLS)

RLS уже настроен в SQL схеме, но проверьте в **Authentication** → **Policies**:

- ✅ Пользователи могут видеть всех пользователей
- ✅ Пользователи могут обновлять свой профиль
- ✅ Пользователи могут создавать задачи и отчеты
- ✅ Пользователи могут видеть свои уведомления

### 6. Настроить Storage (опционально)

Для загрузки файлов:

1. Перейдите в **Storage**
2. Создайте buckets:
   - `avatars` (public)
   - `documents` (private)
   - `chat-files` (private)

### 7. Протестировать подключение

1. Запустите приложение
2. Перейдите в **Настройки** → **Тест Supabase**
3. Проверьте все тесты

## 🔍 Проверка работы

### Тест подключения:
```bash
# Запустите приложение
npm start

# Перейдите в настройки → Тест Supabase
# Все тесты должны пройти успешно
```

### Тест аутентификации:
1. Попробуйте зарегистрировать нового пользователя
2. Войдите в систему
3. Проверьте создание задач и отчетов

## 🚨 Возможные проблемы:

### 1. "Supabase не настроен"
- Проверьте переменные окружения в `.env`
- Убедитесь, что URL и ключ правильные
- Перезапустите приложение

### 2. "Row Level Security" ошибки
- Убедитесь, что выполнили SQL схему полностью
- Проверьте политики в Supabase Dashboard

### 3. "Invalid JWT" ошибки
- Проверьте, что используете правильный anon ключ
- Убедитесь, что пользователь авторизован

### 4. Проблемы с типами
- Обновите типы в `types/supabase.ts` если изменили схему
- Используйте Supabase CLI для генерации типов:
```bash
npx supabase gen types typescript --project-id ваш-проект-id > types/supabase.ts
```

## 📱 Использование в приложении

### Аутентификация:
```typescript
import { useSupabaseAuth } from '@/store/supabaseAuthStore';

const { user, signIn, signUp, signOut, loading } = useSupabaseAuth();
```

### Работа с данными:
```typescript
import { database } from '@/lib/supabase';

// Получить задачи
const { data: tasks, error } = await database.tasks.getAll();

// Создать отчет
const { data: report, error } = await database.reports.create({
  title: 'Новый отчет',
  content: 'Содержание отчета',
  created_by: user.id,
});
```

### Real-time подписки:
```typescript
import { realtime } from '@/lib/supabase';

// Подписка на новые сообщения
const subscription = realtime.subscribeToMessages(chatId, (payload) => {
  console.log('Новое сообщение:', payload);
});

// Отписка
realtime.unsubscribe(subscription);
```

## 🎯 Следующие шаги:

1. ✅ Настроить Supabase проект
2. ✅ Выполнить SQL схему
3. ✅ Обновить переменные окружения
4. ✅ Протестировать подключение
5. 🔄 Интегрировать с существующими компонентами
6. 🔄 Настроить push-уведомления
7. 🔄 Добавить offline синхронизацию

## 💡 Полезные ссылки:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

После выполнения всех шагов ваше приложение будет полностью интегрировано с Supabase! 🎉