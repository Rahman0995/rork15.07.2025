#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Запуск backend сервера...');

// Kill any process using port 3000
exec('lsof -ti:3000', (error, stdout, stderr) => {
  if (stdout) {
    const pids = stdout.trim().split('\n');
    console.log(`🔄 Найдено ${pids.length} процесс(ов) на порту 3000. Завершаем их...`);
    
    pids.forEach(pid => {
      if (pid) {
        exec(`kill -9 ${pid}`, (killError) => {
          if (!killError) {
            console.log(`✅ Завершен процесс ${pid}`);
          }
        });
      }
    });
    
    setTimeout(startBackend, 2000);
  } else {
    console.log('✅ Порт 3000 свободен');
    startBackend();
  }
});

function startBackend() {
  console.log('🚀 Запуск простого backend сервера на порту 3000...');
  
  const backend = spawn('node', ['start-backend-simple.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: '0.0.0.0'
    }
  });
  
  backend.on('error', (error) => {
    console.error('❌ Ошибка запуска backend:', error);
    process.exit(1);
  });
  
  backend.on('close', (code) => {
    console.log(`🔄 Backend процесс завершен с кодом ${code}`);
    process.exit(code);
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🔄 Завершение backend...');
    backend.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('🔄 Завершение backend...');
    backend.kill('SIGTERM');
    process.exit(0);
  });
}