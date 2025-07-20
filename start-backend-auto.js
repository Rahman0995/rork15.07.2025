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

// Function to find available port starting from 3000
async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port <= startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}

async function startBackend() {
  try {
    console.log('🔍 Поиск свободного порта...');
    const port = await findAvailablePort(3000);
    console.log(`✅ Найден свободный порт: ${port}`);
    
    // Set environment variable for the port
    process.env.PORT = port.toString();
    process.env.EXPO_PUBLIC_RORK_API_BASE_URL = `http://localhost:${port}`;
    
    console.log(`🚀 Запуск backend сервера на порту ${port}...`);
    console.log(`🌐 API будет доступен по адресу: http://localhost:${port}/api`);
    
    // Start the backend server
    const backend = spawn('node', ['backend/index.ts'], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    backend.on('error', (error) => {
      console.error('❌ Ошибка запуска backend:', error);
      process.exit(1);
    });
    
    backend.on('exit', (code) => {
      console.log(`🔄 Backend процесс завершен с кодом ${code}`);
      if (code !== 0) {
        process.exit(code);
      }
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Остановка backend сервера...');
      backend.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Остановка backend сервера...');
      backend.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

startBackend();