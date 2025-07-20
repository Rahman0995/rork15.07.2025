#!/bin/bash

# Делаем все скрипты исполняемыми
chmod +x *.sh

echo "🔧 Исправляем проблему с файловыми наблюдателями и запускаем приложение..."

# Пробуем увеличить лимит без sudo (может сработать в некоторых системах)
echo 524288 > /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo "⚠️  Не удалось изменить лимит без sudo"

# Очищаем кэш
echo "🧹 Очищаем кэш..."
rm -rf node_modules/.cache .expo dist 2>/dev/null || true

# Устанавливаем переменные окружения
export WATCHMAN_DISABLE_RECRAWL=true
export EXPO_NO_DOTENV=1
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🚀 Запускаем приложение..."
npx expo start --tunnel --port 8081 --clear