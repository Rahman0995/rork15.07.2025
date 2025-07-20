#!/usr/bin/env node

/**
 * Configuration Checker Script
 * Проверяет все настройки приложения перед деплоем
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking application configuration...\n');

const issues = [];
const warnings = [];

// Функция для чтения .env файла
function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#') && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (error) {
    return null;
  }
}

// Проверка .env файлов
const devEnv = readEnvFile('.env');
const prodEnv = readEnvFile('.env.production');

console.log('📁 Environment Files:');
console.log(`  .env: ${devEnv ? '✅ Found' : '❌ Missing'}`);
console.log(`  .env.production: ${prodEnv ? '✅ Found' : '❌ Missing'}\n`);

if (!devEnv) issues.push('Missing .env file');
if (!prodEnv) issues.push('Missing .env.production file');

// Проверка JWT секретов
console.log('🔐 JWT Secrets:');
if (devEnv?.JWT_SECRET) {
  const devSecret = devEnv.JWT_SECRET;
  if (devSecret === 'your-super-secret-jwt-key' || devSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    warnings.push('Development JWT secret is using default value (OK for dev)');
    console.log('  Development: ⚠️  Using default secret (OK for development)');
  } else {
    console.log('  Development: ✅ Custom secret configured');
  }
}

if (prodEnv?.JWT_SECRET) {
  const prodSecret = prodEnv.JWT_SECRET;
  if (prodSecret === 'your-super-secret-jwt-key' || prodSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    issues.push('Production JWT secret is still using default value!');
    console.log('  Production: ❌ Using default secret (SECURITY RISK!)');
  } else if (prodSecret.length < 32) {
    issues.push('Production JWT secret is too short (minimum 32 characters)');
    console.log('  Production: ❌ Secret too short');
  } else {
    console.log('  Production: ✅ Secure secret configured');
  }
} else {
  issues.push('Production JWT secret not configured');
  console.log('  Production: ❌ Not configured');
}

// Проверка API URLs
console.log('\n🌐 API URLs:');
const checkApiUrl = (env, envName) => {
  const apiUrl = env?.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!apiUrl) {
    issues.push(`${envName} API URL not configured`);
    console.log(`  ${envName}: ❌ Not configured`);
    return;
  }
  
  if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') || apiUrl.includes('192.168.')) {
    if (envName === 'Production') {
      issues.push('Production API URL is using local/development URL');
      console.log(`  ${envName}: ❌ Using local URL: ${apiUrl}`);
    } else {
      console.log(`  ${envName}: ✅ Local URL: ${apiUrl}`);
    }
  } else if (apiUrl.includes('your-production-domain.com') || apiUrl.includes('yourdomain.com')) {
    issues.push(`${envName} API URL is using placeholder domain`);
    console.log(`  ${envName}: ❌ Using placeholder: ${apiUrl}`);
  } else {
    console.log(`  ${envName}: ✅ Configured: ${apiUrl}`);
  }
};

if (devEnv) checkApiUrl(devEnv, 'Development');
if (prodEnv) checkApiUrl(prodEnv, 'Production');

// Проверка CORS настроек
console.log('\n🌍 CORS Origins:');
if (prodEnv?.CORS_ORIGIN) {
  const corsOrigin = prodEnv.CORS_ORIGIN;
  if (corsOrigin.includes('yourdomain.com') || corsOrigin.includes('your-production-domain.com')) {
    issues.push('Production CORS origins are using placeholder domains');
    console.log('  Production: ❌ Using placeholder domains');
  } else {
    console.log('  Production: ✅ Configured');
    console.log(`    Origins: ${corsOrigin}`);
  }
} else {
  issues.push('Production CORS origins not configured');
  console.log('  Production: ❌ Not configured');
}

// Проверка Supabase настроек
console.log('\n🗄️ Supabase Configuration:');
const checkSupabase = (env, envName) => {
  const url = env?.EXPO_PUBLIC_SUPABASE_URL;
  const key = env?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    warnings.push(`${envName} Supabase not fully configured`);
    console.log(`  ${envName}: ⚠️  Incomplete configuration`);
    return;
  }
  
  if (url.includes('your-project-ref') || key.includes('your-anon-key')) {
    issues.push(`${envName} Supabase is using placeholder values`);
    console.log(`  ${envName}: ❌ Using placeholders`);
  } else {
    console.log(`  ${envName}: ✅ Configured`);
    console.log(`    URL: ${url}`);
    console.log(`    Key: ${key.substring(0, 20)}...`);
  }
};

if (devEnv) checkSupabase(devEnv, 'Development');
if (prodEnv) checkSupabase(prodEnv, 'Production');

// Проверка Database URLs
console.log('\n🗃️ Database Configuration:');
const checkDatabase = (env, envName) => {
  const dbUrl = env?.DATABASE_URL;
  if (!dbUrl) {
    issues.push(`${envName} database URL not configured`);
    console.log(`  ${envName}: ❌ Not configured`);
    return;
  }
  
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    if (envName === 'Production') {
      issues.push('Production database is using local URL');
      console.log(`  ${envName}: ❌ Using local database`);
    } else {
      console.log(`  ${envName}: ✅ Local database`);
    }
  } else {
    console.log(`  ${envName}: ✅ Remote database configured`);
  }
};

if (devEnv) checkDatabase(devEnv, 'Development');
if (prodEnv) checkDatabase(prodEnv, 'Production');

// Проверка Local IP для разработки
console.log('\n🏠 Local IP Configuration:');
if (devEnv?.LOCAL_IP) {
  const localIp = devEnv.LOCAL_IP;
  if (localIp === '192.168.1.100' || localIp === '192.168.0.100') {
    warnings.push('Local IP is using default value - update to your actual IP');
    console.log(`  Development: ⚠️  Using default IP: ${localIp}`);
  } else {
    console.log(`  Development: ✅ Configured: ${localIp}`);
  }
} else {
  warnings.push('Local IP not configured');
  console.log('  Development: ⚠️  Not configured');
}

// Проверка app.config.js
console.log('\n📱 App Configuration:');
try {
  const appConfigPath = path.join(process.cwd(), 'app.config.js');
  const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
  
  if (appConfigContent.includes('your-production-domain.com')) {
    issues.push('app.config.js contains placeholder production domain');
    console.log('  app.config.js: ❌ Contains placeholder domain');
  } else {
    console.log('  app.config.js: ✅ Configured');
  }
} catch (error) {
  issues.push('app.config.js not found or not readable');
  console.log('  app.config.js: ❌ Not found');
}

// Итоговый отчет
console.log('\n' + '='.repeat(50));
console.log('📊 CONFIGURATION REPORT');
console.log('='.repeat(50));

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 All configurations look good!');
} else {
  if (issues.length > 0) {
    console.log(`\n❌ CRITICAL ISSUES (${issues.length}):`);
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Fix all critical issues before production deployment');
console.log('2. Review warnings and update as needed');
console.log('3. Test configuration in staging environment');
console.log('4. Read PRODUCTION_SETUP.md for detailed instructions');

if (issues.length > 0) {
  console.log('\n🚨 Production deployment NOT recommended until issues are fixed!');
  process.exit(1);
} else {
  console.log('\n✅ Configuration ready for production!');
  process.exit(0);
}