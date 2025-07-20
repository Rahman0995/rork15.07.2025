#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for Netlify deployment...');

try {
  // Set environment variables for production build
  process.env.NODE_ENV = 'production';
  process.env.EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  
  // Copy netlify-specific config
  if (fs.existsSync('app.config.netlify.js')) {
    fs.copyFileSync('app.config.netlify.js', 'app.config.js');
    console.log('📋 Using Netlify-specific configuration');
  }
  
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  console.log('🔧 Building web app...');
  execSync('npx expo export -p web', { stdio: 'inherit' });
  
  console.log('📁 Moving build files...');
  // Expo exports to 'dist' by default for web
  if (fs.existsSync('dist')) {
    console.log('✅ Build completed successfully!');
    console.log('📂 Build output is in ./dist directory');
  } else {
    throw new Error('Build output directory not found');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}