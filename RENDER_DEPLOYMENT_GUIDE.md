# 🚀 Руководство по деплою на Render

## Исправленные проблемы

### ❌ Проблема
Render пытался запустить `node expo-router/entry`, но этот файл не существует.

### ✅ Решение
1. **Обновлен render.yaml** - добавлена правильная команда запуска для nginx
2. **Создан новый Dockerfile.web.render** - оптимизирован для Render
3. **Настроены переменные окружения** - правильная передача API URL

## Файлы конфигурации

### render.yaml
- Использует `Dockerfile.web.render`
- Добавлена команда `dockerCommand: nginx -g "daemon off;"`
- Настроены переменные окружения для связи фронтенда и бэкенда

### Dockerfile.web.render
- Двухэтапная сборка (builder + nginx)
- Правильная сборка Expo веб-версии
- Оптимизированная конфигурация nginx

## Шаги для деплоя

1. **Коммит изменений в Git**
   ```bash
   git add .
   git commit -m "Fix Render deployment configuration"
   git push
   ```

2. **Render автоматически пересоберет приложение**
   - Веб-версия будет доступна на nginx (порт 80)
   - Бэкенд будет работать на Node.js (порт 3000)

3. **Проверка деплоя**
   - Фронтенд: `https://your-app-web.render.com`
   - Бэкенд API: `https://your-app-backend.render.com/api`

## Локальное тестирование

Перед деплоем можно протестировать сборку локально:

```bash
# Сделать скрипт исполняемым
chmod +x test-web-build.sh

# Запустить тест сборки
./test-web-build.sh
```

## Структура деплоя

```
Render Services:
├── military-app-web (Frontend)
│   ├── Dockerfile: Dockerfile.web.render
│   ├── Port: 80 (nginx)
│   └── Static files from Expo export
└── military-app-backend (Backend)
    ├── Dockerfile: Dockerfile.backend
    ├── Port: 3000 (Node.js)
    └── tRPC API endpoints
```

## Переменные окружения

### Frontend (military-app-web)
- `NODE_ENV=production`
- `EXPO_PUBLIC_API_URL` - автоматически из backend service
- `EXPO_PUBLIC_BASE_URL` - автоматически из backend service

### Backend (military-app-backend)
- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL` - автоматически из PostgreSQL database
- `JWT_SECRET` - автоматически генерируется
- `CORS_ORIGIN=*` (можно ограничить для безопасности)

## Мониторинг

После деплоя проверьте:
1. ✅ Фронтенд загружается без ошибок
2. ✅ API запросы проходят успешно
3. ✅ База данных подключена
4. ✅ Логи не содержат критических ошибок

## Следующие шаги

После успешного деплоя:
1. 🔒 Настроить HTTPS сертификаты
2. 🛡️ Ограничить CORS_ORIGIN до конкретного домена
3. 📊 Настроить мониторинг и логирование
4. 🔄 Настроить автоматические бэкапы БД