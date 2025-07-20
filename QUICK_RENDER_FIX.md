# 🔧 Быстрое исправление Render

## Что было исправлено:
1. **Убрано поле `main`** из package.json - это вызывало ошибку
2. **Создан правильный стартовый скрипт** `start-web-render.js`
3. **Упрощена веб-конфигурация** `app.config.web.js`
4. **Обновлена команда сборки** в `render.yaml`

## Что нужно сделать:
1. Закоммитить все изменения в Git
2. Сделать push в репозиторий
3. Render автоматически пересоберет проект

## Команды:
```bash
git add .
git commit -m "Fix Render deployment configuration"
git push origin main
```

## Результат:
✅ Веб-версия будет корректно собираться и запускаться на Render  
✅ Исправлена ошибка "Cannot find module '/opt/render/project/src/expo-router/entry'"  
✅ Добавлен SPA режим для правильной работы роутинга  

После деплоя ваше приложение будет доступно по адресу Render.