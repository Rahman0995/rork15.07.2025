#!/bin/bash

echo "🔧 Исправляем лимиты файловых наблюдателей..."

# Увеличиваем лимит файловых наблюдателей временно
echo "Устанавливаем fs.inotify.max_user_watches в 524288"
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches

# Делаем изменение постоянным
echo "Делаем изменение постоянным..."
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf

# Очищаем кеш Metro
echo "Очищаем кеш Metro..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*

echo "✅ Лимиты файловых наблюдателей увеличены!"
echo "Текущий лимит: $(cat /proc/sys/fs/inotify/max_user_watches)"