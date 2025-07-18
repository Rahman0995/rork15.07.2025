# Network Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. "Request timeout (5s)" Error

**Причина:** Сервер недоступен или медленно отвечает.

**Решения:**
1. **Проверьте, запущен ли backend сервер:**
   ```bash
   npm run backend:dev
   # или
   cd backend && bun run dev
   ```

2. **Найдите ваш локальный IP адрес:**
   ```bash
   node find-local-ip.js
   ```

3. **Обновите .env файл с правильным IP:**
   ```
   LOCAL_IP=192.168.1.XXX  # Замените на ваш IP
   ```

4. **Перезапустите приложение:**
   ```bash
   npm run clean
   npm start
   ```

### 2. "Network request failed" Error

**Причина:** Проблемы с сетевым подключением.

**Решения:**
1. **Убедитесь, что устройства в одной сети:**
   - Компьютер и телефон должны быть подключены к одному WiFi
   - Проверьте настройки брандмауэра

2. **Проверьте доступность сервера:**
   ```bash
   curl http://localhost:3000/api/health
   # или с вашим IP
   curl http://192.168.1.XXX:3000/api/health
   ```

3. **Для мобильных устройств:**
   - Откройте браузер на телефоне
   - Перейдите по адресу: `http://192.168.1.XXX:3000/api/health`
   - Должен отобразиться JSON ответ

### 3. CORS Errors

**Причина:** Проблемы с Cross-Origin Resource Sharing.

**Решение:**
- Backend уже настроен для разработки
- Если проблема сохраняется, проверьте backend/hono.ts

### 4. Mock Data Mode

Приложение автоматически переключается в режим mock данных при недоступности сервера.

**Признаки mock режима:**
- В ответах есть поле `"mock": true`
- Сообщения содержат "Mock data" или "Network unavailable"

**Отключение mock режима:**
1. Убедитесь, что сервер запущен
2. Проверьте сетевое подключение
3. Обновите конфигурацию в app.config.js

## Диагностические инструменты

### 1. Встроенная диагностика
- Откройте приложение
- Перейдите в Settings → Backend Test
- Нажмите "Диагностика сети"

### 2. Консольные команды

**Проверка локального IP:**
```bash
node find-local-ip.js
```

**Тест backend сервера:**
```bash
curl -X GET http://localhost:3000/api/health
```

**Проверка tRPC endpoint:**
```bash
curl -X POST http://localhost:3000/api/trpc/example.hi \
  -H "Content-Type: application/json" \
  -d '{"json":{"name":"Test"}}'
```

### 3. Логи для отладки

Проверьте консоль браузера/Metro для:
- `Making tRPC request to: ...`
- `tRPC request successful: ...`
- `tRPC fetch failed: ...`
- `Using baseUrl from config: ...`

## Конфигурация для разных сред

### Development (Разработка)
```javascript
// app.config.js
const YOUR_IP_ADDRESS = '192.168.1.XXX'; // Ваш локальный IP
```

### Production (Продакшн)
```javascript
// .env.production
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-domain.com
```

### Популярные хостинги:
- **Railway:** `https://your-project.railway.app`
- **Render:** `https://your-service.render.com`
- **Vercel:** `https://your-project.vercel.app`

## Быстрые исправления

### 1. Полная перезагрузка
```bash
npm run clean
rm -rf node_modules
npm install
npm start
```

### 2. Сброс Metro cache
```bash
npx expo start --clear
```

### 3. Проверка портов
```bash
# Проверить, что порт 3000 свободен
lsof -i :3000
# Или использовать другой порт
PORT=3001 npm run backend:dev
```

## Контрольный список

- [ ] Backend сервер запущен (`npm run backend:dev`)
- [ ] Правильный IP в .env файле
- [ ] Устройства в одной сети
- [ ] Порт 3000 доступен
- [ ] Брандмауэр не блокирует подключения
- [ ] Приложение перезапущено после изменений

## Получение помощи

Если проблема не решена:

1. **Запустите диагностику:**
   - Settings → Backend Test → Диагностика сети
   - Скопируйте информацию из консоли

2. **Соберите логи:**
   ```bash
   npm start > app.log 2>&1
   ```

3. **Проверьте сетевую конфигурацию:**
   ```bash
   node find-local-ip.js > network-info.txt
   ```

Приложите эти файлы при обращении за помощью.