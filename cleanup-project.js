#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Функция для рекурсивного удаления папки
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Удаляем папку: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// Удаляем дублированные папки
const duplicatedPaths = [
  'home/user/rork-app/home',
  'home/user/rork-app/app',
  'home/user/rork-app/backend',
  'home/user/rork-app/components',
  'home/user/rork-app/constants',
  'home/user/rork-app/lib',
  'home/user/rork-app/store',
  'home/user/rork-app/types',
  'home/user/rork-app/utils'
];

console.log('🧹 Очистка проекта от дублированных файлов...');

duplicatedPaths.forEach(dirPath => {
  removeDir(dirPath);
});

// Удаляем папку home полностью, если она существует
removeDir('home');

console.log('✅ Очистка завершена!');
console.log('📁 Оставлены только основные папки проекта');