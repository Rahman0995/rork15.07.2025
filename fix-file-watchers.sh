#!/bin/bash

# Увеличиваем лимит файловых наблюдателей
echo "Увеличиваем лимит файловых наблюдателей..."

# Проверяем текущий лимит
echo "Текущий лимит: $(cat /proc/sys/fs/inotify/max_user_watches)"

# Устанавливаем новый лимит
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches

# Делаем изменение постоянным
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf

echo "Новый лимит: $(cat /proc/sys/fs/inotify/max_user_watches)"
echo "Лимит файловых наблюдателей увеличен!"

# Очищаем кэш node_modules если нужно
if [ -d "node_modules" ]; then
    echo "Очищаем кэш Metro..."
    npx expo r -c
fi

echo "Готово! Теперь можно запускать приложение."