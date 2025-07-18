# Настройка сервера для production

## Варианты хостинга

### 1. Railway (Рекомендуется)
1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Создайте новый проект
3. Подключите ваш GitHub репозиторий
4. Добавьте переменные окружения:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   ```
5. Обновите `.env` файл:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=https://your-project-name.railway.app
   ```

### 2. Render
1. Зарегистрируйтесь на [Render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройте переменные окружения
5. Обновите `.env` файл:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=https://your-service-name.render.com
   ```

### 3. Vercel
1. Зарегистрируйтесь на [Vercel.com](https://vercel.com)
2. Импортируйте проект из GitHub
3. Настройте переменные окружения
4. Обновите `.env` файл:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=https://your-project-name.vercel.app
   ```

### 4. Heroku
1. Зарегистрируйтесь на [Heroku.com](https://heroku.com)
2. Создайте новое приложение
3. Подключите GitHub репозиторий
4. Добавьте PostgreSQL addon
5. Настройте переменные окружения
6. Обновите `.env` файл:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=https://your-app-name.herokuapp.com
   ```

## Настройка переменных окружения

После выбора хостинга, обновите файл `.env` в корне проекта:

```env
# Замените на ваш реальный URL
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-actual-domain.com

# Для локальной разработки
LOCAL_IP=192.168.1.100  # Ваш локальный IP
```

## Проверка настройки

1. Убедитесь, что сервер запущен и доступен по указанному URL
2. Проверьте, что API отвечает на `/api/trpc` endpoint
3. Пересоберите приложение после изменения URL

## Текущие настройки

- Версия приложения: 1.0.7
- iOS Build Number: 14
- Android Version Code: 12

## Важные замечания

- Всегда используйте HTTPS для production
- Убедитесь, что CORS настроен правильно на сервере
- Проверьте, что все переменные окружения установлены
- После изменения URL нужно пересобрать приложение