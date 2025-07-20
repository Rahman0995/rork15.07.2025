#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Генерируем безопасный JWT секрет
const generateJWTSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Обновляем .env.production файл
const updateProductionEnv = () => {
  const envPath = path.join(__dirname, '..', '.env.production');
  const newSecret = generateJWTSecret();
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Заменяем JWT_SECRET
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${newSecret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ JWT_SECRET успешно обновлен в .env.production');
    console.log('🔐 Новый JWT_SECRET:', newSecret);
    console.log('');
    console.log('⚠️  ВАЖНО: Сохраните этот секрет в безопасном месте!');
    console.log('⚠️  После деплоя старые JWT токены станут недействительными.');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении .env.production:', error.message);
    console.log('🔐 Сгенерированный JWT_SECRET:', newSecret);
    console.log('📝 Скопируйте его вручную в .env.production');
  }
};

// Проверяем аргументы командной строки
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Генератор JWT секрета для production

Использование:
  node scripts/generate-jwt-secret.js [опции]

Опции:
  --only-generate, -g    Только сгенерировать секрет (не обновлять файл)
  --help, -h            Показать эту справку

Примеры:
  node scripts/generate-jwt-secret.js           # Сгенерировать и обновить .env.production
  node scripts/generate-jwt-secret.js -g       # Только сгенерировать секрет
`);
  process.exit(0);
}

if (args.includes('--only-generate') || args.includes('-g')) {
  const secret = generateJWTSecret();
  console.log('🔐 Сгенерированный JWT_SECRET:');
  console.log(secret);
} else {
  updateProductionEnv();
}