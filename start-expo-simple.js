#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting Expo with file watcher fixes...');

// Clean up caches first
console.log('🧹 Cleaning caches...');
const { execSync } = require('child_process');
try {
  execSync('rm -rf node_modules/.cache .expo .metro /tmp/metro-* 2>/dev/null', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors
}

// Set environment variables to reduce file watching
const env = {
  ...process.env,
  WATCHMAN_DISABLE_WATCH: '1',
  EXPO_NO_DOTENV: '1',
  EXPO_NO_CACHE: '1',
  EXPO_USE_FAST_RESOLVER: '1'
};

console.log('📱 Starting Expo development server...');

// Start Expo with reduced file watching
const expoProcess = spawn('npx', ['expo', 'start', '--tunnel', '--port', '8081', '--clear'], {
  stdio: 'inherit',
  env
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