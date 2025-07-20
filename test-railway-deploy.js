#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing Railway deployment setup...\n');

// 1. Check Railway CLI
console.log('1️⃣ Checking Railway CLI...');
try {
  const version = execSync('railway --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Railway CLI found: ${version}`);
} catch (error) {
  console.log('❌ Railway CLI not found');
  console.log('📝 Install with: npm install -g @railway/cli');
  process.exit(1);
}

// 2. Check project link
console.log('\n2️⃣ Checking Railway project link...');
try {
  const status = execSync('railway status', { encoding: 'utf8' });
  console.log('✅ Railway project linked');
  console.log(status);
} catch (error) {
  console.log('❌ Railway project not linked');
  console.log('📝 Run: railway login && railway link');
  process.exit(1);
}

// 3. Check Dockerfile
console.log('\n3️⃣ Checking Dockerfile...');
if (fs.existsSync('Dockerfile.railway')) {
  console.log('✅ Dockerfile.railway exists');
} else {
  console.log('❌ Dockerfile.railway not found');
  process.exit(1);
}

// 4. Check railway.json
console.log('\n4️⃣ Checking railway.json...');
if (fs.existsSync('railway.json')) {
  const config = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
  console.log('✅ railway.json exists');
  console.log(`   Dockerfile: ${config.build.dockerfilePath}`);
} else {
  console.log('❌ railway.json not found');
  process.exit(1);
}

// 5. Check nginx config
console.log('\n5️⃣ Checking nginx config...');
if (fs.existsSync('nginx.conf')) {
  console.log('✅ nginx.conf exists');
} else {
  console.log('❌ nginx.conf not found');
  process.exit(1);
}

// 6. Test package.json cleanup
console.log('\n6️⃣ Testing package.json cleanup...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const problematicDeps = ['better-sqlite3', 'sqlite3', '@types/better-sqlite3'];
  const found = problematicDeps.filter(dep => 
    pkg.dependencies[dep] || pkg.devDependencies[dep]
  );
  
  if (found.length > 0) {
    console.log(`⚠️  Found problematic dependencies: ${found.join(', ')}`);
    console.log('   These will be removed during build');
  } else {
    console.log('✅ No problematic dependencies found');
  }
} catch (error) {
  console.log('❌ Error reading package.json');
  process.exit(1);
}

console.log('\n✅ All checks passed! Ready for Railway deployment');
console.log('\n🚀 To deploy, run:');
console.log('   node deploy-railway-fixed.js');
console.log('   or');
console.log('   railway up --detach');