#!/bin/bash

echo "🔧 Быстрое исправление проблемы с файловыми наблюдателями..."

# Делаем скрипты исполняемыми
chmod +x fix-file-watchers.sh
chmod +x start-without-sudo.sh

# Пробуем увеличить лимит с sudo
echo "🚀 Попытка 1: Увеличение лимита файловых наблюдателей..."
if sudo echo 524288 > /proc/sys/fs/inotify/max_user_watches 2>/dev/null; then
    echo "✅ Лимит увеличен успешно!"
    
    # Очищаем кэш
    echo "🧹 Очищаем кэш..."
    rm -rf node_modules/.cache .expo dist 2>/dev/null || true
    
    # Запускаем приложение
    echo "🚀 Запускаем приложение..."
    npx expo start --tunnel --port 8081 --clear
else
    echo "❌ Не удалось увеличить лимит с sudo"
    echo "🔄 Попытка 2: Запуск с оптимизированными настройками..."
    
    # Очищаем кэш
    rm -rf node_modules/.cache .expo dist 2>/dev/null || true
    
    # Устанавливаем переменные окружения
    export WATCHMAN_DISABLE_RECRAWL=true
    export EXPO_NO_DOTENV=1
    
    # Запускаем с минимальными настройками
    npx expo start --tunnel --port 8081 --clear --no-dev
fi