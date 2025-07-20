#!/bin/bash

echo "🚀 Запуск приложения Military Management System"
echo "=============================================="

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js для продолжения."
    exit 1
fi

echo "✅ Node.js найден: $(node --version)"

# Остановка процессов на портах
echo "🔄 Освобождение портов 3000 и 8081..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Подождать
sleep 2

# Запуск приложения
echo "📱 Запуск приложения..."
echo "📡 Backend будет запущен на порту 3000"
echo "📱 Frontend будет запущен на порту 8081"
echo ""
echo "После запуска:"
echo "🌐 Веб версия: нажмите 'w' в терминале Expo"
echo "📱 Мобильная версия: отсканируйте QR код в Expo Go"
echo "🛑 Остановка: нажмите Ctrl+C"
echo ""

# Запустить приложение
node start-app-now.js