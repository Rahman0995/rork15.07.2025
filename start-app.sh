#!/bin/bash

echo "🚀 Запуск приложения с исправлением проблемы файловых наблюдателей..."

# Функция для увеличения лимита файловых наблюдателей
fix_watchers() {
    echo "🔧 Попытка увеличить лимит файловых наблюдателей..."
    
    # Проверяем текущий лимит
    current_limit=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo "неизвестно")
    echo "📊 Текущий лимит: $current_limit"
    
    # Пробуем увеличить лимит
    if echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches >/dev/null 2>&1; then
        echo "✅ Лимит увеличен до 524288"
        return 0
    else
        echo "❌ Не удалось увеличить лимит (нужны права sudo)"
        return 1
    fi
}

# Функция очистки кэша
clean_cache() {
    echo "🧹 Очищаем кэш..."
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .expo 2>/dev/null || true
    rm -rf dist 2>/dev/null || true
    echo "✅ Кэш очищен"
}

# Основная логика
main() {
    # Очищаем кэш в любом случае
    clean_cache
    
    # Пробуем исправить проблему с файловыми наблюдателями
    if fix_watchers; then
        echo "🎉 Проблема с файловыми наблюдателями исправлена!"
        echo "🚀 Запускаем приложение..."
        npx expo start --tunnel --port 8081 --clear
    else
        echo "⚠️  Запускаем с альтернативными настройками..."
        
        # Устанавливаем переменные окружения для уменьшения нагрузки
        export WATCHMAN_DISABLE_RECRAWL=true
        export EXPO_NO_DOTENV=1
        export NODE_OPTIONS="--max-old-space-size=4096"
        
        # Запускаем с минимальными настройками
        echo "🚀 Запускаем приложение с оптимизированными настройками..."
        npx expo start --tunnel --port 8081 --clear --no-dev
    fi
}

# Делаем скрипт исполняемым
chmod +x "$0"

# Запускаем основную функцию
main