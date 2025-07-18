#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Backend Server...');

// Check if bun is available
function checkBun() {
  try {
    const result = spawn.sync('bun', ['--version'], { stdio: 'pipe' });
    if (result.status === 0) {
      console.log('✅ Bun found:', result.stdout.toString().trim());
      return true;
    }
  } catch (error) {
    console.log('❌ Bun not found');
  }
  return false;
}

// Check if Node.js can run TypeScript files
function checkTsNode() {
  try {
    const result = spawn.sync('npx', ['ts-node', '--version'], { stdio: 'pipe' });
    if (result.status === 0) {
      console.log('✅ ts-node found');
      return true;
    }
  } catch (error) {
    console.log('❌ ts-node not found');
  }
  return false;
}

// Start the backend
let backend;

if (checkBun()) {
  console.log('🔧 Using Bun to run backend...');
  backend = spawn('bun', ['run', 'backend/index.ts'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: '0.0.0.0', // Listen on all interfaces for mobile access
    }
  });
} else if (checkTsNode()) {
  console.log('🔧 Using ts-node to run backend...');
  backend = spawn('npx', ['ts-node', 'backend/index.ts'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: '0.0.0.0',
    }
  });
} else {
  console.error('❌ Neither Bun nor ts-node found!');
  console.log('💡 Install one of the following:');
  console.log('   - Bun: npm install -g bun');
  console.log('   - ts-node: npm install -g ts-node typescript');
  console.log('');
  console.log('🔧 For now, the app will run with mock data only.');
  process.exit(0);
}

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error.message);
  console.log('🔧 The app will continue with mock data only.');
  process.exit(0);
});

backend.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
  if (code !== 0) {
    console.log('🔧 The app will continue with mock data only.');
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Shutting down backend...');
  if (backend) {
    backend.kill('SIGINT');
  }
});

process.on('SIGTERM', () => {
  console.log('🔄 Shutting down backend...');
  if (backend) {
    backend.kill('SIGTERM');
  }
});