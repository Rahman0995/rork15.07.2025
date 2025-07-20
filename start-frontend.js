#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting Expo development server...');

// Start Expo with tunnel
const expoProcess = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8081'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    EXPO_USE_FAST_RESOLVER: 'true'
  }
});

expoProcess.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error);
  process.exit(1);
});

expoProcess.on('close', (code) => {
  console.log(`🔄 Expo process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, shutting down Expo...');
  expoProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🔄 Received SIGINT, shutting down Expo...');
  expoProcess.kill('SIGINT');
});