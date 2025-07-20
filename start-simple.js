#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Запуск приложения...');

// Запуск только frontend с правильным портом
console.log('📱 Запуск Expo приложения на порту 8082...');

const frontendProcess = spawn('npx', ['expo', 'start', '--port', '8082'], {
  stdio: 'inherit',
  shell: true
});

frontendProcess.on('error', (error) => {
  console.error('❌ Ошибка запуска frontend:', error);
});

// Обработка сигналов для graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Остановка приложения...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Остановка приложения...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Приложение запущено!');
console.log('📱 Откройте Expo Go на телефоне и отсканируйте QR код');
console.log('🌐 Или откройте веб версию в браузере');
console.log('🛑 Нажмите Ctrl+C для остановки');