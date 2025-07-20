#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Простой запуск приложения...');

// Запуск только frontend на свободном порту
console.log('📱 Запуск Expo на порту 8082...');

const frontend = spawn('npx', ['expo', 'start', '--port', '8082'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    EXPO_PUBLIC_RORK_API_BASE_URL: 'https://your-backend-url.com/api'
  }
});

frontend.on('error', (error) => {
  console.error('❌ Ошибка запуска frontend:', error.message);
  process.exit(1);
});

// Обработка завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы...');
  frontend.kill('SIGTERM');
  setTimeout(() => process.exit(0), 1000);
});

console.log('\n🎉 Frontend запущен!');
console.log('📱 Откройте http://localhost:8082 в браузере');
console.log('🛑 Нажмите Ctrl+C для остановки\n');