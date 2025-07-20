# Быстрая настройка SMS Webhook

## Что нужно сделать в Supabase Dashboard:

1. **Откройте ваш проект Supabase**
2. **Перейдите в Authentication → Settings**
3. **Найдите секцию "Webhooks"**
4. **Нажмите "Add Send SMS hook"**
5. **Настройте webhook:**
   - ✅ Enable Send SMS hook
   - 🔘 HTTPS (выберите этот тип)
   - 📝 URL: `http://localhost:3000/api/webhooks/supabase/sms`
   - 🔐 Secret: уже сгенерирован (из скриншота)

## Текущие настройки:

✅ **URL:** `http://localhost:3000/api/webhooks/supabase/sms`
✅ **Secret:** уже добавлен в `.env`
✅ **Backend endpoint:** создан в `backend/hono.ts`
✅ **Тестовый компонент:** доступен в приложении

## Как протестировать:

1. **Запустите backend:**
   ```bash
   npm run start:backend
   ```

2. **Откройте приложение:**
   - Перейдите в **Профиль** → **Тест SMS**
   - Введите номер телефона
   - Нажмите "Отправить SMS код"

3. **Проверьте логи backend:**
   - Должны появиться сообщения о получении webhook

## Важно:

⚠️ **Для работы SMS нужно настроить SMS провайдера в Supabase:**
- Twilio
- MessageBird  
- Vonage
- Textlocal

📱 **Формат номера:** `+7XXXXXXXXXX` (с кодом страны)

🔧 **Если не работает:**
- Проверьте, что backend запущен на порту 3000
- Убедитесь, что URL в Supabase правильный
- Проверьте настройки SMS провайдера