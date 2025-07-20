#!/bin/bash

echo "🚀 Простой запуск приложения..."

# Очищаем кэш
echo "🧹 Очищаем кэш..."
rm -rf node_modules/.cache .expo dist 2>/dev/null || true

# Устанавливаем переменные окружения для оптимизации
export WATCHMAN_DISABLE_RECRAWL=true
export EXPO_NO_DOTENV=1
export NODE_OPTIONS="--max-old-space-size=4096"

# Запускаем приложение
echo "🚀 Запускаем Expo..."
npx expo start --tunnel --port 8081 --clear