#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');

console.log('🔧 Освобождение порта 3000 и запуск приложения...');

function killPort3000() {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    
    if (isWindows) {
      // Windows
      exec('netstat -ano | findstr :3000', (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = [];
          
          lines.forEach(line => {
            const match = line.match(/\s+(\d+)$/);
            if (match) {
              pids.push(match[1]);
            }
          });
          
          if (pids.length > 0) {
            console.log(`🔪 Убиваем процессы на порту 3000: ${pids.join(', ')}`);
            pids.forEach(pid => {
              exec(`taskkill /PID ${pid} /F`, (err) => {
                if (err) console.log(`⚠️ Не удалось убить процесс ${pid}`);
              });
            });
          }
        }
        setTimeout(resolve, 2000);
      });
    } else {
      // Linux/Mac
      exec('lsof -ti:3000', (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n').filter(pid => pid);
          if (pids.length > 0) {
            console.log(`🔪 Убиваем процессы на порту 3000: ${pids.join(', ')}`);
            exec(`kill -9 ${pids.join(' ')}`, (err) => {
              if (err) console.log('⚠️ Некоторые процессы не удалось убить');
            });
          }
        }
        setTimeout(resolve, 2000);
      });
    }
  });
}

function killPort8081() {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    
    if (isWindows) {
      exec('netstat -ano | findstr :8081', (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = [];
          
          lines.forEach(line => {
            const match = line.match(/\s+(\d+)$/);
            if (match) {
              pids.push(match[1]);
            }
          });
          
          if (pids.length > 0) {
            console.log(`🔪 Убиваем процессы на порту 8081: ${pids.join(', ')}`);
            pids.forEach(pid => {
              exec(`taskkill /PID ${pid} /F`, (err) => {
                if (err) console.log(`⚠️ Не удалось убить процесс ${pid}`);
              });
            });
          }
        }
        setTimeout(resolve, 1000);
      });
    } else {
      exec('lsof -ti:8081', (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n').filter(pid => pid);
          if (pids.length > 0) {
            console.log(`🔪 Убиваем процессы на порту 8081: ${pids.join(', ')}`);
            exec(`kill -9 ${pids.join(' ')}`, (err) => {
              if (err) console.log('⚠️ Некоторые процессы не удалось убить');
            });
          }
        }
        setTimeout(resolve, 1000);
      });
    }
  });
}

async function startApp() {
  console.log('🚀 Запуск полного приложения...');
  
  // Запуск backend
  console.log('📡 Запуск backend сервера...');
  const backend = spawn('node', ['backend/index.ts'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' }
  });

  backend.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backend.stderr.on('data', (data) => {
    console.log(`[Backend Error] ${data.toString().trim()}`);
  });

  // Ждем запуска backend
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Запуск frontend
  console.log('📱 Запуск Expo приложения...');
  const frontend = spawn('npx', ['expo', 'start', '--port', '8082', '--clear'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  frontend.stdout.on('data', (data) => {
    console.log(`[Frontend] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.log(`[Frontend Error] ${data.toString().trim()}`);
  });

  console.log('🎉 Приложение запущено!');
  console.log('📱 Backend: http://localhost:3000');
  console.log('📱 Frontend: http://localhost:8082');
  console.log('🛑 Нажмите Ctrl+C для остановки');

  // Обработка завершения
  process.on('SIGINT', () => {
    console.log('\n🛑 Остановка приложения...');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    process.exit(0);
  });
}

async function main() {
  try {
    await killPort3000();
    await killPort8081();
    await startApp();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

main();