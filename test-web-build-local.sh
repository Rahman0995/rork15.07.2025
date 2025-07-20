#!/bin/bash

echo "🧪 Тестируем сборку веб-версии локально..."

# Создаем временную папку для тестирования
mkdir -p test-build
cd test-build

# Копируем необходимые файлы
cp ../package.minimal.json package.json
cp ../app.config.web.js app.config.js
cp -r ../app ./
cp -r ../assets ./
cp -r ../components ./
cp -r ../constants ./
cp -r ../lib ./
cp -r ../types ./
cp -r ../utils ./
cp -r ../store ./

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Устанавливаем Expo CLI
echo "🔧 Устанавливаем Expo CLI..."
npm install -g @expo/cli

# Очищаем и собираем
echo "🏗️ Собираем веб-версию..."
rm -rf dist .expo
npx expo export --platform web --output-dir dist

# Проверяем результат
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Тестовая сборка успешна!"
    echo "📁 Содержимое dist/:"
    ls -la dist/
    
    # Запускаем тестовый сервер
    echo "🚀 Запускаем тестовый сервер на порту 8080..."
    npx serve dist -p 8080 -s &
    SERVER_PID=$!
    
    echo "🌐 Сервер запущен! Откройте http://localhost:8080"
    echo "⏹️  Нажмите Ctrl+C для остановки"
    
    # Ждем сигнала завершения
    trap "kill $SERVER_PID; exit" INT TERM
    wait $SERVER_PID
else
    echo "❌ Ошибка тестовой сборки"
    exit 1
fi

# Очищаем
cd ..
rm -rf test-build