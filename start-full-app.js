#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');
const os = require('os');

console.log('🚀 Starting Full Military Management System...\n');

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '192.168.1.100'; // fallback
}

const localIP = getLocalIP();
console.log(`🌐 Detected local IP: ${localIP}`);

// Update environment variables
process.env.LOCAL_IP = localIP;
process.env.EXPO_PUBLIC_RORK_API_BASE_URL = `http://${localIP}:3000`;

console.log(`📡 API will be available at: http://${localIP}:3000/api`);
console.log(`📱 Mobile app will connect to: http://${localIP}:3000\n`);

// Start the backend server
console.log('🔧 Starting backend server...');
const backendProcess = spawn('bun', ['run', 'backend/index.ts'], {
  stdio: 'pipe',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    HOST: '0.0.0.0'
  }
});

backendProcess.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backendProcess.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

// Wait a bit for backend to start, then start the frontend
setTimeout(() => {
  console.log('\n🔧 Starting Expo development server...');
  
  const expoProcess = spawn('bunx', ['rork', 'start', '-p', 'jwjevnxtm1q2kz7xwsgmz', '--tunnel'], {
    stdio: 'pipe',
    cwd: process.cwd(),
    env: {
      ...process.env,
      EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
    }
  });

  expoProcess.stdout.on('data', (data) => {
    console.log(`[EXPO] ${data.toString().trim()}`);
  });

  expoProcess.stderr.on('data', (data) => {
    console.error(`[EXPO ERROR] ${data.toString().trim()}`);
  });

  expoProcess.on('error', (error) => {
    console.error('❌ Failed to start Expo:', error);
  });

  expoProcess.on('close', (code) => {
    console.log(`\n🔄 Expo process exited with code ${code}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down all processes...');
    backendProcess.kill('SIGINT');
    expoProcess.kill('SIGINT');
    setTimeout(() => process.exit(0), 2000);
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down all processes...');
    backendProcess.kill('SIGTERM');
    expoProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 2000);
  });

}, 3000);

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

backendProcess.on('close', (code) => {
  console.log(`\n🔄 Backend server process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

console.log('✅ Starting services...');
console.log('📱 Backend API will be at: http://localhost:3000/api');
console.log(`📱 Mobile API will be at: http://${localIP}:3000/api`);
console.log('🔍 Health Check: http://localhost:3000/api/health');
console.log('📊 tRPC Endpoint: http://localhost:3000/api/trpc');
console.log('\n💡 Press Ctrl+C to stop all services\n');