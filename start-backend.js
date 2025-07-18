#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Military Management System Backend...');

// Change to backend directory and start the server
const backendProcess = spawn('bun', ['index.ts'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
    API_PORT: process.env.API_PORT || '3000',
    API_HOST: process.env.API_HOST || '0.0.0.0',
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backendProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down backend...');
  backendProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down backend...');
  backendProcess.kill('SIGTERM');
});