#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting custom build process...');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Run prebuild if needed
  console.log('🔧 Running prebuild...');
  execSync('bunx expo prebuild --clean', { stdio: 'inherit' });

  // Export web build
  console.log('📦 Exporting web build...');
  execSync('bunx expo export --platform web', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  console.log('📁 Build output is in the "dist" directory');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}