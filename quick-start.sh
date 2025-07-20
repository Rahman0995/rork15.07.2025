#!/bin/bash

echo "🚀 Быстрый запуск приложения..."

# Остановить процессы на портах
echo "🔄 Освобождаем порты..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Подождать
sleep 2

# Запустить приложение
echo "📱 Запуск приложения..."
node start-app-now.js