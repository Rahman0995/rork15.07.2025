#!/bin/bash

echo "🚀 Запуск приложения с очисткой портов..."

# Убиваем процессы на портах 3000, 3001, 8081, 8082
echo "🔧 Освобождаем порты..."
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "expo.*start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:8082 | xargs kill -9 2>/dev/null || true

echo "✅ Порты освобождены"
sleep 2

# Запускаем приложение
node start-clean.js