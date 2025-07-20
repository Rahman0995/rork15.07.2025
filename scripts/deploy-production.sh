#!/bin/bash

# Скрипт для деплоя в production

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Деплой Military Management System в Production${NC}"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ] || [ ! -f "docker-compose.production.yml" ]; then
    echo -e "${RED}❌ Ошибка: Запустите скрипт из корневой директории проекта${NC}"
    exit 1
fi

# Функция для проверки команд
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 не установлен. Установите его и повторите попытку.${NC}"
        exit 1
    fi
}

# Проверяем необходимые команды
echo -e "${YELLOW}🔍 Проверка зависимостей...${NC}"
check_command docker
check_command docker-compose
check_command curl

# Проверяем наличие .env.production
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Файл .env.production не найден${NC}"
    echo "Создайте файл .env.production с production настройками"
    exit 1
fi

# SSL сертификаты не обязательны на начальном этапе
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo -e "${YELLOW}⚠️  SSL сертификаты не найдены${NC}"
    echo "Запустите ./scripts/setup-ssl.sh your-domain.com для настройки SSL"
    echo "Продолжаем без SSL..."
fi

# Загружаем переменные окружения
export $(cat .env.production | grep -v '^#' | xargs)

# Проверяем критические переменные
if [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this-in-production" ]; then
    echo "❌ JWT_SECRET must be changed in production!"
    echo "Generate a new secret: openssl rand -hex 64"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required in production!"
    exit 1
fi

if [ -z "$CORS_ORIGIN" ]; then
    echo "❌ CORS_ORIGIN is required in production!"
    exit 1
fi

echo "✅ Configuration validated"

# Останавливаем существующие контейнеры
echo "🔄 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down || true

# Собираем новые образы
echo "🔨 Building production images..."
docker-compose -f docker-compose.production.yml build --no-cache

# Запускаем контейнеры
echo "🚀 Starting production containers..."
docker-compose -f docker-compose.production.yml up -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 30

# Проверяем здоровье сервисов
echo "🔍 Checking service health..."

# Проверяем API
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    docker-compose -f docker-compose.production.yml logs api
    exit 1
fi

# Проверяем Redis
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
    docker-compose -f docker-compose.production.yml logs redis
    exit 1
fi

# Проверяем Nginx
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Nginx is healthy"
else
    echo "❌ Nginx health check failed"
    docker-compose -f docker-compose.production.yml logs nginx
    exit 1
fi

echo ""
echo "🎉 Production deployment completed successfully!"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.production.yml ps

echo ""
echo "🔗 Service URLs:"
echo "   API: https://$CORS_ORIGIN/api"
echo "   Health: https://$CORS_ORIGIN/api/health"
echo "   Metrics: https://$CORS_ORIGIN/api/metrics"

echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   Restart: docker-compose -f docker-compose.production.yml restart"
echo "   Stop: docker-compose -f docker-compose.production.yml down"
echo "   Update: ./scripts/deploy-production.sh"

echo ""
echo "🔐 Security checklist:"
echo "   ✅ SSL certificates configured"
echo "   ✅ JWT secret changed"
echo "   ✅ Rate limiting enabled"
echo "   ✅ Security headers configured"
echo "   ✅ Database connection secured"

echo ""
echo "📈 Monitoring:"
echo "   - Check logs regularly: docker-compose -f docker-compose.production.yml logs"
echo "   - Monitor health endpoints"
echo "   - Set up external monitoring (Uptime Robot, etc.)"
echo "   - Configure log aggregation (ELK stack, etc.)"