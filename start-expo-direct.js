#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Запуск Expo приложения...');

// Запускаем expo start с tunnel
const expo = spawn('npx', ['expo', 'start', '--tunnel'], {
  stdio: 'inherit'
});

expo.on('error', (error) => {
  console.error('❌ Ошибка запуска Expo:', error.message);
  
  // Попробуем без tunnel
  console.log('🔄 Пробуем запустить без tunnel...');
  const expoLocal = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit'
  });
  
  expoLocal.on('error', (localError) => {
    console.error('❌ Ошибка запуска Expo без tunnel:', localError.message);
    process.exit(1);
  });
});

expo.on('close', (code) => {
  console.log(`Expo процесс завершен с кодом ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Получен SIGINT, завершаем Expo...');
  expo.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔄 Получен SIGTERM, завершаем Expo...');
  expo.kill('SIGTERM');
  process.exit(0);
});