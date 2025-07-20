#!/bin/bash

echo "🚀 Запуск полного приложения (frontend + backend)..."

# Делаем скрипты исполняемыми
chmod +x start-app.sh
chmod +x start-backend.sh

# Функция для увеличения лимита файловых наблюдателей
fix_watchers() {
    echo "🔧 Исправляем проблему с файловыми наблюдателями..."
    
    # Пробуем увеличить лимит
    if echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches >/dev/null 2>&1; then
        echo "✅ Лимит файловых наблюдателей увеличен"
        return 0
    else
        echo "❌ Не удалось увеличить лимит (попробуйте запустить с sudo)"
        return 1
    fi
}

# Очистка кэша
clean_cache() {
    echo "🧹 Очищаем кэш..."
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .expo 2>/dev/null || true
    rm -rf dist 2>/dev/null || true
    echo "✅ Кэш очищен"
}

# Основная функция
main() {
    # Очищаем кэш
    clean_cache
    
    # Исправляем проблему с файловыми наблюдателями
    fix_watchers
    
    echo "🚀 Запускаем приложение..."
    echo "📱 Frontend будет доступен на порту 8081"
    echo "🔧 Backend будет доступен на порту 3000"
    echo ""
    echo "Для остановки нажмите Ctrl+C"
    echo ""
    
    # Запускаем frontend
    npx expo start --tunnel --port 8081 --clear
}

# Запускаем
main