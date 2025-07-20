#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');
const os = require('os');

// Функция для получения локального IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '192.168.1.100'; // fallback
}

// Функция для проверки доступности порта
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

// Функция для поиска свободного порта
async function findFreePort(startPort = 3000) {
  for (let port = startPort; port <= startPort + 100; port++) {
    if (await isPortFree(port)) {
      return port;
    }
  }
  throw new Error('Не удалось найти свободный порт');
}

// Функция для остановки процесса на порту
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const killProcess = spawn('lsof', ['-ti', `:${port}`], { stdio: 'pipe' });
    
    killProcess.stdout.on('data', (data) => {
      const pids = data.toString().trim().split('\n').filter(pid => pid);
      if (pids.length > 0) {
        console.log(`🔄 Останавливаем процессы на порту ${port}: ${pids.join(', ')}`);
        pids.forEach(pid => {
          try {
            process.kill(parseInt(pid), 'SIGTERM');
          } catch (e) {
            console.log(`⚠️ Не удалось остановить процесс ${pid}`);
          }
        });
      }
      resolve();
    });
    
    killProcess.on('error', () => resolve());
    killProcess.on('exit', () => resolve());
  });
}

async function startApp() {
  try {
    console.log('🚀 Запуск полного приложения...');
    
    // Остановить процессы на портах 3000 и 8081
    await killProcessOnPort(3000);
    await killProcessOnPort(8081);
    
    // Подождать немного
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Найти свободный порт для бэкенда
    const backendPort = await findFreePort(3000);
    const localIP = getLocalIP();
    
    console.log(`📡 Используем порт для бэкенда: ${backendPort}`);
    console.log(`🌐 Локальный IP: ${localIP}`);
    
    // Установить переменные окружения
    const env = {
      ...process.env,
      PORT: backendPort.toString(),
      NODE_ENV: 'development',
      RORK_API_BASE_URL: `http://${localIP}:${backendPort}`,
      EXPO_PUBLIC_RORK_API_BASE_URL: `http://${localIP}:${backendPort}`,
    };
    
    // Запустить простой бэкенд сервер
    console.log('📡 Запуск бэкенд сервера...');\n    const backend = spawn('node', ['start-backend-simple.js'], {\n      env: { ...env, PORT: backendPort },\n      stdio: 'inherit'\n    });\n    \n    backend.on('error', (error) => {\n      console.error('❌ Ошибка запуска бэкенда:', error);\n    });\n    \n    // Подождать запуска бэкенда\n    await new Promise(resolve => setTimeout(resolve, 3000));\n    \n    // Запустить Expo\n    console.log('📱 Запуск Expo приложения...');\n    const frontend = spawn('npx', ['expo', 'start', '--clear'], {\n      env,\n      stdio: 'inherit'\n    });\n    \n    frontend.on('error', (error) => {\n      console.error('❌ Ошибка запуска frontend:', error);\n    });\n    \n    // Обработка сигналов завершения\n    process.on('SIGINT', () => {\n      console.log('\\n🛑 Остановка приложения...');\n      backend.kill('SIGINT');\n      frontend.kill('SIGINT');\n      process.exit(0);\n    });\n    \n    process.on('SIGTERM', () => {\n      console.log('\\n🛑 Остановка приложения...');\n      backend.kill('SIGTERM');\n      frontend.kill('SIGTERM');\n      process.exit(0);\n    });\n    \n    console.log('\\n🎉 Приложение запущено!');\n    console.log(`📡 Backend: http://${localIP}:${backendPort}/api`);\n    console.log(`❤️ Health Check: http://${localIP}:${backendPort}/api/health`);\n    console.log('📱 Откройте Expo Go на телефоне и отсканируйте QR код');\n    console.log('🌐 Или откройте веб версию в браузере');\n    console.log('🛑 Нажмите Ctrl+C для остановки');\n    \n  } catch (error) {\n    console.error('❌ Ошибка:', error.message);\n    process.exit(1);\n  }\n}\n\nstartApp();