#!/bin/bash

echo "🚀 ЗАПУСК ПРИЛОЖЕНИЯ - Исправление проблемы с файловыми наблюдателями"
echo "=================================================================="

# Делаем все скрипты исполняемыми
chmod +x *.sh 2>/dev/null || true

# Функция для проверки и увеличения лимита файловых наблюдателей
fix_file_watchers() {
    echo "🔧 Проверяем лимит файловых наблюдателей..."
    
    current_limit=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo "0")
    echo "📊 Текущий лимит: $current_limit"
    
    if [ "$current_limit" -lt 524288 ]; then
        echo "⚠️  Лимит слишком низкий, пытаемся увеличить..."
        
        # Пробуем с sudo
        if echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches >/dev/null 2>&1; then
            echo "✅ Лимит увеличен до 524288 с помощью sudo"
            
            # Делаем изменение постоянным
            if ! grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf 2>/dev/null; then
                echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf >/dev/null 2>&1
                echo "📝 Добавлено в /etc/sysctl.conf для постоянного применения"
            fi
            
            return 0
        else
            echo "❌ Не удалось увеличить лимит (нужны права sudo)"
            return 1
        fi
    else
        echo "✅ Лимит достаточный: $current_limit"
        return 0
    fi
}

# Функция очистки кэша
clean_cache() {
    echo "🧹 Очищаем кэш и временные файлы..."
    
    # Очищаем различные кэши
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .expo 2>/dev/null || true
    rm -rf dist 2>/dev/null || true
    rm -rf .metro 2>/dev/null || true
    rm -rf /tmp/metro-* 2>/dev/null || true
    rm -rf /tmp/haste-map-* 2>/dev/null || true
    
    echo "✅ Кэш очищен"
}

# Функция установки переменных окружения
set_env_vars() {
    echo "⚙️  Устанавливаем оптимизированны�� переменные окружения..."
    
    export WATCHMAN_DISABLE_RECRAWL=true
    export EXPO_NO_DOTENV=1
    export NODE_OPTIONS="--max-old-space-size=4096"
    export METRO_MAX_WORKERS=2
    export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
    
    echo "✅ Переменные окружения установлены"
}

# Основная функция запуска
start_app() {
    echo "🚀 Запускаем приложение..."
    echo "📱 Приложение будет доступно по адресу с туннелем"
    echo "🌐 Веб-версия будет доступна на http://localhost:8083"
    echo ""
    echo "Для остановки нажмите Ctrl+C"
    echo ""
    
    # Запускаем Expo
    npx expo start --tunnel --port 8081 --clear
}

# Главная логика
main() {
    echo "🎯 Начинаем процесс запуска..."
    
    # Очищаем кэш
    clean_cache
    
    # Устанавливаем переменные окружения
    set_env_vars
    
    # Пробуем исправить проблему с файловыми наблюдателями
    if fix_file_watchers; then
        echo "🎉 Проблема с файловыми наблюдателями решена!"
    else
        echo "⚠️  Запускаем с альтернативными настройками..."
        echo "💡 Если проблема повторится, попробуйте запустить с правами администратора:"
        echo "   sudo bash ЗАПУСК.sh"
    fi
    
    echo ""
    echo "🚀 Все готово! Запускаем приложение..."
    echo ""
    
    # Запускаем приложение
    start_app
}

# Запускаем основную функцию
main