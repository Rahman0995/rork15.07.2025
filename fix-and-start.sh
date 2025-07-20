#!/bin/bash

echo "🔧 Исправляем проблемы и запускаем приложение..."

# Очищаем кэши
echo "🧹 Очищаем кэши..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null  
rm -rf .metro 2>/dev/null
rm -rf /tmp/metro-* 2>/dev/null

# Устанавливаем переменные окружения для решения проблемы ENOSPC
export WATCHMAN_DISABLE_WATCH=1
export EXPO_NO_DOTENV=1
export EXPO_NO_CACHE=1

echo "📱 Запускаем Expo с исправлениями..."

# Запускаем expo с минимальным наблюдением файлов
npx expo start --tunnel --port 8081 --clear