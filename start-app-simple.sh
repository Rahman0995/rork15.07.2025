#!/bin/bash

echo "🚀 Запуск приложения..."

# Увеличиваем лимит файловых наблюдателей
echo "📁 Увеличиваем лимит файловых наблюдателей..."
sudo sysctl fs.inotify.max_user_watches=524288 2>/dev/null || echo "Не удалось увеличить лимит (нужны права sudo)"

# Очищаем кэш Metro
echo "🧹 Очищаем кэш..."
npx expo r -c 2>/dev/null || echo "Кэш уже очищен"

# Запускаем Expo
echo "📱 Запускаем Expo на порту 8083..."
npx expo start --port 8083 --web --tunnel

echo "✅ Приложение запущено!"
echo "🌐 Web: http://localhost:8083"
echo "📱 Mobile: Сканируйте QR код в Expo Go"