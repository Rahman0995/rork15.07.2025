#!/bin/bash

echo "🚀 Запускаем приложение..."

# Проверяем и исправляем лимиты файловых наблюдателей
echo "Проверяем лимиты файловых наблюдателей..."
current_limit=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo "0")
if [ "$current_limit" -lt "524288" ]; then
    echo "Увеличиваем лимит файловых наблюдателей..."
    echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches > /dev/null
fi

# Очищаем кеш
echo "Очищаем кеш..."
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Устанавливаем переменные окружения для оптимизации
export WATCHMAN_DISABLE_RECRAWL=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Запускаем Expo
echo "Запускаем Expo на порту 8083..."
npx expo start --port 8083 --clear