#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Netlify configuration...');

// Create a proper netlify.toml
const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
  EXPO_PUBLIC_API_URL = "https://your-backend-url.railway.app/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

try {
  fs.writeFileSync(path.join(__dirname, 'netlify.toml'), netlifyConfig);
  console.log('✅ Fixed netlify.toml configuration');
  
  // Also create a simple build script for Netlify
  const buildScript = `#!/bin/bash
echo "🚀 Building for Netlify..."

# Install dependencies
npm install --legacy-peer-deps

# Build the web version
npx expo export:web

# Copy build output to dist folder
mkdir -p dist
cp -r web-build/* dist/

echo "✅ Build complete!"
`;

  fs.writeFileSync(path.join(__dirname, 'build-netlify.sh'), buildScript);
  fs.chmodSync(path.join(__dirname, 'build-netlify.sh'), '755');
  
  console.log('✅ Created build-netlify.sh script');
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('1. Run: node restore-package-json.js');
  console.log('2. Run: npm install');
  console.log('3. Update EXPO_PUBLIC_API_URL in netlify.toml with your actual backend URL');
  console.log('4. Commit and push to GitHub');
  console.log('5. Netlify will auto-deploy');
  
} catch (error) {
  console.error('❌ Error fixing Netlify config:', error.message);
  process.exit(1);
}