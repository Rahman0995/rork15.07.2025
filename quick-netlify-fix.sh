#!/bin/bash

echo "🔧 Быстрое исправление Netlify..."
echo "================================="

# Создаем резервные копии
cp package.json package.json.backup 2>/dev/null || true
cp app.config.js app.config.js.backup 2>/dev/null || true

# Копируем файлы для Netlify
cp package.netlify.json package.json
cp app.config.netlify.js app.config.js

echo "✅ Файлы обновлены для Netlify"
echo ""
echo "🚀 Теперь выполните:"
echo "git add ."
echo "git commit -m 'Fix Netlify deployment'"
echo "git push"
echo ""
echo "⚠️  Не забудьте обновить URL бэкенда в netlify.toml!"