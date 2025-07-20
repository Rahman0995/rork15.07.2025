# 🚀 Руководство по запуску приложения

## Проблема
У вас нет прав для глобальной установки Expo CLI, но это не проблема!

## Решения для запуска

### 1. Использование Node.js скриптов (Рекомендуется)

```bash
# Запуск мобильного приложения с туннелем
node quick-start.js

# Запуск веб-версии с туннелем  
node quick-start-web.js
```

### 2. Использование npx (если доступен)

```bash
# Мобильное приложение
npx expo start --tunnel

# Веб-версия
npx expo start --web --tunnel
```

### 3. Использование локального Expo CLI

```bash
# Мобильное приложение
./node_modules/.bin/expo start --tunnel

# Веб-версия
./node_modules/.bin/expo start --web --tunnel
```

### 4. Использование bash скриптов

```bash
# Сначала сделайте скрипты исполняемыми
chmod +x start-expo.sh start-expo-web.sh

# Затем запустите
./start-expo.sh          # для мобильного
./start-expo-web.sh      # для веба
```

## Что происходит при запуске

1. **Туннель**: Expo создает публичный URL для доступа к вашему приложению
2. **QR код**: Сканируйте его в приложении Expo Go на телефоне
3. **Веб-версия**: Откроется в браузере автоматически

## Устранение проблем

Если ничего не работает:

```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install

# Очистите кеш
npm start -- --clear
```

## Альтернативные команды

```bash
# Локальная сеть (без туннеля)
npx expo start --lan

# Только localhost
npx expo start --localhost

# С отладкой
DEBUG=expo* npx expo start --tunnel
```