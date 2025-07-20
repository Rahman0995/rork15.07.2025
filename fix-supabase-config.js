#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление конфигурации Supabase...\n');

// Читаем .env файл
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ Файл .env не найден!');
  console.log('Создайте файл .env в корне проекта с настройками Supabase.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log('📋 Текущие настройки Supabase:');

let hasUrl = false;
let hasKey = false;
let urlValue = '';
let keyValue = '';

lines.forEach(line => {
  if (line.startsWith('EXPO_PUBLIC_SUPABASE_URL=')) {
    hasUrl = true;
    urlValue = line.split('=')[1] || '';
    console.log(`URL: ${urlValue || '❌ НЕ НАЙДЕН'}`);
  }
  if (line.startsWith('EXPO_PUBLIC_SUPABASE_ANON_KEY=')) {
    hasKey = true;
    keyValue = line.split('=')[1] || '';
    console.log(`Key: ${keyValue ? '✅ НАЙДЕН' : '❌ НЕ НАЙДЕН'}`);
    if (keyValue) {
      console.log(`Длина ключа: ${keyValue.length} символов`);
    }
  }
});

console.log('\n🔍 Проверка конфигурации:');

const isConfigured = urlValue && keyValue && 
  urlValue !== 'https://your-project-ref.supabase.co' && 
  keyValue !== 'your-anon-key-here' &&
  urlValue.includes('supabase.co') &&
  keyValue.length > 50;

console.log(`Supabase настроен: ${isConfigured ? '✅ ДА' : '❌ НЕТ'}`);

if (!isConfigured) {
  console.log('\n❗ Проблемы:');
  if (!hasUrl || !urlValue) console.log('- URL не найден или пустой');
  if (!hasKey || !keyValue) console.log('- Ключ не найден или пустой');
  if (urlValue === 'https://your-project-ref.supabase.co') console.log('- URL не изменен с примера');
  if (keyValue === 'your-anon-key-here') console.log('- Ключ не изменен с примера');
  if (urlValue && !urlValue.includes('supabase.co')) console.log('- URL не содержит supabase.co');
  if (keyValue && keyValue.length <= 50) console.log('- Ключ слишком короткий (возможно неполный)');
  
  console.log('\n📝 Для исправления:');
  console.log('1. Зайдите на https://supabase.com');
  console.log('2. Создайте новый проект или откройте существующий');
  console.log('3. Перейдите в Settings > API');
  console.log('4. Скопируйте Project URL и anon public key');
  console.log('5. Обновите файл .env:');
  console.log('   EXPO_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co');
  console.log('   EXPO_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ');
  console.log('6. Перезапустите приложение');
} else {
  console.log('\n✅ Конфигурация Supabase корректна!');
  console.log('Если приложение все еще показывает "не настроен", попробуйте:');
  console.log('1. Перезапустить приложение');
  console.log('2. Очистить кэш: npm start -- --clear');
  console.log('3. Проверить консоль на наличие ошибок');
}

console.log('\n🔄 Для запуска этой проверки снова: node fix-supabase-config.js');