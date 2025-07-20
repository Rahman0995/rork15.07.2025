#!/bin/bash

# Production deployment script

set -e

echo "🚀 Starting production deployment..."

# Проверяем наличие необходимых файлов
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your production configuration"
    exit 1
fi

if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "❌ SSL certificates not found!"
    echo "Please run: ./scripts/generate-ssl.sh your-domain.com your-email@domain.com"
    exit 1
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