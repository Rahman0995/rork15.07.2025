#!/usr/bin/env node

// Simple script to start the backend server with real database
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server with real database...');

// Set environment variables for real database connection
const env = {
  ...process.env,
  NODE_ENV: 'development',
  // Add your database connection details here
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root', 
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'military_app',
  DB_PORT: process.env.DB_PORT || '3306',
  PORT: process.env.PORT || '3000'
};

// Start the backend server
const backend = spawn('bun', ['run', 'backend/index.ts'], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit'
});

backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
});

backend.on('error', (error) => {
  console.error('Failed to start backend server:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGTERM');
  process.exit(0);
});