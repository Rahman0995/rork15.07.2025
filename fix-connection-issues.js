#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление проблем с подключением...\n');

// 1. Проверяем .env файл
console.log('1. Проверяем .env файл...');
const envPath = '.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env файл найден');
  
  // Проверяем наличие Supabase настроек
  if (envContent.includes('EXPO_PUBLIC_SUPABASE_URL') && envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ Настройки Supabase найдены в .env');
  } else {
    console.log('⚠️ Настройки Supabase не найдены в .env');
  }
} else {
  console.log('❌ .env файл не найден');
}

// 2. Проверяем package.json
console.log('\n2. Проверяем зависимости...');
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
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: НЕ УСТАНОВЛЕН`);
    }
  });
} else {
  console.log('❌ package.json не найден');
}

// 3. Создаем простой тестовый скрипт
console.log('\n3. Создаем тестовый скрипт...');
const testScript = `#!/usr/bin/env node

console.log('🔍 Тестирование переменных окружения...');

// Проверяем переменные окружения
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl || 'НЕ НАСТРОЕН');
console.log('Supabase Key:', supabaseKey ? 'НАСТРОЕН' : 'НЕ НАСТРОЕН');

if (supabaseUrl && supabaseKey) {
  console.log('✅ Supabase настроен');
} else {
  console.log('❌ Supabase не настроен');
  console.log('\\n💡 Добавьте в .env файл:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
}

// Тестируем подключение к бэкенду
console.log('\\n🔍 Тестирование подключения к бэкенду...');
const http = require('http');

const testUrls = [
  'http://localhost:3000/api/health',
  'http://127.0.0.1:3000/api/health',
  'http://192.168.1.100:3000/api/health'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ url, success: true, status: res.statusCode });
    });
    
    req.on('error', () => {
      resolve({ url, success: false });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ url, success: false });
    });
  });
}

async function testBackend() {
  for (const url of testUrls) {
    const result = await testUrl(url);
    if (result.success) {
      console.log(\`✅ Бэкенд доступен: \${url}\`);
      return;
    } else {
      console.log(\`❌ Недоступен: \${url}\`);
    }
  }
  
  console.log('❌ Бэкенд недоступен на всех URL');
  console.log('\\n💡 Запустите бэкенд:');
  console.log('node start-backend-simple.js');
}

testBackend().catch(console.error);
`;

fs.writeFileSync('test-env-and-backend.js', testScript);
console.log('✅ Создан test-env-and-backend.js');

// 4. Создаем скрипт для исправления проблем
console.log('\n4. Создаем скрипт исправления...');
const fixScript = `#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Исправление проблем...');

// Проверяем и исправляем .env файл
if (!fs.existsSync('.env')) {
  console.log('Создаем .env файл...');
  const envContent = \`# Development Environment Variables
NODE_ENV=development

# Replace with your actual production API URL when deploying
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000

# Local IP for mobile testing (replace with your actual IP)
LOCAL_IP=192.168.1.100

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://qcdqofdmflhgsabyopfe.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZHFvZmRtZmxoZ3NhYnlvcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODkxNTMsImV4cCI6MjA2ODU2NTE1M30.qYn87AuahL4H9Tin8nVIKlH9-3UnCmtHGEBOA3RhyjU

# Database Configuration
DATABASE_URL=mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
\`;
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env файл создан');
} else {
  console.log('✅ .env файл уже существует');
}

console.log('\\n🎉 Исправления завершены!');
console.log('\\n💡 Следующие шаги:');
console.log('1. Запустите: node test-env-and-backend.js');
console.log('2. Запустите бэкенд: node start-backend-simple.js');
console.log('3. Запустите приложение: npm start');
`;

fs.writeFileSync('fix-issues.js', fixScript);
console.log('✅ Создан fix-issues.js');

console.log('\n🎉 Диагностика завершена!');
console.log('\n💡 Для исправления проблем выполните:');
console.log('node fix-issues.js');
console.log('\n💡 Для тестирования выполните:');
console.log('node test-env-and-backend.js');