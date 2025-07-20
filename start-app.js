#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск полного приложения (Backend + Frontend)...');

// Функция для запуска процесса
function startProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    process.stdout.on('data', (data) => {
      console.log(`[${options.name || 'Process'}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${options.name || 'Process'} Error] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });

    // Возвращаем процесс для возможности его остановки
    return process;
  });
}

async function main() {
  try {
    // Запуск backend сервера
    console.log('📡 Запуск backend сервера...');
    const backendProcess = spawn('bun', ['run', 'dev'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'pipe',
      shell: true
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    // Даем время backend серверу запуститься
    console.log('✅ Backend процесс запущен');
    console.log('⏳ Ждем 3 секунды перед запуском frontend...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Запуск Expo приложения
    console.log('📱 Запуск Expo приложения...');
    const frontendProcess = spawn('expo', ['start', '--port', '8082'], {
      stdio: 'pipe',
      shell: true
    });

    frontendProcess.stdout.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error(`[Frontend Error] ${data.toString().trim()}`);
    });

    console.log('✅ Frontend процесс запущен');
    console.log('🎉 Приложение запущено успешно!');
    console.log('📱 Откройте Expo Go на телефоне и отсканируйте QR код');
    console.log('🌐 Или откройте веб версию в браузере');
    console.log('🛑 Нажмите Ctrl+C для остановки');

    // Обработка сигналов для graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔄 Остановка приложения...');
      backendProcess.kill('SIGTERM');
      frontendProcess.kill('SIGTERM');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🔄 Остановка приложения...');
      backendProcess.kill('SIGTERM');
      frontendProcess.kill('SIGTERM');
      process.exit(0);
    });

    // Ждем завершения процессов
    await Promise.all([
      new Promise(resolve => backendProcess.on('close', resolve)),
      new Promise(resolve => frontendProcess.on('close', resolve))
    ]);

  } catch (error) {
    console.error('❌ Ошибка при запуске приложения:', error.message);
    process.exit(1);
  }
}

main();