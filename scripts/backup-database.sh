#!/bin/bash

# Database backup script

set -e

# Загружаем переменные окружения
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database_backup_$DATE.sql"

echo "💾 Starting database backup..."

# Создаем директорию для бэкапов
mkdir -p $BACKUP_DIR

# Парсим DATABASE_URL для получения параметров подключения
if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Unable to parse DATABASE_URL"
    exit 1
fi

echo "🔄 Creating backup of database: $DB_NAME"

# Создаем бэкап
mysqldump \
    --host=$DB_HOST \
    --port=$DB_PORT \
    --user=$DB_USER \
    --password=$DB_PASS \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    --add-locks \
    --create-options \
    --disable-keys \
    --extended-insert \
    --quick \
    --set-charset \
    $DB_NAME > $BACKUP_FILE

# Сжимаем бэкап
echo "🗜️ Compressing backup..."
gzip $BACKUP_FILE
BACKUP_FILE="$BACKUP_FILE.gz"

echo "✅ Backup created: $BACKUP_FILE"

# Показываем размер бэкапа
BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "📊 Backup size: $BACKUP_SIZE"

# Удаляем старые бэкапы (старше 30 дней)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "database_backup_*.sql.gz" -mtime +30 -delete

REMAINING_BACKUPS=$(ls -1 $BACKUP_DIR/database_backup_*.sql.gz 2>/dev/null | wc -l)
echo "📁 Remaining backups: $REMAINING_BACKUPS"

echo ""
echo "💾 Backup completed successfully!"
echo "📁 Backup location: $BACKUP_FILE"
echo ""
echo "🔄 To restore from backup:"
echo "   gunzip -c $BACKUP_FILE | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME"