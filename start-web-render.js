#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Запускаем веб-сервер для Render...');

const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

console.log(`📁 Папка с файлами: ${distPath}`);
console.log(`🌐 Порт: ${port}`);

// Проверяем существование папки dist
if (!fs.existsSync(distPath)) {
  console.error('❌ Папка dist не найдена! Проверьте сборку.');
  process.exit(1);
}

// Проверяем содержимое папки dist
const files = fs.readdirSync(distPath);
console.log('📋 Файлы в dist:', files);

if (files.length === 0) {
  console.error('❌ Папка dist пуста! Проверьте сборку.');
  process.exit(1);
}

// Запускаем serve с правильными параметрами
const serve = spawn('npx', ['serve', distPath, '-p', port, '-s'], {
  stdio: 'inherit',
  env: { ...process.env }
});

serve.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error);
  process.exit(1);
});

serve.on('close', (code) => {
  console.log(`🔚 Сервер завершился с кодом ${code}`);
  process.exit(code);
});

// Обработка сигналов завершения
process.on('SIGTERM', () => {
  console.log('📴 Получен сигнал SIGTERM, завершаем сервер...');
  serve.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📴 Получен сигнал SIGINT, завершаем сервер...');
  serve.kill('SIGINT');
});