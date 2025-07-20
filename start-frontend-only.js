#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('📱 Запуск только frontend (без backend)...');
console.log('⚠️ Backend будет использовать mock данные');

// Запускаем expo start
const expo = spawn('npx', ['expo', 'start', '--tunnel'], {
  stdio: 'inherit'
});

expo.on('error', (error) => {
  console.error('❌ Ошибка запуска Expo:', error.message);
  
  if (error.code === 'ENOENT') {
    console.log('⚠️ npx не найден, пробуем прямой запуск...');
    
    const expoLocal = spawn('expo', ['start', '--tunnel'], {
      stdio: 'inherit'
    });
    
    expoLocal.on('error', (localError) => {
      console.error('❌ Ошибка прямого запуска Expo:', localError.message);
      console.log('🔄 Пробуем без tunnel...');
      
      const expoSimple = spawn('npx', ['expo', 'start'], {
        stdio: 'inherit'
      });
      
      expoSimple.on('error', (simpleError) => {
        console.error('❌ Все попытки запуска Expo провалились:', simpleError.message);
        process.exit(1);
      });
    });
  }
});

expo.on('close', (code) => {
  console.log(`Expo процесс завершен с кодом ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Получен SIGINT, завершаем Expo...');
  expo.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔄 Получен SIGTERM, завершаем Expo...');
  expo.kill('SIGTERM');
  process.exit(0);
});

console.log('🎯 Приложение запускается...');
console.log('📱 После запуска откройте Expo Go на телефоне и отсканируйте QR код');
console.log('🌐 Или нажмите "w" для открытия веб версии');
console.log('🛑 Нажмите Ctrl+C для остановки');