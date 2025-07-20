#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск полного приложения...\n');

// Функция для запуска процесса
function startProcess(command, args, name, color = '\x1b[36m') {
  const process = spawn(command, args, {
    stdio: 'pipe',
    cwd: path.resolve('.'),
    env: { ...process.env }
  });

  // Обработка вывода с цветами
  process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${color}[${name}]\x1b[0m ${line}`);
    });
  });

  process.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`\x1b[31m[${name} ERROR]\x1b[0m ${line}`);
    });
  });

  process.on('error', (error) => {
    console.error(`\x1b[31m❌ Ошибка запуска ${name}:\x1b[0m`, error.message);
  });

  return process;
}

console.log('1️⃣ Запуск бэкенда...');
const backend = startProcess('node', ['start-backend-simple.js'], 'BACKEND', '\x1b[32m');

// Ждем немного, чтобы бэкенд запустился
setTimeout(() => {
  console.log('\n2️⃣ Запуск фронтенда...');
  const frontend = startProcess('npx', ['expo', 'start', '--clear'], 'FRONTEND', '\x1b[34m');

  // Обработка сигналов для корректного завершения
  process.on('SIGINT', () => {
    console.log('\n🔄 Получен SIGINT, завершаем процессы...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    setTimeout(() => process.exit(0), 1000);
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Получен SIGTERM, завершаем процессы...');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    setTimeout(() => process.exit(0), 1000);
  });

}, 3000);

console.log('\n💡 Инструкции:');
console.log('- Бэкенд будет доступен на http://localhost:3000');
console.log('- Фронтенд откроется в браузере автоматически');
console.log('- Для мобильного устройства отсканируйте QR код');
console.log('- Нажмите Ctrl+C для остановки всех процессов');
console.log('\n🔍 Логи:');
console.log('- \x1b[32m[BACKEND]\x1b[0m - сообщения бэкенда');
console.log('- \x1b[34m[FRONTEND]\x1b[0m - сообщения фронтенда');
console.log('- \x1b[31m[ERROR]\x1b[0m - ошибки\n');