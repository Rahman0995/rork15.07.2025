#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск полного приложения (бэкенд + фронтенд)...');

// Запуск простого бэкенда
console.log('🔧 Запуск бэкенд сервера...');
const backend = spawn('node', ['start-backend-simple.js'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    HOST: '0.0.0.0'
  }
});

// Ждем немного, чтобы бэкенд запустился
setTimeout(() => {
  console.log('🔧 Запуск фронтенд приложения...');
  
  // Запуск фронтенда
  const frontend = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8081', '--clear'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  frontend.on('error', (error) => {
    console.error('❌ Ошибка запуска фронтенда:', error.message);
  });

  frontend.on('close', (code) => {
    console.log(`🏁 Фронтенд завершился с кодом ${code}`);
    // Останавливаем бэкенд если фронтенд завершился
    backend.kill('SIGINT');
  });

  // Graceful shutdown для фронтенда
  process.on('SIGINT', () => {
    console.log('\n🔄 Получен SIGINT, завершаем приложения...');
    frontend.kill('SIGINT');
    backend.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Получен SIGTERM, завершаем приложения...');
    frontend.kill('SIGTERM');
    backend.kill('SIGTERM');
    process.exit(0);
  });

}, 2000); // Ждем 2 секунды

backend.on('error', (error) => {
  console.error('❌ Ошибка запуска бэкенда:', error.message);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`🏁 Бэкенд завершился с кодом ${code}`);
  process.exit(code);
});