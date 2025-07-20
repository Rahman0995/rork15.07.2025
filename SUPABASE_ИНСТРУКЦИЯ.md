# 🚀 Быстрая настройка Supabase

## Что такое Supabase?
Supabase - это открытая альтернатива Firebase. Предоставляет:
- ✅ PostgreSQL база данных
- ✅ Аутентификация пользователей  
- ✅ Real-time подписки
- ✅ Хранилище файлов
- ✅ API автоматически

## 📋 Быстрый старт

### 1. Создайте проект
1. Идите на [supabase.com](https://supabase.com)
2. Нажмите **"Start your project"**
3. Войдите через GitHub
4. **"New project"** → введите название и пароль
5. Выберите регион (Europe West для России)

### 2. Получите ключи
В панели проекта → **Settings** → **API**:
- Скопируйте **Project URL**
- Скопируйте **anon public** ключ

### 3. Настройте .env файл
```env
EXPO_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ваш-ключ-здесь
```

### 4. Создайте таблицы
1. В Supabase → **SQL Editor**
2. Скопируйте код из файла `supabase-schema.sql`
3. Вставьте и нажмите **"Run"**

### 5. Настройте аутентификацию
**Authentication** → **Settings** → **Site URL**:
```
http://localhost:19006
exp://localhost:19000
```

## 🧪 Тестирование

1. Запустите приложение: `npm run start`
2. Перейдите: **Профиль** → **Тест Supabase**
3. Проверьте подключение
4. Попробуйте регистрацию/вход

## ⚡ Что уже готово

✅ **Установлен** Supabase клиент  
✅ **Настроены** типы TypeScript  
✅ **Созданы** хуки для работы с данными  
✅ **Добавлен** провайдер аутентификации  
✅ **Готов** SQL скрипт для таблиц  
✅ **Создан** компонент для тестирования  

## 📊 Структура данных

Созданы таблицы:
- **users** - пользователи
- **tasks** - задачи  
- **reports** - отчеты
- **chats** - чаты
- **messages** - сообщения
- **events** - события календаря
- **notifications** - уведомления

## 🔧 Использование в коде

```typescript
// Аутентификация
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
const { user, signIn, signOut } = useSupabaseAuth();

// Данные
import { useUsers, useCreateUser } from '@/lib/supabaseHooks';
const { data: users } = useUsers();
const createUser = useCreateUser();

// Прямые запросы
import { database } from '@/lib/supabase';
const { data } = await database.users.getAll();
```

## 🔒 Безопасность

- ✅ Row Level Security (RLS) включен
- ✅ Политики доступа настроены
- ✅ Только аутентифицированные пользователи
- ✅ Пользователи видят только свои данные

## 🆘 Проблемы?

**Ошибка подключения:**
- Проверьте URL и ключ в .env
- Перезапустите приложение

**Ошибка аутентификации:**
- Проверьте Site URL в настройках
- Подтвердите email (если включено)

**Нет доступа к данным:**
- Проверьте RLS политики
- Убедитесь что пользователь вошел

## 📚 Полезные ссылки

- [Документация Supabase](https://supabase.com/docs)
- [Примеры React Native](https://github.com/supabase/supabase/tree/master/examples/react-native)
- [Discord сообщество](https://discord.supabase.com)

---

**Готово! 🎉** Теперь у вас есть полноценная база данных с аутентификацией!