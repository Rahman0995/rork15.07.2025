#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск бэкенд сервера...');

// Запуск бэкенда с помощью bun
const backend = spawn('bun', ['run', 'backend/index.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    HOST: '0.0.0.0'
  }
});

backend.on('error', (error) => {
  console.error('❌ Ошибка запуска бэкенда:', error.message);
  
  // Попробуем с node
  console.log('🔄 Пробуем запустить с node...');
  const nodeBackend = spawn('node', ['-r', 'ts-node/register', 'backend/index.ts'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: '0.0.0.0'
    }
  });
  
  nodeBackend.on('error', (nodeError) => {
    console.error('❌ Ошибка запуска с node:', nodeError.message);
    process.exit(1);
  });
});

backend.on('close', (code) => {
  console.log(`🏁 Бэкенд завершился с кодом ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Получен SIGINT, завершаем бэкенд...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Получен SIGTERM, завершаем бэкенд...');
  backend.kill('SIGTERM');
  process.exit(0);
});