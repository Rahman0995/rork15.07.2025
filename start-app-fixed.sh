#!/bin/bash

# Исправляем проблему с файловыми наблюдателями и запускаем приложение
echo "🔧 Исправляем проблему с файловыми наблюдателями..."

# Увеличиваем лимит без sudo (для текущей сессии)
echo 524288 > /proc/sys/fs/inotify/max_user_watches 2>/dev/null || {
    echo "⚠️  Не удалось изменить системный лимит. Пробуем альтернативные решения..."
    
    # Очищаем кэш и временные файлы
    echo "🧹 Очищаем кэши..."
    rm -rf node_modules/.cache
    rm -rf .expo
    rm -rf .metro
    
    # Уменьшаем количество наблюдаемых файлов
    export WATCHMAN_DISABLE_WATCH=1
    export EXPO_NO_DOTENV=1
}

echo "🚀 Запускаем приложение..."

# Запускаем с ограниченным наблюдением файлов
WATCHMAN_DISABLE_WATCH=1 npx expo start --tunnel --port 8081