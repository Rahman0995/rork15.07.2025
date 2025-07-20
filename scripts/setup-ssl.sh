#!/bin/bash

# Скрипт для настройки SSL сертификатов с Let's Encrypt

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Настройка SSL сертификатов${NC}"

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Ошибка: Укажите домен${NC}"
    echo "Использование: $0 <domain> [email]"
    echo "Пример: $0 yourdomain.com admin@yourdomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo -e "${YELLOW}📋 Параметры:${NC}"
echo "  Домен: $DOMAIN"
echo "  Email: $EMAIL"
echo ""

# Проверяем, установлен ли certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Устанавливаем certbot...${NC}"
    
    # Определяем ОС и устанавливаем certbot
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-nginx
        elif command -v yum &> /dev/null; then
            sudo yum install -y certbot python3-certbot-nginx
        else
            echo -e "${RED}❌ Неподдерживаемая ОС. Установите certbot вручную.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Неподдерживаемая ОС. Установите certbot вручную.${NC}"
        exit 1
    fi
fi

# Создаем директории для сертификатов
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private

# Получаем сертификат
echo -e "${YELLOW}🔄 Получаем SSL сертификат для $DOMAIN...${NC}"

# Standalone режим (если nginx не настроен)
sudo certbot certonly \
    --standalone \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domains "$DOMAIN,www.$DOMAIN" \
    --non-interactive

# Копируем сертификаты в нужное место
sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" /etc/ssl/certs/cert.pem
sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" /etc/ssl/private/key.pem

# Устанавливаем правильные права
sudo chmod 644 /etc/ssl/certs/cert.pem
sudo chmod 600 /etc/ssl/private/key.pem

# Создаем скрипт для автоматического обновления
cat > /tmp/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp "/etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem" /etc/ssl/certs/cert.pem
cp "/etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem" /etc/ssl/private/key.pem
chmod 644 /etc/ssl/certs/cert.pem
chmod 600 /etc/ssl/private/key.pem
# Перезапускаем сервер (раскомментируйте нужную строку)
# systemctl restart nginx
# docker-compose restart
# pm2 restart all
EOF

# Заменяем плейсхолдер на реальный домен
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /tmp/renew-ssl.sh

# Перемещаем скрипт и делаем исполняемым
sudo mv /tmp/renew-ssl.sh /usr/local/bin/renew-ssl.sh
sudo chmod +x /usr/local/bin/renew-ssl.sh

# Добавляем в crontab для автоматического обновления
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/renew-ssl.sh") | crontab -

echo -e "${GREEN}✅ SSL сертификат успешно настроен!${NC}"
echo ""
echo -e "${YELLOW}📋 Информация:${NC}"
echo "  Сертификат: /etc/ssl/certs/cert.pem"
echo "  Приватный ключ: /etc/ssl/private/key.pem"
echo "  Автообновление: настроено (каждый день в 3:00)"
echo ""
echo -e "${YELLOW}⚠️  Следующие шаги:${NC}"
echo "1. Обновите CORS_ORIGIN в .env.production:"
echo "   CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN"
echo ""
echo "2. Обновите EXPO_PUBLIC_RORK_API_BASE_URL:"
echo "   EXPO_PUBLIC_RORK_API_BASE_URL=https://$DOMAIN"
echo ""
echo "3. Перезапустите сервер для применения изменений"