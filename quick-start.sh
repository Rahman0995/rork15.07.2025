#!/bin/bash

echo "🚀 Быстрый запуск приложения..."

# Проверяем наличие node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js для продолжения."
    exit 1
fi

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден. Установите npm для продолжения."
    exit 1
fi

echo "✅ Node.js и npm найдены"

# Проверяем установку зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

echo "🎯 Запускаем приложение..."
echo "📱 После запуска откройте Expo Go на телефоне и отсканируйте QR код"
echo "🌐 Или нажмите 'w' для веб версии"
echo "🛑 Нажмите Ctrl+C для остановки"
echo ""

# Запускаем frontend
node start-frontend-only.js