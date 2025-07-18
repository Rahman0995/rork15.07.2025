#!/bin/bash

echo "🚀 Запуск приложения для мобильного устройства..."

# Найти и установить правильный IP
echo "🔍 Поиск локального IP адреса..."
node fix-mobile-connection.js

# Запустить backend
echo "🔧 Запуск backend сервера..."
npm run backend:dev &
BACKEND_PID=$!

# Подождать немного для запуска backend
sleep 3

# Запустить frontend с туннелем
echo "📱 Запуск frontend с туннелем..."
npm run start

# Убить backend процесс при завершении
trap "kill $BACKEND_PID" EXIT