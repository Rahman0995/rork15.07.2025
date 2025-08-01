#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server now...');

// Try to start the backend with auto port detection
const backend = spawn('node', [path.join(__dirname, 'start-backend-auto-port.js')], {
  stdio: 'inherit'
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Shutting down backend...');
  backend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🔄 Shutting down backend...');
  backend.kill('SIGTERM');
});