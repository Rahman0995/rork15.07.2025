# 🚀 Быстрый запуск Military Management System

## Для подключения к серверу и работы приложения выполните следующие шаги:

### 1. Запуск только сервера (Backend)
```bash
node start-server.js
```
или
```bash
bun run backend/index.ts
```

### 2. Запуск полного приложения (Backend + Frontend)
```bash
node start-full-app.js
```

### 3. Запуск по отдельности
В первом терминале:
```bash
bun run backend/index.ts
```

Во втором терминале:
```bash
bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel
```

## 📱 Доступные URL:

- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health  
- **tRPC Endpoint**: http://localhost:3000/api/trpc
- **Для мобильных устройств**: http://[ВАШ_IP]:3000/api

## 🔧 Настройка IP адреса

1. Найдите ваш локальный IP:
   - **Windows**: `ipconfig`
   - **Mac/Linux**: `ifconfig`

2. Обновите файл `.env`:
   ```
   LOCAL_IP=192.168.1.XXX  # замените на ваш IP
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.XXX:3000
   ```

3. Обновите `app.config.js` (строка 7):
   ```javascript
   const YOUR_IP_ADDRESS = '192.168.1.XXX'; // ваш IP
   ```

## 🌐 Подключение к облачной базе данных

Приложение уже настроено для работы с Railway MySQL:
- База данных: `mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway`
- Настройки в `.env` файле

## 📊 Проверка работы

1. Откройте http://localhost:3000/api/health - должен показать статус "healthy"
2. В приложении данные должны загружаться из реальной базы данных
3. Если база недоступна, приложение автоматически переключится на mock данные

## 🔍 Отладка

Если возникают проблемы:
1. Проверьте, что порт 3000 свободен
2. Убедитесь, что IP адрес правильный
3. Проверьте подключение к интернету (для Railway DB)
4. Посмотрите логи в консоли

## 📱 Для мобильного тестирования

1. Убедитесь, что компьютер и телефон в одной сети
2. Используйте tunnel режим: `--tunnel`
3. Сканируйте QR код в Expo Go приложении