# 🚀 Production Setup Guide

## Обязательные настройки для Production

### 1. 🌐 API URLs
**Файлы для обновления:**
- `.env.production`
- `app.config.js`
- `utils/config.ts`

**Что нужно сделать:**
```bash
# В .env.production обновите:
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-production-domain.com/api
EXPO_PUBLIC_BASE_URL=https://your-production-domain.com

# В app.config.js обновите:
const PRODUCTION_DOMAIN = 'your-production-domain.com';
```

**Примеры для разных платформ:**
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.render.com`
- Vercel: `https://your-app.vercel.app`
- Custom domain: `https://your-domain.com`

### 2. 🔐 JWT Secret
**Текущий статус:** ✅ Уже настроен безопасный секрет в `.env.production`

**Проверить:**
```bash
# В .env.production должен быть:
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8c94f4c8f5f167f44f4964e6c998dee827110c8c94f4c8f5f167f44f4964e6c998dee827110c8c94f4c8
```

### 3. 🌍 CORS Origins
**Файл:** `.env.production`

**Обновите на ваши реальные домены:**
```bash
CORS_ORIGIN=https://your-production-domain.com,https://www.your-production-domain.com,https://your-app.railway.app
```

### 4. 🗄️ Supabase Credentials
**Файлы:** `.env.production`, `lib/supabase.ts`

**Текущие настройки:**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://qcdqofdmflhgsabyopfe.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_WEBHOOK_SECRET=v1,whsec_q5gQEv92WR+tNnu0yVh7QEGRcKt3M/uZTMcRgcCRUCTGlN2Jtay2TbG3QuEpeeIURUyNdIOAuehkg53N
```

**Проверьте в Supabase Dashboard:**
1. Project URL правильный
2. Anon key актуальный
3. Webhook secret соответствует настройкам

### 5. 🗃️ Database URLs
**Файлы:** `.env.production`, `backend/config/index.ts`

**Railway MySQL (текущий):**
```bash
DATABASE_URL=mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway
```

**Supabase PostgreSQL (альтернатива):**
```bash
SUPABASE_DATABASE_URL=postgresql://postgres:KerLa_9595$@db.qcdqofdmflhgsabyopfe.supabase.co:5432/postgres
SUPABASE_POOLER_URL=postgresql://postgres.qcdqofdmflhgsabyopfe:KerLa_9595$@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 6. 🏠 Local IP (для разработки)
**Файл:** `.env`

**Найдите ваш IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig

# Обновите в .env:
LOCAL_IP=192.168.1.YOUR_IP
```

## 🔧 Дополнительные настройки Production

### Security Headers
```bash
ENABLE_HTTPS_REDIRECT=true
ENABLE_SECURITY_HEADERS=true
ENABLE_RATE_LIMITING=true
```

### Performance
```bash
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
CACHE_TTL=3600
```

### Monitoring
```bash
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
LOG_LEVEL=info
LOG_FORMAT=json
```

## 📋 Checklist перед деплоем

- [ ] Обновлены все API URLs на production домены
- [ ] JWT Secret изменен с дефолтного
- [ ] CORS Origins настроены для production доменов
- [ ] Supabase credentials проверены и актуальны
- [ ] Database URLs правильные для production
- [ ] Local IP обновлен для вашей сети (для разработки)
- [ ] Security настройки включены
- [ ] Monitoring настроен
- [ ] Тестирование на production окружении

## 🚨 Важные замечания

1. **Никогда не коммитьте production секреты в git**
2. **Используйте переменные окружения на production сервере**
3. **Регулярно ротируйте JWT секреты**
4. **Мониторьте логи и метрики**
5. **Настройте backup для базы данных**

## 🔗 Полезные ссылки

- [Railway Dashboard](https://railway.app/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Expo Dashboard](https://expo.dev/)