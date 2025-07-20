#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...');

// Set proper environment variables
const backendEnv = {
  ...process.env,
  NODE_ENV: 'development',
  API_PORT: '3000',
  API_HOST: '0.0.0.0',
  USE_SQLITE: 'true',
  DATABASE_URL: 'sqlite:///tmp/database.sqlite'
};

// Start backend with bun
const backend = spawn('bun', ['run', 'backend/index.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: backendEnv
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend with bun:', error.message);
  
  // Try with node
  console.log('🔄 Trying with node...');
  const nodeBackend = spawn('node', ['-r', 'ts-node/register', 'backend/index.ts'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: backendEnv
  });
  
  nodeBackend.on('error', (nodeError) => {
    console.error('❌ Failed to start with node:', nodeError.message);
    process.exit(1);
  });
});

backend.on('close', (code) => {
  console.log(`🏁 Backend exited with code ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Received SIGINT, shutting down backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM, shutting down backend...');
  backend.kill('SIGTERM');
  process.exit(0);
});