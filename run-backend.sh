#!/bin/bash

echo "🚀 Запуск backend сервера..."

# Kill any process using port 3000
echo "🔍 Проверяем порт 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Освободили порт 3000" || echo "✅ Порт 3000 уже свободен"

# Wait a moment
sleep 1

# Start the simple backend
echo "🚀 Запускаем простой backend сервер..."
node start-backend-simple.js