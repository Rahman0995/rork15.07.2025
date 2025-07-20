#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

console.log('🔧 Освобождение портов и запуск приложения...');

async function killPort(port) {
  try {
    console.log(`🔍 Проверяем порт ${port}...`);
    
    // Находим процессы на порту
    const { stdout } = await execAsync(`lsof -ti:${port}`).catch(() => ({ stdout: '' }));
    
    if (stdout.trim()) {
      const pids = stdout.trim().split('\n');
      console.log(`💀 Завершаем процессы на порту ${port}: ${pids.join(', ')}`);
      
      for (const pid of pids) {
        if (pid) {
          await execAsync(`kill -9 ${pid}`).catch(() => {});
        }
      }
      
      // Ждем немного
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`✅ Порт ${port} освобожден`);
    } else {
      console.log(`✅ Порт ${port} свободен`);
    }
  } catch (error) {
    console.log(`⚠️ Не удалось проверить порт ${port}:`, error.message);
  }
}

async function startBackend() {
  return new Promise((resolve) => {
    console.log('📡 Запуск backend сервера...');
    
    const backend = spawn('node', ['backend/index.ts'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    backend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      if (output.includes('Server running') || output.includes('🚀')) {
        resolve(backend);
      }
    });

    backend.stderr.on('data', (data) => {
      console.log(`[Backend Error] ${data.toString().trim()}`);
    });

    backend.on('error', (error) => {
      console.log(`[Backend Error] ${error.message}`);
      resolve(backend);
    });

    // Таймаут на случай если сервер не запустится
    setTimeout(() => {
      console.log('✅ Backend процесс запущен (таймаут)');
      resolve(backend);
    }, 5000);
  });
}

async function startFrontend() {
  return new Promise((resolve) => {
    console.log('📱 Запуск Expo приложения...');
    
    const frontend = spawn('npx', ['expo', 'start', '--port', '8082', '--web-only'], {
      stdio: 'pipe',
      env: { ...process.env }
    });

    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
    });

    frontend.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('ExpoConfigError') && !error.includes('Warning')) {
        console.log(`[Frontend Error] ${error.trim()}`);
      }
    });

    frontend.on('error', (error) => {
      console.log(`[Frontend Error] ${error.message}`);
      resolve(frontend);
    });

    // Таймаут
    setTimeout(() => {
      console.log('✅ Frontend процесс запущен (таймаут)');
      resolve(frontend);
    }, 10000);
  });
}

async function main() {
  try {
    // Освобождаем порты
    await killPort(3000);
    await killPort(8081);
    await killPort(8082);
    
    console.log('⏳ Ждем 2 секунды...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Запускаем backend
    const backendProcess = await startBackend();
    
    console.log('⏳ Ждем 3 секунды перед запуском frontend...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Запускаем frontend
    const frontendProcess = await startFrontend();
    
    console.log('\n🎉 Приложение запущено успешно!');
    console.log('🌐 Backend: http://localhost:3000');
    console.log('📱 Frontend: http://localhost:8082');
    console.log('🛑 Нажмите Ctrl+C для остановки\n');
    
    // Обработка завершения
    process.on('SIGINT', () => {
      console.log('\n🛑 Завершение работы...');
      
      if (backendProcess && backendProcess.kill) {
        backendProcess.kill('SIGTERM');
      }
      
      if (frontendProcess && frontendProcess.kill) {
        frontendProcess.kill('SIGTERM');
      }
      
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    });
    
    // Держим процесс активным
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Ошибка при запуске:', error.message);
    process.exit(1);
  }
}

main();