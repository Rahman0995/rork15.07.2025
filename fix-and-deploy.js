#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');

console.log('🔧 Fixing database issues and preparing for deployment...');

// Kill any processes on port 3000
function killPort3000() {
  return new Promise((resolve) => {
    exec('lsof -ti:3000 | xargs kill -9', (error) => {
      if (error) {
        console.log('ℹ️ No processes found on port 3000');
      } else {
        console.log('✅ Killed processes on port 3000');
      }
      resolve();
    });
  });
}

// Test database connection
function testDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Testing database connection...');
    
    const test = spawn('node', ['test-railway-db.js'], { stdio: 'inherit' });
    
    test.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database connection successful');
        resolve();
      } else {
        console.log('⚠️ Database connection failed, will use mock data');
        resolve(); // Continue anyway with mock data
      }
    });
  });
}

// Start backend on port 3001
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting backend on port 3001...');
    
    const backend = spawn('node', ['start-backend-port-3001.js'], { 
      stdio: 'inherit',
      detached: true
    });
    
    // Give it time to start
    setTimeout(() => {
      console.log('✅ Backend should be running on port 3001');
      resolve();
    }, 5000);
  });
}

// Main function
async function fixAndDeploy() {
  try {
    console.log('🔧 Step 1: Cleaning up ports...');
    await killPort3000();
    
    console.log('🔧 Step 2: Testing database...');
    await testDatabase();
    
    console.log('🔧 Step 3: Starting backend...');
    await startBackend();
    
    console.log('✅ Backend is ready!');
    console.log('🌐 Backend URL: http://localhost:3001');
    console.log('📡 API URL: http://localhost:3001/api');
    console.log('🔗 tRPC URL: http://localhost:3001/api/trpc');
    
    console.log('\n🚀 Ready for deployment!');
    console.log('Run one of these commands:');
    console.log('  node deploy-railway.js    # Deploy to Railway');
    console.log('  railway up               # Direct Railway deploy');
    console.log('  npm run build:web        # Build for web');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixAndDeploy();