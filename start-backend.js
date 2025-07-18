#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Military Management System Backend...');

// Start the backend server
const backendProcess = spawn('bun', ['run', 'backend/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_PORT: process.env.API_PORT || '3000',
    API_HOST: process.env.API_HOST || '0.0.0.0',
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backendProcess.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down backend...');
  backendProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down backend...');
  backendProcess.kill('SIGINT');
});