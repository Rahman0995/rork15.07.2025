#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Запуск приложения...');

// Функция для убийства процессов на портах
function killPortProcesses() {
  return new Promise((resolve) => {
    console.log('🔧 Освобождаем порты 3000, 3001, 8081, 8082...');
    
    const killCommands = [
      'pkill -f "node.*3000" || true',
      'pkill -f "node.*3001" || true', 
      'pkill -f "expo.*start" || true',
      'pkill -f "metro" || true',
      'lsof -ti:3000 | xargs kill -9 2>/dev/null || true',
      'lsof -ti:3001 | xargs kill -9 2>/dev/null || true',
      'lsof -ti:8081 | xargs kill -9 2>/dev/null || true',
      'lsof -ti:8082 | xargs kill -9 2>/dev/null || true'
    ];
    
    let completed = 0;
    const total = killCommands.length;
    
    killCommands.forEach(cmd => {
      exec(cmd, (error, stdout, stderr) => {
        completed++;
        if (completed === total) {
          console.log('✅ Порты освобождены');
          setTimeout(resolve, 1000);
        }
      });
    });
  });
}

let backendProcess = null;
let frontendProcess = null;

// Функция для запуска backend
function startBackend() {
  return new Promise((resolve) => {
    console.log('📡 Запуск backend сервера на порту 3001...');
    
    const backendPath = path.join(__dirname, 'backend');
    const env = { ...process.env, PORT: '3001', API_PORT: '3001' };
    
    backendProcess = spawn('bun', ['run', 'index.ts'], {
      cwd: backendPath,
      stdio: 'inherit',
      env: env
    });
    
    backendProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.log('⚠️ bun не найден, пробуем с node...');
        
        backendProcess = spawn('npx', ['ts-node', 'index.ts'], {
          cwd: backendPath,
          stdio: 'inherit',
          env: env
        });
      }
    });
    
    setTimeout(() => {
      console.log('✅ Backend запущен');
      resolve();
    }, 5000);
  });
}

// Функция для запуска frontend
function startFrontend() {
  return new Promise((resolve) => {
    console.log('📱 Запуск Expo приложения на порту 8082...');
    
    frontendProcess = spawn('npx', ['expo', 'start', '--port', '8082'], {
      stdio: 'inherit'
    });
    
    setTimeout(() => {
      console.log('✅ Frontend запущен');
      resolve();
    }, 8000);
  });
}

// Graceful shutdown
function cleanup() {
  console.log('🔄 Завершение процессов...');
  
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
  
  if (frontendProcess) {
    frontendProcess.kill('SIGTERM');
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Запуск приложения
async function startApp() {
  try {
    await killPortProcesses();
    
    await startBackend();
    console.log('⏳ Ждем 3 секунды перед запуском frontend...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await startFrontend();
    
    console.log('🎉 Приложение запущено!');
    console.log('📡 Backend: http://localhost:3001');
    console.log('📱 Frontend: http://localhost:8082');
    console.log('🛑 Нажмите Ctrl+C для остановки');
    
  } catch (error) {
    console.error('❌ Ошибка запуска:', error.message);
    cleanup();
  }
}

startApp();