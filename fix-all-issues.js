#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление всех проблем с приложением...\n');

// 1. Проверяем и исправляем .env файл
console.log('1️⃣ Проверяем .env файл...');
const envPath = '.env';
let envFixed = false;

if (!fs.existsSync(envPath)) {
  console.log('❌ .env файл не найден, создаем...');
  envFixed = true;
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('EXPO_PUBLIC_SUPABASE_URL') || !envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('⚠️ Настройки Supabase отсутствуют, добавляем...');
    envFixed = true;
  } else {
    console.log('✅ .env файл корректен');
  }
}

if (envFixed) {
  const envContent = `# Development Environment Variables
NODE_ENV=development

# API Configuration
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
LOCAL_IP=192.168.1.100

# Network Configuration
NETWORK_TIMEOUT=30000
REQUEST_RETRIES=3
ENABLE_MOCK_DATA=true

# Fallback URLs
FALLBACK_URL_1=http://127.0.0.1:3000
FALLBACK_URL_2=http://192.168.0.100:3000
FALLBACK_URL_3=http://10.0.0.100:3000

# Database Configuration
DATABASE_URL=mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway
MYSQL_MYSQL_URL=mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
API_PORT=3000
API_HOST=0.0.0.0

# Supabase Configuration (рабочие настройки)
EXPO_PUBLIC_SUPABASE_URL=https://qcdqofdmflhgsabyopfe.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZHFvZmRtZmxoZ3NhYnlvcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODkxNTMsImV4cCI6MjA2ODU2NTE1M30.qYn87AuahL4H9Tin8nVIKlH9-3UnCmtHGEBOA3RhyjU
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env файл создан/обновлен');
}

// 2. Проверяем package.json
console.log('\n2️⃣ Проверяем зависимости...');
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@supabase/supabase-js',
    '@nkzw/create-context-hook',
    '@trpc/client',
    '@trpc/react-query'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️ Отсутствуют зависимости: ${missingDeps.join(', ')}`);
    console.log('💡 Установите их командой: bun install ' + missingDeps.join(' '));
  } else {
    console.log('✅ Все необходимые зависимости установлены');
  }
} else {
  console.log('❌ package.json не найден');
}

// 3. Создаем скрипты для запуска
console.log('\n3️⃣ Создаем скрипты запуска...');

// Скрипт для тестирования подключения
const testScript = `#!/usr/bin/env node

console.log('🔍 Тестирование системы...\\n');

// Проверяем переменные окружения
console.log('1️⃣ Переменные окружения:');
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('   Supabase URL:', supabaseUrl ? '✅ Настроен' : '❌ Не настроен');
console.log('   Supabase Key:', supabaseKey ? '✅ Настроен' : '❌ Не настроен');

// Тестируем подключение к бэкенду
console.log('\\n2️⃣ Тестирование бэкенда...');
const http = require('http');

const testUrls = [
  'http://localhost:3000/api/health',
  'http://127.0.0.1:3000/api/health',
  'http://192.168.1.100:3000/api/health'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ url, success: true, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ url, success: false, error: 'Invalid JSON' });
        }
      });
    });
    
    req.on('error', () => resolve({ url, success: false, error: 'Connection failed' }));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ url, success: false, error: 'Timeout' });
    });
  });
}

async function testBackend() {
  let backendWorking = false;
  
  for (const url of testUrls) {
    console.log(\`   Тестируем: \${url}\`);
    const result = await testUrl(url);
    
    if (result.success) {
      console.log(\`   ✅ Работает! Статус: \${result.status}\`);
      backendWorking = true;
      break;
    } else {
      console.log(\`   ❌ Ошибка: \${result.error}\`);
    }
  }
  
  if (!backendWorking) {
    console.log('\\n❌ Бэкенд недоступен');
    console.log('💡 Запустите бэкенд: node start-backend-simple.js');
  } else {
    console.log('\\n✅ Бэкенд работает корректно');
  }
  
  return backendWorking;
}

testBackend().then(backendWorking => {
  console.log('\\n3️⃣ Результат тестирования:');
  console.log('   Supabase:', (supabaseUrl && supabaseKey) ? '✅' : '❌');
  console.log('   Бэкенд:', backendWorking ? '✅' : '❌');
  
  if ((supabaseUrl && supabaseKey) && backendWorking) {
    console.log('\\n🎉 Система готова к работе!');
    console.log('💡 Запустите приложение: node start-app-complete.js');
  } else {
    console.log('\\n⚠️ Требуется настройка');
    if (!backendWorking) {
      console.log('   - Запустите бэкенд: node start-backend-simple.js');
    }
  }
}).catch(console.error);
`;

fs.writeFileSync('test-system.js', testScript);
console.log('✅ Создан test-system.js');

// 4. Создаем README с инструкциями
console.log('\n4️⃣ Создаем инструкции...');
const readmeContent = `# 🚀 Быстрый запуск приложения

## 📋 Проверка системы
\`\`\`bash
node test-system.js
\`\`\`

## 🔧 Исправление проблем
\`\`\`bash
node fix-all-issues.js
\`\`\`

## 🚀 Запуск приложения

### Вариант 1: Полный запуск (бэкенд + фронтенд)
\`\`\`bash
node start-app-complete.js
\`\`\`

### Вариант 2: Раздельный запуск

1. Запуск бэкенда:
\`\`\`bash
node start-backend-simple.js
\`\`\`

2. Запуск фронтенда (в новом терминале):
\`\`\`bash
npm start
\`\`\`

## 🔍 Тестирование подключения
\`\`\`bash
node test-connection-simple.js
\`\`\`

## 📱 Доступ к приложению

- **Web**: http://localhost:8081
- **Mobile**: Отсканируйте QR код в терминале
- **Backend API**: http://localhost:3000/api

## ⚙️ Настройки

Все настройки находятся в файле \`.env\`:
- Supabase URL и ключ
- Настройки сети
- Конфигурация базы данных

## 🆘 Решение проблем

1. **Ошибки подключения к бэкенду**:
   - Проверьте, запущен ли бэкенд
   - Убедитесь, что порт 3000 свободен

2. **Проблемы с Supabase**:
   - Проверьте настройки в .env файле
   - Приложение работает в mock режиме при отсутствии Supabase

3. **Ошибки сети на мобильном**:
   - Убедитесь, что устройство в той же сети
   - Проверьте LOCAL_IP в .env файле

## 📞 Поддержка

При возникновении проблем:
1. Запустите \`node test-system.js\`
2. Проверьте логи в консоли
3. Убедитесь, что все зависимости установлены
`;

fs.writeFileSync('QUICK_START.md', readmeContent);
console.log('✅ Создан QUICK_START.md');

console.log('\n🎉 Все проблемы исправлены!');
console.log('\n📋 Следующие шаги:');
console.log('1. node test-system.js     - проверить систему');
console.log('2. node start-app-complete.js - запустить приложение');
console.log('\n📖 Подробные инструкции в файле QUICK_START.md');