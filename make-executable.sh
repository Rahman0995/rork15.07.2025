#!/bin/bash

echo "🔧 Делаем скрипты исполняемыми..."

chmod +x fix-watchers-limit.sh
chmod +x start-app-simple.sh
chmod +x start-backend-only.sh
chmod +x make-executable.sh

echo "✅ Все скрипты теперь исполняемые!"

echo "📋 Доступные команды:"
echo "  ./fix-watchers-limit.sh     - Исправить лимит файловых наблюдателей"
echo "  ./start-app-simple.sh       - Запустить только фронтенд"
echo "  ./start-backend-only.sh     - Запустить только бэкенд"