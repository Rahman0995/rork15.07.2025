#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление конфигурации Netlify...');
console.log('=====================================');

// 1. Копируем правильные файлы
try {
  // Копируем package.json для Netlify
  if (fs.existsSync('package.netlify.json')) {
    fs.copyFileSync('package.json', 'package.json.backup');
    fs.copyFileSync('package.netlify.json', 'package.json');
    console.log('✅ package.json обновлен для Netlify');
  }

  // Копируем app.config.js для Netlify
  if (fs.existsSync('app.config.netlify.js')) {
    fs.copyFileSync('app.config.js', 'app.config.js.backup');
    fs.copyFileSync('app.config.netlify.js', 'app.config.js');
    console.log('✅ app.config.js обновлен для Netlify');
  }

  console.log('');
  console.log('🎯 ИНСТРУКЦИИ ДЛЯ ДЕПЛОЯ:');
  console.log('');
  console.log('1. 🌐 Перейдите на https://netlify.com');
  console.log('2. 🔐 Войдите через GitHub');
  console.log('3. ➕ Нажмите "New site from Git"');
  console.log('4. 📂 Выберите ваш репозиторий');
  console.log('5. ⚙️  Настройки сборки:');
  console.log('   - Build command: npm run build:web');
  console.log('   - Publish directory: dist');
  console.log('6. 🚀 Нажмите "Deploy site"');
  console.log('');
  console.log('⚠️  ВАЖНО:');
  console.log('Обновите EXPO_PUBLIC_API_URL в netlify.toml');
  console.log('с вашим реальным URL бэкенда');
  console.log('');
  console.log('💡 Пример:');
  console.log('EXPO_PUBLIC_API_URL = "https://your-app.railway.app/api"');

} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}