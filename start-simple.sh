#!/bin/bash

echo "🚀 Запуск приложения..."

# Очищаем кеши
echo "🧹 Очищаем кеши..."
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Устанавливаем переменные окружения для оптимизации
export WATCHMAN_DISABLE_RECRAWL=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Запускаем приложение на другом порту
echo "📱 Запускаем Expo на порту 8082..."
npx expo start --port 8082 --clear