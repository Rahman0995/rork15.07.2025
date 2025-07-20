#!/bin/bash

echo "🚀 Начинаем сборку веб-версии для Render..."

# Очистка предыдущих сборок
echo "🧹 Очистка предыдущих сборок..."
rm -rf dist/ build/ .expo/

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Установка Expo CLI если не установлен
echo "🔧 Проверка Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "📥 Установка Expo CLI..."
    npm install -g @expo/cli
fi

# Установка serve если не установлен
echo "🔧 Проверка serve..."
if ! command -v serve &> /dev/null; then
    echo "📥 Установка serve..."
    npm install -g serve
fi

# Установка переменных окружения
export NODE_ENV=production
export EXPO_USE_FAST_RESOLVER=1

# Сборка веб-версии
echo "🏗️ Сборка веб-версии..."
# Используем веб-конфигурацию
cp app.config.web.js app.config.js.backup
mv app.config.js app.config.js.original
cp app.config.web.js app.config.js

npx expo export --platform web --output-dir dist

# Восстанавливаем оригинальную конфигурацию
mv app.config.js.original app.config.js

echo "✅ Сборка завершена! Файлы находятся в папке dist/"

# Проверка результата
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Сборка успешна!"
    echo "📁 Содержимое dist/:"
    ls -la dist/
else
    echo "❌ Ошибка сборки - папка dist пуста или не существует"
    exit 1
fi