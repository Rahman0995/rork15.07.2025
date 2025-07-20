#!/bin/bash

echo "🚀 Начинаем развертывание на Render..."

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
cp package.minimal.json package.json
npm install --legacy-peer-deps

# Устанавливаем глобальные зависимости
echo "🌐 Устанавливаем глобальные зависимости..."
npm install -g @expo/cli serve

# Очищаем предыдущие сборки
echo "🧹 Очищаем предыдущие сборки..."
rm -rf dist .expo

# Копируем веб-конфигурацию
echo "⚙️ Настраиваем конфигурацию..."
cp app.config.web.js app.config.js

# Собираем веб-версию
echo "🔨 Собираем веб-версию..."
npx expo export --platform web --output-dir dist

# Проверяем результат сборки
echo "✅ Проверяем результат сборки..."
ls -la dist/

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Ошибка: папка dist пуста или не существует!"
    exit 1
fi

echo "🎉 Сборка завершена успешно!"