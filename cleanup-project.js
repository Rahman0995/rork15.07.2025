const fs = require('fs');
const path = require('path');

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Удалено: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка удаления ${dirPath}:`, error.message);
      return false;
    }
  }
  return false;
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Удален файл: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка удаления файла ${filePath}:`, error.message);
      return false;
    }
  }
  return false;
}

console.log('🧹 Начинаем очистку проекта...');

// Удаляем все вложенные home директории
const dirsToRemove = [
  'home',
];

let removedDirs = 0;
dirsToRemove.forEach(dir => {
  if (removeDirectory(dir)) {
    removedDirs++;
  }
});

// Удаляем ненужные скрипты и файлы
const filesToRemove = [
  // Скрипты запуска (оставим только нужные)
  'start-app-fixed.js',
  'start-backend-now.js',
  'start-full-app-now.js',
  'quick-start-now.sh',
  'start-now.js',
  'fix-and-run.js',
  'start-backend-direct.js',
  'start-expo-direct.js',
  'start-app-fixed.js',
  'start-frontend-only.js',
  'start-backend.sh',
  'start-frontend.sh',
  'start-dev.sh',
  'test-backend.sh',
  'start-backend-simple.sh',
  'test-trpc.sh',
  'fix-watchers.sh',
  'start-frontend.js',
  'start-dev.js',
  'start-expo-simple.js',
  'start-all.js',
  'start-full.sh',
  'fix-watchers-limit.sh',
  'start-app-simple.sh',
  'start-backend-only.sh',
  'start-with-railway-fixed.js',
  'start-backend-port-3001.js',
  'start-with-mock.sh',
  'start-with-mock.bat',
  'start-with-railway.js',
  'start-backend-simple.js',
  'start-mock-backend.js',
  'mock-backend-server.js',
  'start-simple-backend.js',
  'start-app-complete.js',
  'kill-port-and-start.js',
  'start-backend-auto-port.js',
  'check-port.js',
  'start-fixed.js',
  'start-clean.js',
  'start-clean.sh',
  'kill-port-3000-and-start.js',
  'start-backend-now.sh',
  'start-backend-fixed.js',
  'start.sh',
  'start-app-now.js',
  'start-backend-auto.js',
  'start-app-simple.js',
  'quick-start-fixed.js',
  'make-executable-fixed.sh',
  'kill-ports-and-start.js',
  'start-simple-fixed.js',
  'kill-port-3000-and-start-fixed.js',
  'start-clean-ports.sh',
  
  // Тестовые файлы
  'test-backend.js',
  'test-backend-simple.js',
  'test-backend-connection.js',
  'test-connection.js',
  'test-connection-simple.js',
  'test-railway-db.js',
  'test-server-connection.js',
  'test-env.js',
  'test-sms-webhook.js',
  'test-web-build.sh',
  'test-web-build-local.sh',
  'test-railway-deploy.js',
  
  // Файлы диагностики
  'diagnose-network.js',
  'find-local-ip.js',
  'find-network-info.js',
  'find-local-ip-simple.js',
  'find-backend-url.js',
  'find-backend-url-simple.js',
  
  // Файлы очистки
  'cleanup-duplicates.js',
  'cleanup-nested-dirs.js',
  'cleanup-now.js',
  'cleanup-all-nested.js',
  'cleanup-home-dir.js',
  'cleanup-final.js',
  'cleanup-nested-final.js',
  'cleanup-all.js',
  
  // Файлы исправления
  'fix-app-json-permissions.bat',
  'fix-app-json-permissions.sh',
  'fix-permissions.bat',
  'fix-permissions.sh',
  'fix-text-nodes.js',
  'fix-build-issues.js',
  'fix-and-start.sh',
  'fix-network-and-start.sh',
  'fix-mobile-connection.js',
  'fix-all-issues.js',
  'fix-connection-issues.js',
  'fix-supabase-config.js',
  'fix-file-watchers.sh',
  'quick-fix-and-start.sh',
  'fix-and-run.js',
  'fix-watchers.sh',
  'fix-and-deploy.js',
  'fix-netlify-deployment.js',
  'fix-netlify-deploy.js',
  'fix-netlify-config.js',
  'fix-deployment-issues.js',
  
  // Файлы деплоя
  'deploy.sh',
  'deploy-railway.js',
  'deploy-to-railway-web.js',
  'deploy-to-render.js',
  'deploy-to-vercel.js',
  'deploy-now.js',
  'quick-deploy.sh',
  'deploy-railway-fixed.js',
  'quick-railway-deploy.sh',
  'setup-railway.sh',
  'deploy-railway-web.js',
  'deploy-github-to-railway.js',
  'quick-deploy-guide.sh',
  'start-deployment.js',
  'build-netlify.js',
  'deploy-netlify.js',
  'deploy-netlify-fixed.js',
  'deploy-vercel-simple.js',
  'deploy-full-app.js',
  'deploy-netlify-simple.js',
  'quick-netlify-fix.sh',
  'deploy-production.sh',
  'render-deploy.sh',
  
  // Дублированные конфиги
  'package-clean.json',
  'package.web.json',
  'package.render.json',
  'package.minimal.json',
  'package.netlify.json',
  'package.production.json',
  'app.config.web.js',
  'app.config.netlify.js',
  
  // Дублированные Dockerfile
  'Dockerfile.web.simple',
  'Dockerfile.web.fixed',
  'Dockerfile.web.simple.fixed',
  'Dockerfile.web.clean',
  'Dockerfile.web.render',
  'Dockerfile.railway',
  
  // Скрипты сборки
  'build.sh',
  'build-web.sh',
  'build-web-fixed.sh',
  'build-web-simple.sh',
  'build-web-render.sh',
  'custom-build.js',
  'create-web-package.js',
  
  // Документация (оставим только основную)
  'DEPLOYMENT.md',
  'DEPLOYMENT_GUIDE.md',
  'DEPLOYMENT_FIX.md',
  'DOCKER_BUILD_FIX.md',
  'NETWORK_TROUBLESHOOTING.md',
  'NETWORK_TROUBLESHOOTING_FIXED.md',
  'NETWORK_FIX_GUIDE.md',
  'MOBILE_TROUBLESHOOTING.md',
  'QUICK_MOBILE_FIX.md',
  'NETWORK_FIX_SIMPLE.md',
  'RAILWAY_SETUP.md',
  'RAILWAY_DEPLOYMENT_FIX.md',
  'RAILWAY_SQLITE_FIX.md',
  'PRODUCTION_DEPLOYMENT.md',
  'PRODUCTION_DEPLOYMENT_GUIDE.md',
  'RENDER_DEPLOYMENT_GUIDE.md',
  'RENDER_DEPLOYMENT_FIX.md',
  'QUICK_RENDER_FIX.md',
  'START_GUIDE.md',
  'ЗАПУСК.md',
  'ИНСТРУКЦИЯ.md',
  'ЗАПУСК_СЕЙЧАС.md',
  'ЗАПУСК_ПРИЛОЖЕНИЯ.md',
  'РЕШЕНИЕ_ПРОБЛЕМЫ.md',
  'ИНСТРУКЦИЯ_ЗАПУСКА.md',
  'ИНСТРУКЦИЯ_ИСПРАВЛЕНИЯ.md',
  'HOSTING_RECOMMENDATIONS.md',
  'HOSTING_GUIDE.md',
  'RAILWAY_DEPLOY_GUIDE.md',
  'RAILWAY_FIX_SOLUTION.md',
  'SIMPLE_DEPLOYMENT.md',
  'NETLIFY_DEPLOYMENT_GUIDE.md',
  'NETLIFY_FIX_GUIDE.md',
  'NETLIFY_FIX_INSTRUCTIONS.md',
  'SUPABASE_SETUP.md',
  'SUPABASE_ИНСТРУКЦИЯ.md',
  'SUPABASE_НАСТРОЙКА.md',
  'SUPABASE_БЫСТРЫЙ_СТАРТ.md',
  'SUPABASE_ДОПОЛНИТЕЛЬНАЯ_ИНТЕГРАЦИЯ.md',
  'SMS_WEBHOOK_SETUP.md',
  'QUICK_SMS_SETUP.md',
  'БЫСТРЫЙ_ЗАПУСК.md',
  'БЫСТРЫЙ_ЗАПУСК_ИСПРАВЛЕНО.md',
  'SUPABASE_SETUP_GUIDE.md',
  'SERVER_SETUP.md',
  'SERVER_DEPLOYMENT_GUIDE.md',
  'SERVER_CONNECTION_GUIDE.md',
  'REAL_DATA_SETUP.md',
  'QUICK_START.md',
  
  // Прочие ненужные файлы
  'debug-text-nodes.js',
  'text-node-fixes-summary.md',
  'clear-cache.bat',
  'clear-cache.sh',
  'clear-cache-and-restart.sh',
  'set-app-json-permissions.sh',
  'set-app-json-permissions.bat',
  'make-scripts-executable.sh',
  'make-executable.sh',
  'make-railway-scripts-executable.sh',
  'utils/trpc-test.ts',
  'utils/networkDiagnostics.ts',
  'add-sample-data.js',
  'remove-sqlite-deps.js',
  'restore-package-json.js',
  'run.sh',
  'run.js',
  'quick-start.js',
  'quick-start-web.js',
  'quick-start.sh',
  'start-without-sudo.sh',
  'run-now.sh',
  'ЗАПУСК.sh',
  'start-expo.sh',
  'start-expo-web.sh',
  'start-expo.js',
  'start-simple.js',
  'start-simple.sh',
  'quick-start-now.sh',
  'start-server.js',
  'start-full-app.js',
  'start-backend-real.js',
  'start-with-mobile.sh',
  'start-with-mobile.bat',
  'start-with-backend.sh',
  'start-full-stack.js',
  'start-web-render.js',
  'start-expo.sh',
  'start-expo-web.sh',
  'make-executable.sh',
  'quick-start.js',
  'quick-start-web.js',
  'start-simple.js',
  'start-without-sudo.sh',
  'quick-fix-and-start.sh',
  'start-app.sh',
  'start-simple.sh',
  'run-now.sh',
  'ЗАПУСК.sh',
];

filesToRemove.forEach(file => {
  removeFile(file);
});

// Удаляем дублированные конфиги
const configsToRemove = [
  'docker-compose.production.yml',
  'nginx.prod.conf',
  'start-production.sh',
  'railway.toml',
  'netlify.toml',
  'render.yaml',
  'railway.json',
  '.env.production.example',
];

configsToRemove.forEach(file => {
  removeFile(file);
});

let removedFiles = 0;
filesToRemove.forEach(file => {
  if (removeFile(file)) {
    removedFiles++;
  }
});

let removedConfigs = 0;
configsToRemove.forEach(file => {
  if (removeFile(file)) {
    removedConfigs++;
  }
});

console.log('\n✅ Очистка проекта завершена!');
console.log(`📁 Удалено директорий: ${removedDirs}`);
console.log(`📄 Удалено файлов: ${removedFiles}`);
console.log(`⚙️ Удалено конфигов: ${removedConfigs}`);
console.log('📁 Оставлены только необходимые файлы для работы приложения');