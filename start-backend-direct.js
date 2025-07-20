#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск backend сервера...');

// Попробуем запустить backend с помощью bun
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Запускаем backend/index.ts с помощью bun
const backend = spawn('bun', ['run', 'index.ts'], {
  stdio: 'inherit',
  cwd: backendPath
});

backend.on('error', (error) => {
  console.error('❌ Ошибка запуска backend:', error.message);
  
  // Если bun не найден, попробуем с node и ts-node
  console.log('🔄 Пробуем запустить с node...');
  const nodeBackend = spawn('npx', ['ts-node', 'index.ts'], {
    stdio: 'inherit',
    cwd: backendPath
  });
  
  nodeBackend.on('error', (nodeError) => {
    console.error('❌ Ошибка запуска с node:', nodeError.message);
    process.exit(1);
  });
});

backend.on('close', (code) => {
  console.log(`Backend процесс завершен с кодом ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Получен SIGINT, завершаем backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔄 Получен SIGTERM, завершаем backend...');
  backend.kill('SIGTERM');
  process.exit(0);
});