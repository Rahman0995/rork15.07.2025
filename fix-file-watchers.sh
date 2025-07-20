#!/bin/bash

# Исправление проблемы с файловыми наблюдателями
echo "🔧 Увеличиваем лимит файловых наблюдателей..."

# Проверяем текущий лимит
echo "📊 Текущий лимит: $(cat /proc/sys/fs/inotify/max_user_watches)"

# Временное увеличение лимита для текущей сессии
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches

# Постоянное увеличение лимита (проверяем, не добавлено ли уже)
if ! grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf; then
    echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
    echo "📝 Добавлено в /etc/sysctl.conf"
else
    echo "📝 Настройка уже есть в /etc/sysctl.conf"
fi

# Применяем изменения
sudo sysctl -p

echo "✅ Новый лимит: $(cat /proc/sys/fs/inotify/max_user_watches)"
echo "🎉 Лимит файловых наблюдателей увеличен!"

# Очищаем кэш
echo "🧹 Очищаем кэш..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf dist 2>/dev/null || true

echo "✅ Готово! Теперь можно запускать приложение."
echo "🚀 Запустите: npm start"