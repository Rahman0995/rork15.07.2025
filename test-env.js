#!/usr/bin/env node

console.log('🔍 Проверка переменных окружения...\n');

// Загружаем переменные из .env файла
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 Переменные окружения:');
console.log(`EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl || '❌ НЕ НАЙДЕН'}`);
console.log(`EXPO_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ НАЙДЕН' : '❌ НЕ НАЙДЕН'}`);

if (supabaseKey) {
  console.log(`Длина ключа: ${supabaseKey.length} символов`);
}

console.log('\n🔧 Проверка конфигурации:');

const isConfigured = supabaseUrl && supabaseKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseKey !== 'your-anon-key-here' &&
  supabaseUrl.includes('supabase.co') &&
  supabaseKey.length > 50;

console.log(`Supabase настроен: ${isConfigured ? '✅ ДА' : '❌ НЕТ'}`);

if (!isConfigured) {
  console.log('\n❗ Проблемы:');
  if (!supabaseUrl) console.log('- URL не найден');
  if (!supabaseKey) console.log('- Ключ не найден');
  if (supabaseUrl === 'https://your-project-ref.supabase.co') console.log('- URL не изменен с примера');
  if (supabaseKey === 'your-anon-key-here') console.log('- Ключ не изменен с примера');
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) console.log('- URL не содержит supabase.co');
  if (supabaseKey && supabaseKey.length <= 50) console.log('- Ключ слишком короткий');
}

console.log('\n📝 Для исправления:');
console.log('1. Убедитесь, что файл .env существует в корне проекта');
console.log('2. Добавьте правильные значения:');
console.log('   EXPO_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co');
console.log('   EXPO_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ');
console.log('3. Перезапустите приложение');