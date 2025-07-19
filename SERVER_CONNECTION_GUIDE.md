# 🌐 Руководство по подключению к серверу

## Что нужно сделать для работы сайта и приложения:

### 1. 🚀 Запуск сервера

**Вариант A: Простой запуск сервера**
```bash
node start-server.js
```

**Вариант B: Запуск через bun**
```bash
bun run backend/index.ts
```

**Вариант C: Полный запуск (сервер + приложение)**
```bash
node start-full-app.js
```

### 2. 🔧 Настройка IP адреса

1. **Найдите ваш локальный IP адрес:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux  
   ifconfig
   
   # Или используйте наш скрипт
   node find-local-ip-simple.js
   ```

2. **Обновите файл `.env`:**
   ```env
   LOCAL_IP=192.168.1.XXX  # замените XXX на ваш IP
   EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.XXX:3000
   ```

3. **Обновите `app.config.js` (строка 7):**
   ```javascript
   const YOUR_IP_ADDRESS = '192.168.1.XXX'; // ваш реальный IP
   ```

### 3. 🧪 Проверка подключения

```bash
# Тест подключения к серверу
node test-server-connection.js
```

Или вручную откройте в браузере:
- http://localhost:3000/api/health
- http://ВАШ_IP:3000/api/health

### 4. 📱 Запуск приложения

После запуска сервера, в новом терминале:
```bash
bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel
```

## 🌍 Доступные URL:

| Сервис | Localhost | Локальная сеть | Описание |
|--------|-----------|----------------|----------|
| API | http://localhost:3000/api | http://ВАШ_IP:3000/api | Основной API |
| Health | http://localhost:3000/api/health | http://ВАШ_IP:3000/api/health | Проверка здоровья |
| tRPC | http://localhost:3000/api/trpc | http://ВАШ_IP:3000/api/trpc | tRPC эндпоинт |

## 🗄️ База данных

Приложение настроено для работы с **Railway MySQL**:
- ✅ Автоматическое подключение к облачной БД
- ✅ Fallback на mock данные при отсутствии соединения
- ✅ Реальные данные вместо макетных

## 📊 Проверка работы

1. **Сервер запущен:** Статус "healthy" на /api/health
2. **База данных:** Подключение к Railway MySQL
3. **Приложение:** Загрузка реальных данных
4. **Мобильное:** QR код работает через tunnel

## 🔧 Решение проблем

### Сервер не запускается:
```bash
# Проверить порт 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Убить процесс если нужно
kill -9 PID  # Mac/Linux
taskkill /PID PID /F  # Windows
```

### Мобильное приложение не подключается:
1. Убедитесь что компьютер и телефон в одной WiFi сети
2. Проверьте firewall/антивирус
3. Используйте tunnel режим: `--tunnel`
4. Обновите IP в конфигурации

### База данных недоступна:
- Приложение автоматически переключится на mock данные
- Проверьте интернет соединение
- Railway БД должна быть доступна 24/7

## 🎯 Быстрый старт

```bash
# 1. Запустить сервер
node start-server.js

# 2. В новом терминале - приложение  
bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel

# 3. Открыть в браузере
open http://localhost:3000/api/health

# 4. Сканировать QR код в Expo Go
```

Готово! 🎉