# 🚀 Railway Deployment Guide

## Быстрый старт

### 1. Установка Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Авторизация и связывание проекта
```bash
railway login
railway link
```

### 3. Проверка готовности к деплою
```bash
node test-railway-deploy.js
```

### 4. Деплой
```bash
node deploy-railway-fixed.js
```

## Альтернативный способ

### Ручной деплой
```bash
railway up --detach
```

### Проверка статуса
```bash
railway status
railway logs
```

## Решение проблем

### Проблема с bun install
- Используем Node.js вместо Bun в Dockerfile.railway
- Удаляем проблемные зависимости (sqlite3, better-sqlite3)

### Проблема с native dependencies
- Dockerfile.railway автоматически исключает native зависимости
- Используется только web-версия приложения

### Проблема с MySQL
- Railway предоставляет MySQL базу данных
- Настройки в .env.production

## Файлы для Railway

1. **Dockerfile.railway** - Оптимизированный Dockerfile
2. **railway.json** - Конфигурация Railway
3. **nginx.conf** - Конфигурация веб-сервера
4. **deploy-railway-fixed.js** - Скрипт деплоя

## Переменные окружения

Добавьте в Railway dashboard:
```
NODE_ENV=production
EXPO_USE_FAST_RESOLVER=1
DATABASE_URL=mysql://...
```

## Мониторинг

- **Логи**: `railway logs`
- **Статус**: `railway status`
- **Dashboard**: https://railway.app/dashboard

## Поддержка

Если возникают проблемы:
1. Проверьте логи: `railway logs`
2. Запустите тест: `node test-railway-deploy.js`
3. Проверьте Railway dashboard