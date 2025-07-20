#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting mock backend server...');

// Start the mock backend
const backend = spawn('node', ['mock-backend-server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3000',
    HOST: '0.0.0.0'
  }
});

backend.on('error', (error) => {
  console.error('❌ Failed to start mock backend:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`🏁 Mock backend exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down mock backend...');
  backend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down mock backend...');
  backend.kill('SIGTERM');
});