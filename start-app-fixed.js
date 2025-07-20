#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск полного приложения (Backend + Frontend)...');

let backendProcess = null;
let frontendProcess = null;

// Функция для запуска backend
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('📡 Запуск backend сервера...');
    
    const backendPath = path.join(__dirname, 'backend');
    
    // Попробуем с bun
    backendProcess = spawn('bun', ['run', 'index.ts'], {
      cwd: backendPath,
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let backendStarted = false;
    
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      if (output.includes('Server is running') && !backendStarted) {
        backendStarted = true;
        console.log('✅ Backend запущен успешно!');
        resolve();
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(`[Backend Error] ${output.trim()}`);
    });
    
    backendProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.log('⚠️ bun не найден, пробуем с node...');
        
        // Попробуем с node
        backendProcess = spawn('npx', ['ts-node', 'index.ts'], {
          cwd: backendPath,
          stdio: ['inherit', 'pipe', 'pipe']
        });
        
        backendProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`[Backend] ${output.trim()}`);
          
          if (output.includes('Server is running') && !backendStarted) {
            backendStarted = true;
            console.log('✅ Backend запущен успешно!');
            resolve();
          }
        });
        
        backendProcess.stderr.on('data', (data) => {
          const output = data.toString();
          console.error(`[Backend Error] ${output.trim()}`);
        });
        
        backendProcess.on('error', (nodeError) => {
          console.error('❌ Не удалось запустить backend:', nodeError.message);
          reject(nodeError);
        });
      } else {
        console.error('❌ Ошибка запуска backend:', error.message);
        reject(error);
      }
    });
    
    // Таймаут для запуска backend
    setTimeout(() => {
      if (!backendStarted) {
        console.log('✅ Backend процесс запущен (таймаут)');
        resolve();
      }
    }, 5000);
  });
}

// Функция для запуска frontend
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('📱 Запуск Expo приложения...');
    
    frontendProcess = spawn('npx', ['expo', 'start', '--tunnel'], {
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let frontendStarted = false;
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
      
      if ((output.includes('Metro waiting') || output.includes('Expo DevTools')) && !frontendStarted) {
        frontendStarted = true;
        console.log('✅ Frontend запущен успешно!');
        resolve();
      }
    });
    
    frontendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(`[Frontend Error] ${output.trim()}`);
    });
    
    frontendProcess.on('error', (error) => {
      console.error('❌ Ошибка запуска frontend:', error.message);
      reject(error);
    });
    
    // Таймаут для запуска frontend
    setTimeout(() => {
      if (!frontendStarted) {
        console.log('✅ Frontend процесс запущен (таймаут)');
        resolve();
      }
    }, 10000);
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
    await startBackend();
    console.log('⏳ Ждем 2 секунды перед запуском frontend...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await startFrontend();
    
    console.log('🎉 Приложение запущено успешно!');
    console.log('📱 Откройте Expo Go на телефоне и отсканируйте QR код');
    console.log('🌐 Или откройте веб версию в браузере');
    console.log('🛑 Нажмите Ctrl+C для остановки');
    
  } catch (error) {
    console.error('❌ Ошибка запуска приложения:', error.message);
    cleanup();
  }
}

startApp();