#!/bin/bash

echo "🧹 Очистка кэша React Native / Expo проекта..."

# Остановить все процессы
echo "⏹️  Остановка процессов..."
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Очистка кэша Bun
echo "🗑️  Очистка кэша Bun..."
bun pm cache rm

# Удаление node_modules и lock файлов
echo "📦 Удаление node_modules..."
rm -rf node_modules
rm -f bun.lock

# Очистка кэша Expo/Metro
echo "🚀 Очистка кэша Expo..."
bunx expo install --fix
bunx expo r -c

# Переустановка зависимостей
echo "📥 Переустановка зависимостей..."
bun install

echo "✅ Кэш очищен! Теперь запустите проект:"
echo "   bun start"
echo "   или"
echo "   bunx expo start --clear"