#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Backend Connection...');

// Function to test if backend is running
async function testBackend() {
  try {
    const response = await fetch('http://localhost:3002/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running:', data);
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
    return false;
  }
}

// Function to start backend
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting backend server...');
    
    const backend = spawn('bun', ['run', 'index.ts'], {
      cwd: path.join(process.cwd(), 'backend'),
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    backend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📊 Backend:', output.trim());
      
      // Check if server started successfully
      if (output.includes('Server is running')) {
        resolve(backend);
      }
    });

    backend.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('❌ Backend Error:', error.trim());
    });

    backend.on('error', (error) => {
      console.error('❌ Failed to start backend:', error);
      reject(error);
    });

    backend.on('close', (code) => {
      console.log(`🔄 Backend process exited with code ${code}`);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Backend startup timeout'));
    }, 10000);
  });
}

// Main execution
async function main() {
  // First test if backend is already running
  const isRunning = await testBackend();
  
  if (isRunning) {
    console.log('✅ Backend is already running!');
    process.exit(0);
  }

  // Try to start backend
  try {
    const backend = await startBackend();
    
    // Wait a bit for server to fully start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test again
    const isNowRunning = await testBackend();
    
    if (isNowRunning) {
      console.log('✅ Backend started successfully!');
      console.log('🌐 Backend URL: http://localhost:3002/api');
      console.log('❤️ Health Check: http://localhost:3002/api/health');
      console.log('📡 tRPC Endpoint: http://localhost:3002/api/trpc');
      console.log('');
      console.log('Press Ctrl+C to stop the backend server');
      
      // Keep the process running
      process.on('SIGINT', () => {
        console.log('🔄 Shutting down backend...');
        backend.kill('SIGINT');
        process.exit(0);
      });
      
    } else {
      console.log('❌ Backend failed to start properly');
      backend.kill();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  }
}

main();