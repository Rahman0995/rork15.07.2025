#!/bin/bash

# Увеличиваем лимит файловых наблюдателей
echo "Увеличиваем лимит файловых наблюдателей..."

# Временное увеличение (до перезагрузки)
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl fs.inotify.max_user_instances=512

# Постоянное увеличение
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
echo "fs.inotify.max_user_instances=512" | sudo tee -a /etc/sysctl.conf

echo "Лимит файловых наблюдателей увеличен!"
echo "Текущие значения:"
cat /proc/sys/fs/inotify/max_user_watches
cat /proc/sys/fs/inotify/max_user_instances