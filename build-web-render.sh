#!/bin/bash

echo "🚀 Начинаем сборку веб-версии для Render..."

# Копируем минимальный package.json
echo "📦 Копируем минимальный package.json..."
cp package.minimal.json package.json

# Устанавливаем зависимости
echo "📥 Устанавливаем зависимости..."
npm install

# Устанавливаем Expo CLI глобально
echo "🔧 Устанавливаем Expo CLI..."
npm install -g @expo/cli

# Очищаем предыдущие сборки
echo "🧹 Очищаем предыдущие сборки..."
rm -rf dist .expo

# Экспортируем веб-версию
echo "🏗️ Экспортируем веб-версию..."
npx expo export --platform web --output-dir dist

echo "✅ Сборка завершена! Файлы находятся в папке dist/"