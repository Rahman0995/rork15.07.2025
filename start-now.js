#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Запуск приложения...');

// Сначала запускаем простой бэкенд
console.log('🔧 Запуск бэкенд сервера...');

const backend = spawn('node', ['start-backend-simple.js'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    HOST: '0.0.0.0'
  }
});

let backendReady = false;

backend.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('BACKEND:', output.trim());
  
  if (output.includes('запущен на') || output.includes('running on')) {
    backendReady = true;
    startFrontend();
  }
});

backend.stderr.on('data', (data) => {
  console.error('BACKEND ERROR:', data.toString().trim());
});

backend.on('error', (error) => {
  console.error('❌ Ошибка запуска бэкенда:', error.message);
  process.exit(1);
});

// Запускаем фронтенд после того, как бэкенд готов
function startFrontend() {
  if (!backendReady) return;
  
  console.log('🔧 Запуск фронтенд приложения...');
  
  const frontend = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8081'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  frontend.on('error', (error) => {
    console.error('❌ Ошибка запуска фронтенда:', error.message);
    backend.kill();
    process.exit(1);
  });

  frontend.on('close', (code) => {
    console.log(`🏁 Фронтенд завершился с кодом ${code}`);
    backend.kill();
    process.exit(code);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🔄 Завершение работы...');
    frontend.kill('SIGINT');
    backend.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Завершение работы...');
    frontend.kill('SIGTERM');
    backend.kill('SIGTERM');
    process.exit(0);
  });
}

// Если бэкенд не запустился за 10 секунд, запускаем фронтенд принудительно
setTimeout(() => {
  if (!backendReady) {
    console.log('⚠️ Бэкенд не ответил, запускаем фронтенд с mock данными...');
    backendReady = true;
    startFrontend();
  }
}, 10000);