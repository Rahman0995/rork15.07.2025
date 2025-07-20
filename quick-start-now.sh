#!/bin/bash

echo "🚀 Быстрый запуск приложения..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь, что вы в корневой директории проекта."
    exit 1
fi

# Увеличиваем лимит файловых наблюдателей
echo "🔧 Увеличиваем лимит файловых наблюдателей..."
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Запускаем приложение
echo "🔧 Запуск приложения..."
node start-full-app-now.js