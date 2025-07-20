#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Запуск приложения с исправлением проблем...');

// Очищаем кэши
console.log('🧹 Очищаем кэши...');
const cacheDirs = [
  'node_modules/.cache',
  '.expo',
  '.metro',
  '/tmp/metro-cache',
  '/tmp/haste-map-metro-cache'
];

cacheDirs.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Очищен: ${dir}`);
    }
  } catch (error) {
    console.log(`⚠️  Не удалось очистить ${dir}:`, error.message);
  }
});

// Устанавливаем переменные окружения
process.env.WATCHMAN_DISABLE_WATCH = '1';
process.env.EXPO_NO_DOTENV = '1';
process.env.EXPO_NO_CACHE = '1';

console.log('📱 Запускаем Expo...');

try {
  // Запускаем expo с исправлениями
  execSync('npx expo start --tunnel --port 8081 --clear', {
    stdio: 'inherit',
    env: {
      ...process.env,
      WATCHMAN_DISABLE_WATCH: '1',
      EXPO_NO_DOTENV: '1',
      EXPO_NO_CACHE: '1'
    }
  });
} catch (error) {
  console.error('❌ Ошибка запуска:', error.message);
  process.exit(1);
}