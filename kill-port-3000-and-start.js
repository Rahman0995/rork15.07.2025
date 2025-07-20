#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🔍 Checking for processes using port 3000...');

// Kill any process using port 3000
exec('lsof -ti:3000', (error, stdout, stderr) => {
  if (stdout) {
    const pids = stdout.trim().split('\n');
    console.log(`🔄 Found ${pids.length} process(es) using port 3000. Killing them...`);
    
    pids.forEach(pid => {
      if (pid) {
        exec(`kill -9 ${pid}`, (killError) => {
          if (killError) {
            console.log(`⚠️ Could not kill process ${pid}: ${killError.message}`);
          } else {
            console.log(`✅ Killed process ${pid}`);
          }
        });
      }
    });
    
    // Wait a bit for processes to be killed
    setTimeout(startBackend, 2000);
  } else {
    console.log('✅ Port 3000 is free');
    startBackend();
  }
});

function startBackend() {
  console.log('🚀 Starting backend server on port 3000...');
  
  const backend = spawn('npx', ['tsx', path.join(__dirname, 'backend/index.ts')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3000',
      HOST: '0.0.0.0',
      NODE_ENV: 'development'
    }
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error);
    // Try alternative start method
    console.log('🔄 Trying alternative start method...');
    startBackendAlternative();
  });
  
  backend.on('close', (code) => {
    console.log(`🔄 Backend process exited with code ${code}`);
    if (code !== 0) {
      console.log('🔄 Trying alternative start method...');
      startBackendAlternative();
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
}

function startBackendAlternative() {
  console.log('🚀 Starting backend with bun...');
  
  const backend = spawn('bun', ['run', 'backend/hono.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3000',
      HOST: '0.0.0.0',
      NODE_ENV: 'development'
    }
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend with bun:', error);
    console.log('🔄 Trying with tsx...');
    startBackendWithTsx();
  });
  
  backend.on('close', (code) => {
    console.log(`🔄 Backend process exited with code ${code}`);
    if (code !== 0) {
      console.log('🔄 Trying with tsx...');
      startBackendWithTsx();
    }
  });
}

function startBackendWithTsx() {
  console.log('🚀 Starting backend with tsx...');
  
  const backend = spawn('npx', ['tsx', 'backend/hono.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3000',
      HOST: '0.0.0.0',
      NODE_ENV: 'development'
    }
  });
  
  backend.on('error', (error) => {
    console.error('❌ All backend start methods failed:', error);
    process.exit(1);
  });
  
  backend.on('close', (code) => {
    console.log(`🔄 Backend process exited with code ${code}`);
    process.exit(code);
  });
}