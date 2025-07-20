#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🔍 Checking for processes on port 3000...');

// Kill any process using port 3000
exec('lsof -ti:3000 | xargs kill -9', (error, stdout, stderr) => {
  if (error && !error.message.includes('No such process')) {
    console.log('⚠️  No processes found on port 3000 or failed to kill:', error.message);
  } else {
    console.log('✅ Cleared port 3000');
  }
  
  // Wait a moment then start backend
  setTimeout(() => {
    console.log('🚀 Starting backend server on port 3000...');
    
    const backend = spawn('node', [path.join(__dirname, 'start-backend-simple.js')], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: '3000',
        HOST: '0.0.0.0'
      }
    });
    
    backend.on('error', (error) => {
      console.error('❌ Failed to start backend:', error);
      // Try alternative port
      console.log('🔄 Trying port 3001...');
      startOnAlternativePort();
    });
    
    backend.on('close', (code) => {
      console.log(`🔄 Backend process exited with code ${code}`);
      if (code !== 0) {
        console.log('🔄 Trying port 3001...');
        startOnAlternativePort();
      }
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
  }, 1000);
});

function startOnAlternativePort() {
  console.log('🚀 Starting backend server on port 3001...');
  
  const backend = spawn('node', [path.join(__dirname, 'start-backend-simple.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3001',
      HOST: '0.0.0.0'
    }
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend on port 3001:', error);
    process.exit(1);
  });
  
  backend.on('close', (code) => {
    console.log(`🔄 Backend process exited with code ${code}`);
    process.exit(code);
  });
}