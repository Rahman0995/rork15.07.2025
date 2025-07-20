#!/bin/bash

# Скрипт для резервного копирования MySQL базы данных

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Загружаем переменные окружения
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
elif [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ Файл .env не найден${NC}"
    exit 1
fi

# Парсим DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL не установлен${NC}"
    exit 1
fi

# Извлекаем параметры подключения из URL
# Формат: mysql://user:password@host:port/database
DB_URL_REGEX="mysql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)"

if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo -e "${RED}❌ Неверный формат DATABASE_URL${NC}"
    exit 1
fi

# Создаем директорию для бэкапов
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Генерируем имя файла с датой
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo -e "${GREEN}💾 Создание резервной копии базы данных${NC}"
echo -e "${YELLOW}📋 Параметры:${NC}"
echo "  База данных: $DB_NAME"
echo "  Хост: $DB_HOST:$DB_PORT"
echo "  Пользователь: $DB_USER"
echo "  Файл бэкапа: $BACKUP_FILE"
echo ""

# Создаем бэкап
echo -e "${YELLOW}🔄 Создание бэкапа...${NC}"

mysqldump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    --extended-insert \
    --create-options \
    --quick \
    --lock-tables=false \
    "$DB_NAME" > "$BACKUP_FILE"

# Сжимаем бэкап
echo -e "${YELLOW}🗜️  Сжатие бэкапа...${NC}"
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Проверяем размер файла
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}✅ Бэкап успешно создан!${NC}"
echo "  Файл: $BACKUP_FILE"
echo "  Размер: $BACKUP_SIZE"
echo ""

# Удаляем старые бэкапы (старше 30 дней)
echo -e "${YELLOW}🧹 Очистка старых бэкапов...${NC}"
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
echo "  Осталось бэкапов: $REMAINING_BACKUPS"

echo ""
echo -e "${YELLOW}📋 Для восстановления используйте:${NC}"
echo "  gunzip -c $BACKUP_FILE | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME"
echo ""
echo -e "${YELLOW}⚠️  Рекомендации:${NC}"
echo "1. Настройте автоматическое создание бэкапов через cron:"
echo "   0 2 * * * /path/to/backup-database.sh"
echo ""
echo "2. Загружайте бэкапы в облачное хранилище для дополнительной безопасности"
echo ""
echo "3. Регулярно проверяйте возможность восстановления из бэкапов"