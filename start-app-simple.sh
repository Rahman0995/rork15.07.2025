#!/bin/bash

echo "🚀 Запуск приложения..."

# Проверяем лимит файловых наблюдателей
CURRENT_LIMIT=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo "8192")
echo "📊 Текущий лимит файловых наблюдателей: $CURRENT_LIMIT"

if [ "$CURRENT_LIMIT" -lt 524288 ]; then
    echo "⚠️  Лимит слишком мал, увеличиваем..."
    echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches
    echo "✅ Лимит увеличен до 524288"
fi

# Убиваем старые процессы
echo "🛑 Останавливаем старые процессы..."
pkill -f metro 2>/dev/null || true
pkill -f expo 2>/dev/null || true
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "node.*8082" 2>/dev/null || true
pkill -f "node.*8083" 2>/dev/null || true

# Ждем немного
sleep 2

# Очищаем кэш
echo "🧹 Очищаем кэш..."
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true

# Запускаем приложение
echo "🚀 Запускаем Expo на порту 8083..."
npx expo start --clear --port 8083 --web