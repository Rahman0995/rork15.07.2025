#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development environment...');

// Start backend
console.log('📡 Starting backend server...');
const backendProcess = spawn('node', ['start-backend.js'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  cwd: process.cwd()
});

// Start frontend after a short delay
setTimeout(() => {
  console.log('📱 Starting frontend server...');
  const frontendProcess = spawn('node', ['start-frontend.js'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    cwd: process.cwd()
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
  process.on('SIGTERM', () => {
    console.log('🔄 Shutting down development environment...');
    frontendProcess.kill('SIGTERM');
    backendProcess.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('🔄 Shutting down development environment...');
    frontendProcess.kill('SIGINT');
    backendProcess.kill('SIGINT');
  });
}, 2000);

// Handle backend output
backendProcess.stdout.on('data', (data) => {
  process.stdout.write(`[BACKEND] ${data}`);
});

backendProcess.stderr.on('data', (data) => {
  process.stderr.write(`[BACKEND] ${data}`);
});

backendProcess.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
  process.exit(code);
});