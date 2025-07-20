#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to find available port starting from given port
async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port <= startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}

async function startApp() {
  try {
    console.log('🚀 Запуск приложения...');
    
    // Find available port for backend
    console.log('🔍 Поиск свободного порта для backend...');
    const backendPort = await findAvailablePort(3000);
    console.log(`✅ Backend будет запущен на порту: ${backendPort}`);
    
    // Set environment variables
    process.env.PORT = backendPort.toString();
    process.env.EXPO_PUBLIC_RORK_API_BASE_URL = `http://localhost:${backendPort}`;
    
    console.log(`🌐 API URL: http://localhost:${backendPort}/api`);
    
    // Start backend first
    console.log('📡 Запуск backend сервера...');
    const backend = spawn('node', ['start-backend-simple.js'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env }
    });
    
    // Log backend output with prefix
    backend.stdout.on('data', (data) => {
      process.stdout.write(`[Backend] ${data}`);
    });
    
    backend.stderr.on('data', (data) => {
      process.stderr.write(`[Backend Error] ${data}`);
    });
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start frontend
    console.log('📱 Запуск Expo приложения...');
    const frontend = spawn('npx', ['expo', 'start', '--clear'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env }
    });
    
    // Log frontend output with prefix
    frontend.stdout.on('data', (data) => {
      process.stdout.write(`[Frontend] ${data}`);
    });
    
    frontend.stderr.on('data', (data) => {
      process.stderr.write(`[Frontend Error] ${data}`);
    });
    
    // Handle process termination
    const cleanup = () => {
      console.log('\n🛑 Остановка приложения...');
      backend.kill('SIGINT');
      frontend.kill('SIGINT');
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    // Handle backend exit
    backend.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Backend завершился с ошибкой (код ${code})`);
      }
    });
    
    // Handle frontend exit
    frontend.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Frontend завершился с ошибкой (код ${code})`);
      }
    });
    
    console.log('🎉 Приложение запущено!');
    console.log('📱 Откройте Expo Go на телефоне и отсканируйте QR код');
    console.log('🌐 Или откройте веб версию в браузере');
    console.log('🛑 Нажмите Ctrl+C для остановки');
    
  } catch (error) {
    console.error('❌ Ошибка запуска:', error.message);
    process.exit(1);
  }
}

startApp();