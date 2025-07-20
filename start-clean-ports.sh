#!/bin/bash

echo "🔧 Освобождение портов и запуск приложения..."

# Убиваем процессы на портах 3000 и 8081
echo "🔪 Освобождение порта 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Порт 3000 свободен"

echo "🔪 Освобождение порта 8081..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "Порт 8081 свободен"

echo "⏳ Ждем 2 секунды..."
sleep 2

echo "🚀 Запуск backend на порту 3000..."
node backend/index.ts &
BACKEND_PID=$!

echo "⏳ Ждем запуска backend (5 секунд)..."
sleep 5

echo "📱 Запуск frontend на порту 8082..."
npx expo start --port 8082 --clear &
FRONTEND_PID=$!

echo "🎉 Приложение запущено!"
echo "📡 Backend: http://localhost:3000"
echo "📱 Frontend: http://localhost:8082"
echo "🛑 Нажмите Ctrl+C для остановки"

# Обработка завершения
trap 'echo "🛑 Остановка приложения..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Ждем завершения
wait