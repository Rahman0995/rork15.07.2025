# Руководство по развертыванию Military Management App

## Обзор

Ваше приложение состоит из:
- **Backend API** (Hono + tRPC) - порт 3000
- **Web Frontend** (React Native Web) - порт 80
- **PostgreSQL Database** - порт 5432
- **Redis Cache** - порт 6379

## Быстрое развертывание

### 1. Подготовка сервера

```bash
# Установите Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установите Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Клонирование и настройка

```bash
# Клонируйте проект
git clone <your-repo-url>
cd rork-app

# Настройте environment переменные
cp .env.production .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Развертывание

```bash
# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите развертывание
./deploy.sh
```

## Ручное развертывание

### 1. Сборка и запуск

```bash
# Сборка всех сервисов
docker-compose build

# Запуск в фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

### 2. Проверка состояния

```bash
# Проверка статуса сервисов
docker-compose ps

# Проверка здоровья API
curl http://localhost:3000/api/health

# Проверка веб-приложения
curl http://localhost:80
```

## Настройка домена и SSL

### 1. Настройка Nginx Proxy Manager

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  nginx-proxy-manager:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
```

### 2. Настройка SSL сертификатов

1. Откройте Nginx Proxy Manager: `http://your-server:81`
2. Добавьте Proxy Host для вашего домена
3. Настройте SSL сертификат (Let's Encrypt)

## Мобильные приложения

### iOS (App Store)

```bash
# Установите EAS CLI
npm install -g @expo/eas-cli

# Настройте EAS
eas login
eas build:configure

# Сборка для iOS
eas build --platform ios --profile production
```

### Android (Google Play)

```bash
# Сборка для Android
eas build --platform android --profile production

# Отправка в Google Play
eas submit --platform android
```

## Мониторинг и обслуживание

### Логи

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f web
```

### Резервное копирование

```bash
# Создание бэкапа базы данных
docker-compose exec database pg_dump -U admin military_app > backup.sql

# Восстановление из бэкапа
docker-compose exec -T database psql -U admin military_app < backup.sql
```

### Обновление

```bash
# Остановка сервисов
docker-compose down

# Обновление кода
git pull origin main

# Пересборка и запуск
docker-compose up --build -d
```

## Масштабирование

### Горизонтальное масштабирование

```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3
  
  nginx-lb:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "3000:80"
    depends_on:
      - backend
```

### Вертикальное масштабирование

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## Безопасность

### 1. Firewall настройки

```bash
# Разрешить только необходимые порты
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Регулярные обновления

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Обновление Docker образов
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Проблемы с подключением к базе данных

```bash
# Проверка подключения к PostgreSQL
docker-compose exec database psql -U admin -d military_app -c "SELECT version();"
```

### Проблемы с памятью

```bash
# Очистка неиспользуемых Docker образов
docker system prune -a

# Мониторинг использования ресурсов
docker stats
```

### Проблемы с CORS

Убедитесь, что в `.env` файле правильно настроен `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## Поддержка

Для получения поддержки:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус сервисов: `docker-compose ps`
3. Проверьте health endpoints: `curl http://localhost:3000/api/health`