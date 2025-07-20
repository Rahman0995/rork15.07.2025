#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Быстрый запуск приложения...');
console.log('📡 Запуск backend сервера...');

// Start backend server
const backend = spawn('node', ['start-backend-simple.js'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`[Backend] ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`[Backend Error] ${data}`);
});

// Wait for backend to start
setTimeout(() => {
  console.log('📱 Запуск Expo приложения...');
  
  // Start frontend
  const frontend = spawn('npx', ['expo', 'start', '--clear'], {
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  frontend.stdout.on('data', (data) => {
    process.stdout.write(`[Frontend] ${data}`);
  });
  
  frontend.stderr.on('data', (data) => {
    process.stderr.write(`[Frontend Error] ${data}`);
  });
  
  // Handle cleanup
  const cleanup = () => {
    console.log('\n🛑 Остановка приложения...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  console.log('🎉 Приложение запущено!');
  console.log('📱 Откройте Expo Go на телефоне и отсканируйте QR код');
  console.log('🌐 Или откройте веб версию в браузере');
  console.log('🛑 Нажмите Ctrl+C для остановки');
  
}, 2000);