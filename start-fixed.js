#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const net = require('net');
const path = require('path');

console.log('🚀 Starting application with automatic port detection...');

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to kill processes on a port
function killPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
      if (error && !error.message.includes('No such process')) {
        console.log(`⚠️  Could not kill processes on port ${port}:`, error.message);
      } else {
        console.log(`✅ Cleared port ${port}`);
      }
      resolve();
    });
  });
}

// Function to find available port
async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  // If no ports available, try to kill processes on default ports
  console.log('🔧 No available ports found, attempting to clear ports...');
  await killPort(3000);
  await killPort(3001);
  
  // Wait a moment and try again
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  throw new Error('No available ports found even after clearing');
}

async function startApplication() {
  try {
    console.log('🔍 Finding available port for backend...');
    const port = await findAvailablePort(3000);
    console.log(`✅ Found available port: ${port}`);
    
    console.log(`🚀 Starting backend server on port ${port}...`);
    
    const backend = spawn('node', [path.join(__dirname, 'start-backend-simple.js')], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: port.toString(),
        HOST: '0.0.0.0'
      }
    });
    
    backend.on('error', (error) => {
      console.error('❌ Failed to start backend:', error);
      process.exit(1);
    });
    
    backend.on('close', (code) => {
      console.log(`🔄 Backend process exited with code ${code}`);
      if (code !== 0) {
        console.log('🔄 Attempting to restart...');
        setTimeout(() => startApplication(), 3000);
      }
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('🔄 Shutting down backend...');
      backend.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('🔄 Shutting down backend...');
      backend.kill('SIGTERM');
      process.exit(0);
    });
    
    // Show success message
    setTimeout(() => {
      console.log(`\n✅ Backend should be running on port ${port}`);
      console.log(`🌐 Try accessing: http://localhost:${port}/api/trpc/example.hi`);
      console.log(`📱 For mobile: http://192.168.1.100:${port}/api/trpc/example.hi`);
      console.log('\n🔧 If you see connection errors in the app, they should resolve automatically with fallback URLs.');
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error starting application:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure no other applications are using ports 3000-3010');
    console.log('2. Try running: node check-port.js');
    console.log('3. Try running: node kill-port-and-start.js');
    process.exit(1);
  }
}

startApplication();