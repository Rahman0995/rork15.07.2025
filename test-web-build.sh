#!/bin/bash

echo "🔧 Тестирование сборки веб-версии..."

# Очистка предыдущих сборок
echo "🧹 Очистка предыдущих сборок..."
rm -rf dist/ build/ .expo/

# Установка зависимостей
echo "📦 Установка зависимостей..."
bun install

# Сборка веб-версии
echo "🏗️ Сборка веб-версии..."
bunx expo export --platform web --output-dir dist

# Проверка результата
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Сборка успешна! Файлы находятся в папке dist/"
    echo "📁 Содержимое dist/:"
    ls -la dist/
    
    echo ""
    echo "🌐 Для локального тестирования запустите:"
    echo "cd dist && python3 -m http.server 8080"
    echo "Затем откройте http://localhost:8080"
else
    echo "❌ Ошибка сборки! Проверьте логи выше."
    exit 1
fi