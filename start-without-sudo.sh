#!/bin/bash

# Запуск без sudo - альтернативное решение
echo "🔧 Попытка запуска без увеличения лимита файловых наблюдателей..."

# Очищаем кэш
echo "🧹 Очищаем кэш..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Устанавливаем переменные окружения для уменьшения нагрузки на файловые наблюдатели
export WATCHMAN_DISABLE_RECRAWL=true
export EXPO_NO_DOTENV=1

# Запускаем с ограниченным количеством наблюдателей
echo "🚀 Запускаем приложение с оптимизированными настройками..."
npx expo start --tunnel --port 8081 --clear --no-dev --minify