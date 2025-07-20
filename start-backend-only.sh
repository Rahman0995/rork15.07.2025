#!/bin/bash

echo "🔧 Запуск только бэкенда..."

# Переходим в папку backend
cd backend

# Проверяем наличие bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun не найден. Устанавливаем..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
bun install

# Запускаем бэкенд
echo "🚀 Запускаем бэкенд на порту 3000..."
bun run dev

echo "✅ Бэкенд запущен на http://localhost:3000"