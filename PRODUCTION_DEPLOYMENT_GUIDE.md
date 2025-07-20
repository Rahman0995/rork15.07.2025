# 🚀 Production Deployment Guide

Полное руководство по развертыванию Military Management System в production.

## 📋 Предварительные требования

### Системные требования
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM минимум (8GB рекомендуется)
- 20GB свободного места на диске
- Доменное имя с настроенными DNS записями

### Необходимые порты
- 80 (HTTP - редирект на HTTPS)
- 443 (HTTPS)
- 3000 (API - только для внутренних соединений)
- 6379 (Redis - только для внутренних соединений)

## 🔧 Шаг 1: Подготовка сервера

### Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### Установка Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Установка Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🔐 Шаг 2: Настройка безопасности

### Генерация JWT Secret
```bash
openssl rand -hex 64
```

### Настройка .env.production
```bash
cp .env.production.example .env.production
nano .env.production
```

Обязательно измените:
- `JWT_SECRET` - используйте сгенерированный выше ключ
- `CORS_ORIGIN` - ваш домен
- `DATABASE_URL` - подключение к вашей базе данных

### Генерация SSL сертификатов
```bash
chmod +x scripts/generate-ssl.sh
./scripts/generate-ssl.sh your-domain.com admin@your-domain.com
```

## 🗄️ Шаг 3: Настройка базы данных

### Вариант 1: Использование Railway (рекомендуется)
1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте MySQL сервис
4. Скопируйте DATABASE_URL в .env.production

### Вариант 2: Собственная MySQL
```bash
# Установка MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Создание базы данных
sudo mysql -u root -p
CREATE DATABASE military_management;
CREATE USER 'app_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON military_management.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

## 🚀 Шаг 4: Развертывание

### Клонирование репозитория
```bash
git clone <your-repo-url>
cd military-management-system
```

### Запуск deployment скрипта
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Проверка развертывания
```bash
# Проверка статуса сервисов
docker-compose -f docker-compose.production.yml ps

# Проверка логов
docker-compose -f docker-compose.production.yml logs -f

# Проверка health endpoints
curl https://your-domain.com/api/health
```

## 📊 Шаг 5: Настройка мониторинга

### Установка мониторинга
```bash
chmod +x scripts/setup-monitoring.sh
./scripts/setup-monitoring.sh

# Запуск мониторинга
./scripts/start-monitoring.sh
```

### Доступ к мониторингу
- Prometheus: http://your-server:9090
- Grafana: http://your-server:3001 (admin/admin123)
- Alertmanager: http://your-server:9093

## 💾 Шаг 6: Настройка резервного копирования

### Автоматическое резервное копирование
```bash
chmod +x scripts/backup-database.sh

# Добавление в crontab (ежедневно в 2:00)
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup-database.sh") | crontab -
```

### Ручное создание бэкапа
```bash
./scripts/backup-database.sh
```

## 🔒 Шаг 7: Дополнительная безопасность

### Настройка файрвола
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp
sudo ufw deny 6379/tcp
```

### Настройка fail2ban
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Обновление системы
```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 Шаг 8: Оптимизация производительности

### Настройка Docker
```bash
# Ограничение логов Docker
echo '{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}' | sudo tee /etc/docker/daemon.json

sudo systemctl restart docker
```

### Настройка системных лимитов
```bash
# Увеличение лимитов для файлов
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

## 🔄 Обновление приложения

### Обновление кода
```bash
git pull origin main
./scripts/deploy-production.sh
```

### Откат к предыдущей версии
```bash
git checkout <previous-commit>
./scripts/deploy-production.sh
```

## 🚨 Устранение неполадок

### Проверка логов
```bash
# Логи всех сервисов
docker-compose -f docker-compose.production.yml logs

# Логи конкретного сервиса
docker-compose -f docker-compose.production.yml logs api
docker-compose -f docker-compose.production.yml logs nginx
docker-compose -f docker-compose.production.yml logs redis
```

### Перезапуск сервисов
```bash
# Перезапуск всех сервисов
docker-compose -f docker-compose.production.yml restart

# Перезапуск конкретного сервиса
docker-compose -f docker-compose.production.yml restart api
```

### Проверка ресурсов
```bash
# Использование ресурсов контейнерами
docker stats

# Использование диска
df -h

# Использование памяти
free -h
```

## 📞 Поддержка

### Полезные команды
```bash
# Статус сервисов
docker-compose -f docker-compose.production.yml ps

# Подключение к контейнеру
docker-compose -f docker-compose.production.yml exec api bash

# Просмотр конфигурации
docker-compose -f docker-compose.production.yml config

# Обновление образов
docker-compose -f docker-compose.production.yml pull
```

### Мониторинг здоровья
- API Health: `https://your-domain.com/api/health`
- API Metrics: `https://your-domain.com/api/metrics`
- API Config: `https://your-domain.com/api/config`

## ✅ Чек-лист развертывания

- [ ] Сервер подготовлен и обновлен
- [ ] Docker и Docker Compose установлены
- [ ] Доменное имя настроено
- [ ] SSL сертификаты сгенерированы
- [ ] .env.production настроен
- [ ] JWT_SECRET изменен
- [ ] База данных настроена
- [ ] Приложение развернуто
- [ ] Health checks проходят
- [ ] Мониторинг настроен
- [ ] Резервное коп��рование настроено
- [ ] Файрвол настроен
- [ ] Автоматические обновления включены

## 🎯 Рекомендации для production

1. **Мониторинг**: Настройте внешний мониторинг (Uptime Robot, Pingdom)
2. **Логирование**: Рассмотрите ELK stack для централизованного логирования
3. **CDN**: Используйте CloudFlare для кэширования и защиты
4. **Масштабирование**: При росте нагрузки добавьте load balancer
5. **Резервирование**: Настройте репликацию базы данных
6. **Тестирование**: Регулярно тестируйте процедуры восстановления

---

🚀 **Поздравляем! Ваше приложение готово к production использованию!**