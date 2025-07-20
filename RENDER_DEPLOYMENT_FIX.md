# 🚀 Исправление деплоя на Render

## Проблема
Render пытался запустить `node expo-router/entry`, что вызывало ошибку "Cannot find module".

## Решение

### 1. Обновленные файлы:

#### `render.yaml`
```yaml
services:
  - type: web
    name: military-app-web
    env: node
    plan: free
    region: oregon
    buildCommand: cp package.minimal.json package.json && npm install && npm install -g @expo/cli serve && rm -rf dist .expo && cp app.config.web.js app.config.js && npx expo export --platform web --output-dir dist
    startCommand: node start-web-render.js
```

#### `package.minimal.json`
- Убрали поле `main` которое вызывало проблему
- Обновили стартовый скрипт

#### `start-web-render.js`
- Новый стартовый скрипт для Render
- Правильно запускает `serve` с нужными параметрами

#### `app.config.web.js`
- Упрощенная конфигурация только для веба
- Убраны мобильные плагины

### 2. Процесс сборки:
1. Копируется минимальный `package.json`
2. Устанавливаются только веб-зависимости
3. Копируется веб-конфигурация
4. Экспортируется веб-версия в папку `dist`
5. Запускается сервер через `start-web-render.js`

### 3. Тестирование локально:
```bash
chmod +x test-web-build-local.sh
./test-web-build-local.sh
```

### 4. Переменные окружения на Render:
- `EXPO_PUBLIC_API_URL` - URL бэкенда (автоматически из сервиса)
- `EXPO_PUBLIC_BASE_URL` - Базовый URL бэкенда
- `NODE_ENV=production`

## Что исправлено:
✅ Убрано поле `main` из package.json  
✅ Создан правильный стартовый скрипт  
✅ Упрощена веб-конфигурация  
✅ Исправлена команда сборки в render.yaml  
✅ Добавлен флаг `-s` для SPA режима  

## Следующие шаги:
1. Закоммитить изменения в Git
2. Пуш в репозиторий
3. Render автоматически пересоберет проект
4. Проверить работу веб-версии