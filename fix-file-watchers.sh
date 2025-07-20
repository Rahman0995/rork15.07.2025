#!/bin/bash

echo "🔧 Увеличиваем лимит файловых наблюдателей..."

# Проверяем текущий лимит
echo "📊 Текущий лимит: $(cat /proc/sys/fs/inotify/max_user_watches)"

# Увеличиваем лимит временно
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches

# Делаем изменение постоянным
if ! grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf 2>/dev/null; then
    echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
    echo "📝 Добавлено в /etc/sysctl.conf"
else
    echo "📝 Настройка уже есть в /etc/sysctl.conf"
fi

# Применяем изменения
sudo sysctl -p 2>/dev/null || true

echo "✅ Новый лимит: $(cat /proc/sys/fs/inotify/max_user_watches)"
echo "🎉 Лимит файловых наблюдателей увеличен!"

# Очищаем кэш Metro и Expo
echo "🧹 Очищаем кэш..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true
rm -rf ~/.expo 2>/dev/null || true

# Убиваем все процессы Metro
pkill -f metro 2>/dev/null || true
pkill -f expo 2>/dev/null || true

echo "✅ Кэш очищен!"
echo "🚀 Теперь можно запускать приложение: npx expo start"