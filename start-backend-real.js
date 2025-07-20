#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting real backend server...');

// Set environment variables
const env = {
  ...process.env,
  NODE_ENV: 'development',
  USE_SQLITE: 'true',
  DATABASE_URL: 'sqlite:///tmp/database.sqlite',
  API_PORT: '3000',
  API_HOST: '0.0.0.0',
  PORT: '3000'
};

// Start the backend server
const backend = spawn('bun', ['run', 'backend/index.ts'], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit'
});

backend.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
  if (code !== 0) {
    console.log('🔄 Falling back to simple backend...');
    
    // Fallback to simple backend
    const simpleBackend = spawn('node', [path.join(__dirname, 'start-backend-simple.js')], {
      stdio: 'inherit',
      env
    });
    
    simpleBackend.on('error', (err) => {
      console.error('❌ Failed to start simple backend:', err);
      process.exit(1);
    });
  }
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  console.log('🔄 Falling back to simple backend...');
  
  // Fallback to simple backend
  const simpleBackend = spawn('node', [path.join(__dirname, 'start-backend-simple.js')], {
    stdio: 'inherit',
    env
  });
  
  simpleBackend.on('error', (err) => {
    console.error('❌ Failed to start simple backend:', err);
    process.exit(1);
  });
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGTERM');
  process.exit(0);
});