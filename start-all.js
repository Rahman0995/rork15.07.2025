#!/usr/bin/env node

const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('🚀 Starting Military Management System...');

// Clean up any existing processes
console.log('🧹 Cleaning up existing processes...');
try {
  execSync('pkill -f "expo start" || true', { stdio: 'ignore' });
  execSync('pkill -f "ts-node" || true', { stdio: 'ignore' });
  execSync('pkill -f "node.*backend" || true', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors
}

// Clean up caches
console.log('🧹 Cleaning caches...');
try {
  execSync('rm -rf node_modules/.cache .expo .metro /tmp/metro-* 2>/dev/null', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors
}

// Start backend first
console.log('📡 Starting backend server...');
const backendProcess = spawn('node', ['start-backend-simple.js'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Handle backend output
backendProcess.stdout.on('data', (data) => {
  process.stdout.write(`[BACKEND] ${data}`);
});

backendProcess.stderr.on('data', (data) => {
  process.stderr.write(`[BACKEND] ${data}`);
});

// Start frontend after backend is ready
setTimeout(() => {
  console.log('📱 Starting frontend server...');
  
  const env = {
    ...process.env,
    WATCHMAN_DISABLE_WATCH: '1',
    EXPO_NO_DOTENV: '1',
    EXPO_NO_CACHE: '1',
    EXPO_USE_FAST_RESOLVER: '1'
  };

  const frontendProcess = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8081', '--clear'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env
  });

  // Handle frontend output
  frontendProcess.stdout.on('data', (data) => {
    process.stdout.write(`[FRONTEND] ${data}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    process.stderr.write(`[FRONTEND] ${data}`);
  });

  frontendProcess.on('close', (code) => {
    console.log(`🔄 Frontend process exited with code ${code}`);
    backendProcess.kill();
    process.exit(code);
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('🔄 Shutting down development environment...');
    frontendProcess.kill('SIGTERM');
    backendProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 2000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

}, 3000); // Wait 3 seconds for backend to start

backendProcess.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
  process.exit(code);
});