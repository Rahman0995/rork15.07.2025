#!/bin/bash

echo "🔧 Исправляем проблему с file watchers..."

# Увеличиваем лимит file watchers временно
echo "Устанавливаем fs.inotify.max_user_watches в 524288"
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches

# Увеличиваем лимит instances
echo "Устанавливаем fs.inotify.max_user_instances в 512"
echo 512 | sudo tee /proc/sys/fs/inotify/max_user_instances

# Делаем изменения постоянными
echo "Делаем изменения постоянными..."
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
echo "fs.inotify.max_user_instances=512" | sudo tee -a /etc/sysctl.conf

# Очищаем кеш Metro и node_modules
echo "Очищаем кеши..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*
rm -rf node_modules/.cache

echo "✅ File watchers исправлены!"
echo "Текущий лимит watches: $(cat /proc/sys/fs/inotify/max_user_watches)"
echo "Текущий лимит instances: $(cat /proc/sys/fs/inotify/max_user_instances)"
echo ""
echo "🔄 Теперь запустите приложение:"
echo "   npx expo start --port 8082"