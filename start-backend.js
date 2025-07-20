#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Military Management System Backend...');
console.log('📁 Working directory:', process.cwd());
console.log('📁 Backend directory:', path.join(process.cwd(), 'backend'));

// Change to backend directory and start the server
const backend = spawn('bun', ['run', 'index.ts'], {
  cwd: path.join(process.cwd(), 'backend'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
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