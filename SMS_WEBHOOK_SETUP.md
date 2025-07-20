# Настройка SMS Webhook в Supabase

## 1. Настройка в Supabase Dashboard

### Шаг 1: Перейдите в настройки Auth
1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в раздел **Authentication** → **Settings**
3. Найдите секцию **Webhooks**

### Шаг 2: Добавьте SMS Webhook
1. Нажмите **Add Send SMS hook**
2. Включите **Enable Send SMS hook**
3. Выберите тип **HTTPS**
4. Введите URL вашего webhook:
   - Для локальной разработки: `http://localhost:3000/api/webhooks/supabase/sms`
   - Для production: `https://your-domain.com/api/webhooks/supabase/sms`
5. Скопируйте сгенерированный **Secret** и добавьте его в `.env`:
   ```
   SUPABASE_WEBHOOK_SECRET=v1,whsec_ll6hvMMRV620VYFElyWffcT7PhKszRkpjf/kdVds8VZOWHCwxqFBo18/sle4qvMUxi0nfLO3HkZH2AW
   ```

## 2. Настройка SMS провайдера

### Для Twilio:
1. Перейдите в **Settings** → **Auth** → **SMS**
2. Включите **Enable phone confirmations**
3. Выберите **Twilio** как провайдера
4. Введите ваши Twilio credentials:
   - Account SID
   - Auth Token
   - Phone Number

### Для других провайдеров:
- MessageBird
- Textlocal
- Vonage

## 3. Тестирование

### Локальное тестирование:
```bash
# Запустите backend
npm run start:backend

# В другом терминале запустите тест
node test-sms-webhook.js
```

### Тестирование в приложении:
1. Откройте приложение
2. Перейдите в **Профиль** → **Тест SMS**
3. Введите номер телефона
4. Нажмите **Отправить SMS код**

## 4. Проверка логов

### Backend логи:
```bash
# Проверьте логи backend для webhook событий
tail -f backend.log
```

### Supabase логи:
1. Перейдите в **Logs** → **Auth**
2. Найдите события SMS отправки
3. Проверьте статус webhook вызовов

## 5. Troubleshooting

### Webhook не вызывается:
- Проверьте URL webhook
- Убедитесь, что backend доступен
- Проверьте настройки firewall

### SMS не отправляется:
- Проверьте настройки SMS провайдера
- Убедитесь, что номер телефона в правильном формате
- Проверьте баланс SMS провайдера

### Ошибки подписи:
- Проверьте правильность webhook secret
- Убедитесь, что secret не содержит лишних символов

## 6. Безопасность

### Production настройки:
1. Используйте HTTPS для webhook URL
2. Проверяйте подпись webhook
3. Ограничьте доступ к webhook endpoint
4. Логируйте все webhook события

### Переменные окружения:
```env
# Production
SUPABASE_WEBHOOK_SECRET=your-production-secret
WEBHOOK_URL=https://your-domain.com/api/webhooks/supabase/sms

# Development
SUPABASE_WEBHOOK_SECRET=your-dev-secret
WEBHOOK_URL=http://localhost:3000/api/webhooks/supabase/sms
```

## 7. Мониторинг

### Метрики для отслеживания:
- Количество отправленных SMS
- Успешность доставки
- Время ответа webhook
- Ошибки аутентификации

### Алерты:
- Высокий процент ошибок SMS
- Недоступность webhook
- Превышение лимитов SMS провайдера