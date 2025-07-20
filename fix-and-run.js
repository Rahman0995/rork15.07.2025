#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление проблем и запуск приложения...');

// Функция для увеличения лимита файловых наблюдателей
function fixFileWatchers() {
  try {
    console.log('🔧 Увеличиваем лимит файловых наблюдателей...');
    
    // Проверяем текущий лимит
    const currentLimit = execSync('cat /proc/sys/fs/inotify/max_user_watches', { encoding: 'utf8' }).trim();
    console.log(`Текущий лимит: ${currentLimit}`);
    
    if (parseInt(currentLimit) < 524288) {
      // Временно увеличиваем лимит
      execSync('echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches', { stdio: 'inherit' });
      console.log('✅ Лимит файловых наблюдателей увеличен');
    } else {
      console.log('✅ Лимит файловых наблюдателей уже достаточный');
    }
  } catch (error) {
    console.log('⚠️ Не удалось изменить лимит файловых наблюдателей (возможно, нужны права sudo)');
    console.log('💡 Попробуйте запустить: sudo sysctl fs.inotify.max_user_watches=524288');
  }
}

// Функция для очистки кэша
function clearCache() {
  try {
    console.log('🔧 Очистка кэша...');
    
    const cacheDirs = [
      '.expo',
      'node_modules/.cache',
      '.metro'
    ];
    
    for (const dir of cacheDirs) {
      if (fs.existsSync(dir)) {
        execSync(`rm -rf ${dir}`, { stdio: 'inherit' });
        console.log(`✅ Удален кэш: ${dir}`);
      }
    }
  } catch (error) {
    console.log('⚠️ Не удалось очистить весь кэш, продолжаем...');
  }
}

// Основная функция запуска
async function main() {
  // Исправляем проблемы
  fixFileWatchers();
  clearCache();
  
  console.log('🚀 Запуск приложения...');
  
  // Запускаем простой бэкенд
  console.log('🔧 Запуск бэкенд сервера...');
  
  const backend = spawn('node', ['start-backend-simple.js'], {
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: '0.0.0.0'
    }
  });

  let backendReady = false;

  backend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('BACKEND:', output.trim());
    
    if (output.includes('запущен на') || output.includes('running on')) {
      backendReady = true;
      setTimeout(startFrontend, 2000); // Ждем 2 секунды для стабильности
    }
  });

  backend.stderr.on('data', (data) => {
    console.error('BACKEND ERROR:', data.toString().trim());
  });

  backend.on('error', (error) => {
    console.error('❌ Ошибка запуска бэкенда:', error.message);
    console.log('🔧 Продолжаем с mock данными...');
    setTimeout(startFrontend, 1000);
  });

  // Запускаем фронтенд
  function startFrontend() {
    console.log('🔧 Запуск фронтенд приложения...');
    
    const frontend = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8081', '--clear'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
      }
    });

    frontend.on('error', (error) => {
      console.error('❌ Ошибка запуска фронтенда:', error.message);
      
      // Пробуем альтернативный способ запуска
      console.log('🔄 Пробуем альтернативный способ запуска...');
      const altFrontend = spawn('npx', ['expo', 'start', '--port', '8081'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development'
        }
      });
      
      altFrontend.on('error', (altError) => {
        console.error('❌ Альтернативный запуск тоже не удался:', altError.message);
        backend.kill();
        process.exit(1);
      });
    });

    frontend.on('close', (code) => {
      console.log(`🏁 Фронтенд завершился с кодом ${code}`);
      backend.kill();
      process.exit(code);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔄 Завершение работы...');
      frontend.kill('SIGINT');
      backend.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🔄 Завершение работы...');
      frontend.kill('SIGTERM');
      backend.kill('SIGTERM');
      process.exit(0);
    });
  }

  // Если бэкенд не запустился за 15 секунд, запускаем фронтенд принудительно
  setTimeout(() => {
    if (!backendReady) {
      console.log('⚠️ Бэкенд не ответил, запускаем фронтенд с mock данными...');
      startFrontend();
    }
  }, 15000);
}

// Запускаем
main().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});