#!/bin/bash

# Скрипт для настройки мониторинга сервера

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📊 Настройка мониторинга сервера${NC}"

# Создаем директорию для логов
sudo mkdir -p /var/log/rork-app
sudo chown $USER:$USER /var/log/rork-app

# Создаем скрипт для проверки здоровья сервера
cat > /tmp/health-check.sh << 'EOF'
#!/bin/bash

# Скрипт проверки здоровья сервера
LOG_FILE="/var/log/rork-app/health-check.log"
API_URL="${EXPO_PUBLIC_RORK_API_BASE_URL:-http://localhost:3000}"

# Функция логирования
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Проверка API
check_api() {
    if curl -s -f "$API_URL/api/health" > /dev/null; then
        log "✅ API доступен"
        return 0
    else
        log "❌ API недоступен"
        return 1
    fi
}

# Проверка базы данных
check_database() {
    if curl -s -f "$API_URL/api/health" | grep -q "database.*connected"; then
        log "✅ База данных подключена"
        return 0
    else
        log "❌ Проблемы с базой данных"
        return 1
    fi
}

# Проверка использования диска
check_disk_usage() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        log "✅ Использование диска: ${DISK_USAGE}%"
        return 0
    else
        log "⚠️  Высокое использование диска: ${DISK_USAGE}%"
        return 1
    fi
}

# Проверка использования памяти
check_memory_usage() {
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        log "✅ Использование памяти: ${MEMORY_USAGE}%"
        return 0
    else
        log "⚠️  Высокое использование памяти: ${MEMORY_USAGE}%"
        return 1
    fi
}

# Основная проверка
main() {
    log "🔄 Начало проверки здоровья"
    
    ERRORS=0
    
    check_api || ((ERRORS++))
    check_database || ((ERRORS++))
    check_disk_usage || ((ERRORS++))
    check_memory_usage || ((ERRORS++))
    
    if [ $ERRORS -eq 0 ]; then
        log "✅ Все проверки пройдены успешно"
    else
        log "❌ Обнаружено $ERRORS проблем"
        
        # Отправляем уведомление (настройте под ваши нужды)
        # curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
        #      -d "chat_id=<CHAT_ID>" \
        #      -d "text=⚠️ Проблемы с сервером: $ERRORS ошибок"
    fi
    
    log "🏁 Проверка завершена"
}

main
EOF

# Перемещаем скрипт и делаем исполняемым
sudo mv /tmp/health-check.sh /usr/local/bin/health-check.sh
sudo chmod +x /usr/local/bin/health-check.sh

# Создаем директории для мониторинга
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana
mkdir -p logs

# Создаем конфигурацию Prometheus
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Создаем правила алертов
cat > monitoring/prometheus/alert_rules.yml << 'EOF'
groups:
  - name: api_alerts
    rules:
      - alert: APIDown
        expr: up{job="api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API is down"
          description: "API has been down for more than 1 minute"

      - alert: HighResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "95th percentile response time is above 1 second"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate"
          description: "Error rate is above 10%"

  - name: infrastructure_alerts
    rules:
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis has been down for more than 1 minute"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"

      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage"
          description: "Disk usage is above 90%"
EOF

# Создаем Docker Compose для мониторинга
cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager:/etc/alertmanager
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
EOF

# Создаем конфигурацию Grafana
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources

cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Создаем базовый дашборд
cat > monitoring/grafana/dashboards/api-dashboard.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "Military Management API Dashboard",
    "tags": ["api", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{quantile=\"0.95\"}",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Errors/sec"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF

# Создаем конфигурацию Alertmanager
mkdir -p monitoring/alertmanager

cat > monitoring/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@your-domain.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    email_configs:
      - to: 'admin@your-domain.com'
        subject: 'Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

# Создаем скрипт для запуска мониторинга
cat > scripts/start-monitoring.sh << 'EOF'
#!/bin/bash

echo "📊 Starting monitoring stack..."

# Запускаем мониторинг
docker-compose -f docker-compose.monitoring.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "✅ Monitoring stack started!"
echo ""
echo "🔗 Access URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3001 (admin/admin123)"
echo "   Alertmanager: http://localhost:9093"
echo ""
echo "📊 Default dashboards and alerts are configured"
echo "🔔 Configure email notifications in monitoring/alertmanager/alertmanager.yml"
EOF

chmod +x scripts/start-monitoring.sh

# Создаем скрипт для логирования
cat > scripts/setup-logging.sh << 'EOF'
#!/bin/bash

echo "📝 Setting up centralized logging..."

# Создаем конфигурацию для логирования
mkdir -p logging/filebeat
mkdir -p logging/elasticsearch
mkdir -p logging/kibana

# Конфигурация Filebeat
cat > logging/filebeat/filebeat.yml << 'FILEBEAT_EOF'
filebeat.inputs:
- type: container
  paths:
    - '/var/lib/docker/containers/*/*.log'
  processors:
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"

output.elasticsearch:
  hosts: ["elasticsearch:9200"]

setup.kibana:
  host: "kibana:5601"
FILEBEAT_EOF

echo "✅ Logging configuration created"
echo "📝 To enable ELK stack, run: docker-compose -f docker-compose.logging.yml up -d"
EOF

chmod +x scripts/setup-logging.sh

echo "✅ Monitoring setup completed!"
echo ""
echo "🚀 Next steps:"
echo "1. Run: ./scripts/start-monitoring.sh"
echo "2. Configure email alerts in monitoring/alertmanager/alertmanager.yml"
echo "3. Access Grafana at http://localhost:3001 (admin/admin123)"
echo "4. Set up external monitoring (Uptime Robot, etc.)"