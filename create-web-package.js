#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating web-specific package.json...');

try {
  // Read original package.json
  const originalPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Dependencies that should be excluded for web builds
  const excludeForWeb = [
    'better-sqlite3',
    '@types/better-sqlite3',
    'expo-sqlite',
    'expo-av',
    'expo-camera',
    'expo-haptics',
    'expo-location',
    'expo-media-library',
    'expo-notifications'
  ];
  
  // Create web package.json
  const webPackage = {
    ...originalPackage,
    dependencies: {},
    devDependencies: originalPackage.devDependencies || {}
  };
  
  // Copy dependencies excluding problematic ones
  Object.keys(originalPackage.dependencies || {}).forEach(dep => {
    if (!excludeForWeb.includes(dep)) {
      webPackage.dependencies[dep] = originalPackage.dependencies[dep];
    } else {
      console.log(`⚠️  Excluding ${dep} for web build`);
    }
  });
  
  // Add web-specific scripts
  webPackage.scripts = {
    ...originalPackage.scripts,
    "build:web": "expo export --platform web --output-dir dist",
    "start:web": "expo start --web"
  };
  
  // Write web package.json
  fs.writeFileSync('package.web.json', JSON.stringify(webPackage, null, 2) + '\n');
  
  console.log('✅ Created package.web.json for web builds');
  console.log('📦 This excludes native dependencies that cause build issues');
  
} catch (error) {
  console.error('❌ Error creating web package.json:', error.message);
  process.exit(1);
}