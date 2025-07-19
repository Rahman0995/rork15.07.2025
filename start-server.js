#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Military Management System Server...\n');

// Start the backend server
const backendProcess = spawn('bun', ['run', 'backend/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    HOST: '0.0.0.0'
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

backendProcess.on('close', (code) => {
  console.log(`\n🔄 Backend server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server...');
  backendProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down server...');
  backendProcess.kill('SIGTERM');
});

console.log('✅ Server started successfully!');
console.log('📱 Backend API: http://localhost:3000/api');
console.log('🔍 Health Check: http://localhost:3000/api/health');
console.log('📊 tRPC Endpoint: http://localhost:3000/api/trpc');
console.log('\n💡 Press Ctrl+C to stop the server\n');