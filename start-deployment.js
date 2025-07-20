#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Запуск процесса развертывания');
console.log('===============================');
console.log('');

// Make scripts executable
try {
  execSync('chmod +x quick-deploy-guide.sh', { stdio: 'inherit' });
  execSync('chmod +x deploy-github-to-railway.js', { stdio: 'inherit' });
  console.log('✅ Скрипты сделаны исполняемыми');
} catch (error) {
  console.log('⚠️  Не удалось сделать скрипты исполняемыми, но это не критично');
}

console.log('');
console.log('📋 ДОСТУПНЫЕ КОМАНДЫ:');
console.log('');
console.log('• node deploy-github-to-railway.js - Подробная инструкция');
console.log('• ./quick-deploy-guide.sh - Быстрая инструкция');
console.log('• node deploy-railway-web.js - Веб-развертывание');
console.log('');

console.log('🎯 РЕКОМЕНДАЦИЯ:');
console.log('Запустите: node deploy-github-to-railway.js');
console.log('');

// Run the main deployment guide
require('./deploy-github-to-railway.js');