#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔧 Исправляем проблему с файловыми наблюдателями...');

// Устанавливаем переменные окружения для отключения watchman
process.env.WATCHMAN_DISABLE_WATCH = '1';
process.env.EXPO_NO_DOTENV = '1';

// Очищаем кэши
console.log('🧹 Очищаем кэши...');
try {
  if (fs.existsSync('node_modules/.cache')) {
    fs.rmSync('node_modules/.cache', { recursive: true, force: true });
  }
  if (fs.existsSync('.expo')) {
    fs.rmSync('.expo', { recursive: true, force: true });
  }
  if (fs.existsSync('.metro')) {
    fs.rmSync('.metro', { recursive: true, force: true });
  }
} catch (error) {
  console.log('⚠️  Не удалось очистить некоторые кэши:', error.message);
}

console.log('🚀 Запускаем Expo...');

// Запускаем expo с отключенным watchman
const expo = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8081'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    WATCHMAN_DISABLE_WATCH: '1',
    EXPO_NO_DOTENV: '1'
  }
});

expo.on('close', (code) => {
  console.log(`Expo завершился с кодом ${code}`);
});

expo.on('error', (error) => {
  console.error('Ошибка запуска Expo:', error);
});