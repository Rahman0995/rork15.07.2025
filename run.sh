#!/bin/bash

echo "🔧 Исправляем проблему с файловыми наблюдателями..."

# Очищаем кэши
echo "🧹 Очищаем кэши..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf .metro 2>/dev/null

echo "🚀 Запускаем приложение..."

# Запускаем с отключенным watchman
WATCHMAN_DISABLE_WATCH=1 EXPO_NO_DOTENV=1 npx expo start --tunnel --port 8081