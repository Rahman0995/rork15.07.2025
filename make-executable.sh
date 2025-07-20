#!/bin/bash

echo "🔧 Делаем скрипты исполняемыми..."

chmod +x fix-file-watchers.sh
chmod +x start-app-simple.sh
chmod +x make-executable.sh

echo "✅ Все скрипты теперь исполняемые!"
echo ""
echo "📋 Доступные команды:"
echo "  ./fix-file-watchers.sh  - Исправить проблему с файловыми наблюдателями"
echo "  ./start-app-simple.sh   - Запустить приложение"
echo ""
echo "🚀 Для запуска приложения выполните:"
echo "  ./start-app-simple.sh"