# Исправление деплоя на Netlify

## Проблема
Ошибка: "Базовый справочник не существует: /opt/build/repo/rok"

## Решение

### Автоматическое исправление:
```bash
node fix-netlify-deploy.js
```

### Или ручное исправление:

1. **Обновите netlify.toml:**
   ```toml
   [build]
     command = "npm run build:web"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18"
     NPM_FLAGS = "--legacy-peer-deps"
     EXPO_PUBLIC_API_URL = "https://your-backend-url.railway.app/api"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Используйте упрощенный package.json:**
   ```bash
   cp package.netlify.json package.json
   ```

3. **Используйте упрощенный app.config.js:**
   ```bash
   cp app.config.netlify.js app.config.js
   ```

4. **Коммит и пуш:**
   ```bash
   git add .
   git commit -m "Fix Netlify deployment"
   git push
   ```

## Важно!
- Обновите `EXPO_PUBLIC_API_URL` в `netlify.toml` с вашим реальным URL бэкенда
- Убедитесь, что в репозитории нет папки `rok` или других неправильных путей

## Альтернативы
Если Netlify не работает, попробуйте:
- **Vercel**: `node deploy-to-vercel.js`
- **Render**: `node deploy-to-render.js`