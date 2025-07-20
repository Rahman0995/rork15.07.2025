#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to Railway (Fixed)...\n');

// Check if railway CLI is installed
try {
  execSync('railway --version', { stdio: 'ignore' });
  console.log('✅ Railway CLI found');
} catch (error) {
  console.log('❌ Railway CLI not found. Installing...');
  try {
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    console.log('✅ Railway CLI installed');
  } catch (installError) {
    console.error('❌ Failed to install Railway CLI');
    console.log('\n📝 Manual installation:');
    console.log('npm install -g @railway/cli');
    console.log('railway login');
    console.log('railway link');
    process.exit(1);
  }
}

// Check if project is linked
try {
  execSync('railway status', { stdio: 'ignore' });
  console.log('✅ Railway project linked');
} catch (error) {
  console.log('❌ Railway project not linked');
  console.log('\n📝 Please run:');
  console.log('railway login');
  console.log('railway link');
  process.exit(1);
}

// Create optimized package.json for Railway
console.log('🔧 Creating Railway-optimized package.json...');
const originalPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const railwayPackage = { ...originalPackage };

// Remove problematic dependencies
const excludeForWeb = [
  'better-sqlite3', 
  '@types/better-sqlite3', 
  'expo-sqlite',
  'sqlite3'
];

excludeForWeb.forEach(dep => {
  delete railwayPackage.dependencies[dep];
  delete railwayPackage.devDependencies[dep];
});

// Add Railway-specific scripts
railwayPackage.scripts = {
  ...railwayPackage.scripts,
  'railway:build': 'npm install --legacy-peer-deps && npx expo export --platform web --output-dir dist',
  'railway:start': 'nginx -g "daemon off;"'
};

fs.writeFileSync('package.railway.json', JSON.stringify(railwayPackage, null, 2));
console.log('✅ Railway package.json created');

// Deploy to Railway
console.log('🚀 Starting Railway deployment...');
try {
  execSync('railway up --detach', { stdio: 'inherit' });
  console.log('\n✅ Deployment started successfully!');
  console.log('🔗 Check deployment status: railway status');
  console.log('🌐 View logs: railway logs');
} catch (error) {
  console.error('❌ Deployment failed');
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check Railway dashboard for build logs');
  console.log('2. Verify Dockerfile.railway exists');
  console.log('3. Check railway.json configuration');
  process.exit(1);
}

// Cleanup
fs.unlinkSync('package.railway.json');
console.log('🧹 Cleanup completed');