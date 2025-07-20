#!/bin/bash

# Скрипт для генерации SSL сертификатов с помощью Let's Encrypt

set -e

DOMAIN=${1:-"your-domain.com"}
EMAIL=${2:-"admin@your-domain.com"}

echo "🔐 Generating SSL certificates for domain: $DOMAIN"

# Создаем директорию для SSL сертификатов
mkdir -p ssl

# Проверяем установлен ли certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    
    # Для Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    # Для CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot python3-certbot-nginx
    # Для macOS
    elif command -v brew &> /dev/null; then
        brew install certbot
    else
        echo "❌ Unable to install certbot automatically. Please install it manually."
        exit 1
    fi
fi

# Генерируем сертификат
echo "🔄 Generating certificate for $DOMAIN..."

# Standalone mode (если nginx не запущен)
sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Копируем сертификаты в нашу директорию
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem

# Устанавливаем правильные права доступа
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved to:"
echo "   - ssl/cert.pem"
echo "   - ssl/key.pem"

# Настраиваем автоматическое обновление
echo "🔄 Setting up automatic renewal..."

# Создаем скрипт для обновления
cat > ssl/renew-ssl.sh << 'EOF'
#!/bin/bash
sudo certbot renew --quiet
sudo cp /etc/letsencrypt/live/*/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/*/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
docker-compose -f docker-compose.production.yml restart nginx
EOF

chmod +x ssl/renew-ssl.sh

# Добавляем в crontab (обновление каждые 12 часов)
(crontab -l 2>/dev/null; echo "0 */12 * * * $(pwd)/ssl/renew-ssl.sh") | crontab -

echo "✅ Automatic renewal configured!"
echo "🔄 Certificates will be renewed automatically every 12 hours"

echo ""
echo "🚀 Next steps:"
echo "1. Update nginx.prod.conf with your domain name"
echo "2. Update .env.production with your domain in CORS_ORIGIN"
echo "3. Run: docker-compose -f docker-compose.production.yml up -d"