#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting simple backend server...');

// Check if backend directory exists
if (!fs.existsSync('backend')) {
  console.error('❌ Backend directory not found');
  process.exit(1);
}

// Set environment variables
const env = {
  ...process.env,
  NODE_ENV: 'development',
  API_PORT: '3000',
  API_HOST: '0.0.0.0',
  USE_SQLITE: 'true',
  DATABASE_URL: 'sqlite:///tmp/database.sqlite'
};

console.log('📊 Environment:', {
  NODE_ENV: env.NODE_ENV,
  API_PORT: env.API_PORT,
  API_HOST: env.API_HOST,
  USE_SQLITE: env.USE_SQLITE
});

// Try different ways to start the backend
const startMethods = [
  // Method 1: bun
  () => spawn('bun', ['run', 'backend/index.ts'], { env, stdio: 'inherit' }),
  // Method 2: node with ts-node
  () => spawn('node', ['-r', 'ts-node/register', 'backend/index.ts'], { env, stdio: 'inherit' }),
  // Method 3: npx tsx
  () => spawn('npx', ['tsx', 'backend/index.ts'], { env, stdio: 'inherit' })
];

let currentMethod = 0;

function tryStart() {
  if (currentMethod >= startMethods.length) {
    console.error('❌ All start methods failed');
    process.exit(1);
  }

  const methodNames = ['bun', 'node + ts-node', 'npx tsx'];
  console.log(`🔄 Trying method ${currentMethod + 1}: ${methodNames[currentMethod]}`);

  const backend = startMethods[currentMethod]();
  
  backend.on('error', (error) => {
    console.error(`❌ Method ${currentMethod + 1} failed:`, error.message);
    currentMethod++;
    setTimeout(tryStart, 1000);
  });

  backend.on('close', (code) => {
    if (code !== 0) {
      console.log(`🔄 Method ${currentMethod + 1} exited with code ${code}`);
      currentMethod++;
      setTimeout(tryStart, 1000);
    } else {
      console.log('✅ Backend started successfully');
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down backend...');
    backend.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down backend...');
    backend.kill('SIGTERM');
    process.exit(0);
  });
}

tryStart();