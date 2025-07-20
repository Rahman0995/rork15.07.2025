#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Запуск приложения с очисткой портов...');

// Функция для убийства процессов на портах
function killPortProcesses() {
  return new Promise((resolve) => {
    console.log('🔧 Освобождаем порты 3000 и 8081...');
    
    // Убиваем процессы на портах 3000 и 8081
    const killCommands = [
      'pkill -f "node.*3000" || true',
      'pkill -f "expo.*start" || true',
      'pkill -f "metro" || true',
      'lsof -ti:3000 | xargs kill -9 2>/dev/null || true',
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
          setTimeout(resolve, 1000); // Ждем секунду
        }
      });
    });
  });
}

let backendProcess = null;
let frontendProcess = null;

// Функция для запуска backend на порту 3001
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('📡 Запуск backend сервера на порту 3001...');
    
    const backendPath = path.join(__dirname, 'backend');
    
    // Устанавливаем переменную окружения для порта
    const env = { ...process.env, PORT: '3001' };
    
    // Попробуем с bun
    backendProcess = spawn('bun', ['run', 'index.ts'], {
      cwd: backendPath,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: env
    });
    
    let backendStarted = false;
    
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      if ((output.includes('Server is running') || output.includes('3001')) && !backendStarted) {
        backendStarted = true;
        console.log('✅ Backend запущен успешно на порту 3001!');
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
          stdio: ['inherit', 'pipe', 'pipe'],
          env: env
        });
        
        backendProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`[Backend] ${output.trim()}`);
          
          if ((output.includes('Server is running') || output.includes('3001')) && !backendStarted) {
            backendStarted = true;
            console.log('✅ Backend запущен успешно на порту 3001!');
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
    }, 8000);
  });
}

// Функция для запуска frontend на порту 8082
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('📱 Запуск Expo приложения на порту 8082...');
    
    frontendProcess = spawn('npx', ['expo', 'start', '--port', '8082', '--tunnel'], {
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let frontendStarted = false;
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
      
      if ((output.includes('Metro waiting') || output.includes('Expo DevTools') || output.includes('8082')) && !frontendStarted) {
        frontendStarted = true;
        console.log('✅ Frontend запущен успешно на порту 8082!');
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
    }, 15000);
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
    
    console.log('🎉 Приложение запущено успешно!');
    console.log('📡 Backend: http://localhost:3001');
    console.log('📱 Frontend: http://localhost:8082');
    console.log('📱 Откройте Expo Go на телефоне и отсканируйте QR код');
    console.log('🌐 Или откройте веб версию в браузере');
    console.log('🛑 Нажмите Ctrl+C для остановки');
    
  } catch (error) {
    console.error('❌ Ошибка запуска приложения:', error.message);
    cleanup();
  }
}

startApp();