#!/usr/bin/env node

const { spawn } = require('child_process');
const { networkInterfaces } = require('os');
const http = require('http');

// Find local IP
function findLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '192.168.1.100'; // fallback
}

// Test if backend is running
function testBackend(ip, port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://${ip}:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🚀 Starting Full Stack Military Management System...\n');
  
  // Find and display local IP
  const localIP = findLocalIP();
  console.log(`📍 Your local IP: ${localIP}`);
  
  // Update environment
  process.env.LOCAL_IP = localIP;
  process.env.NODE_ENV = 'development';
  
  console.log('🔧 Starting backend server...');
  
  // Start backend
  const backend = spawn('bun', ['run', 'backend/index.ts'], {
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: '3000',
      HOST: '0.0.0.0',
    }
  });
  
  backend.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });
  
  backend.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString().trim()}`);
  });
  
  // Wait for backend to start
  console.log('⏳ Waiting for backend to start...');
  let backendReady = false;
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (await testBackend('localhost')) {
      backendReady = true;
      break;
    }
    console.log(`   Attempt ${i + 1}/10...`);
  }
  
  if (backendReady) {
    console.log('✅ Backend is running successfully!');
    console.log(`🌐 Backend URLs:`);
    console.log(`   - Web: http://localhost:3000/api`);
    console.log(`   - Mobile: http://${localIP}:3000/api`);
    console.log(`   - Health: http://localhost:3000/api/health`);
  } else {
    console.log('⚠️  Backend might not be ready, but continuing with mock data...');
  }
  
  console.log('\n📱 Starting Expo app...');
  
  // Start Expo
  const expo = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      LOCAL_IP: localIP,
    }
  });
  
  // Handle cleanup
  const cleanup = () => {
    console.log('\n🔄 Shutting down...');
    backend.kill('SIGTERM');
    expo.kill('SIGTERM');
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  backend.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Backend exited with code ${code}`);
    }
  });
  
  expo.on('close', (code) => {
    console.log(`📱 Expo exited with code ${code}`);
    cleanup();
  });
}

main().catch(console.error);