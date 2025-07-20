#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

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

// Function to find available port
async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}

async function startBackend() {
  try {
    console.log('🔍 Finding available port...');
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
    
  } catch (error) {
    console.error('❌ Error starting backend:', error);
    process.exit(1);
  }
}

startBackend();