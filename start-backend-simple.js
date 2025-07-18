#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Backend Server...');

// Start the backend using bun
const backend = spawn('bun', ['run', 'backend/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    HOST: '0.0.0.0', // Listen on all interfaces for mobile access
  }
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Shutting down backend...');
  backend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🔄 Shutting down backend...');
  backend.kill('SIGTERM');
});