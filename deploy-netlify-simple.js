#!/usr/bin/env node

console.log('🚀 Simple Netlify Deployment Fix');
console.log('=================================');

const fs = require('fs');
const path = require('path');

// Create a simple netlify.toml with working configuration
const netlifyConfig = `[build]
  command = "npx expo export:web"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
  EXPO_PUBLIC_API_URL = "https://your-backend-url.railway.app/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Environment variables for production
[context.production.environment]
  EXPO_PUBLIC_RORK_API_BASE_URL = "https://your-backend-url.railway.app/api"
  NODE_ENV = "production"
`;

// Write the fixed netlify.toml
fs.writeFileSync('netlify.toml', netlifyConfig);
console.log('✅ Created fixed netlify.toml');

// Create a simple build script
const buildScript = `#!/bin/bash
echo "🔧 Building for Netlify..."
npx expo export:web
echo "✅ Build complete!"
`;

fs.writeFileSync('build-netlify.sh', buildScript);
fs.chmodSync('build-netlify.sh', '755');
console.log('✅ Created build-netlify.sh');

console.log('\n🎯 DEPLOYMENT STEPS:');
console.log('1. First, deploy your backend to Railway:');
console.log('   • Go to https://railway.app');
console.log('   • Create new project from GitHub');
console.log('   • Get your backend URL (e.g., https://your-app.railway.app)');

console.log('\n2. Update netlify.toml with your actual backend URL:');
console.log('   • Replace "https://your-backend-url.railway.app/api"');
console.log('   • With your actual Railway URL + "/api"');

console.log('\n3. Deploy to Netlify:');
console.log('   • Go to https://netlify.com');
console.log('   • Drag & drop your project folder');
console.log('   • Or connect to GitHub for auto-deploy');

console.log('\n4. Test your deployment:');
console.log('   • Frontend will be at: https://your-site.netlify.app');
console.log('   • Backend should be at: https://your-app.railway.app/api');

console.log('\n💡 QUICK COMMANDS:');
console.log('   node find-backend-url.js  # Find your backend URL');
console.log('   ./build-netlify.sh        # Test build locally');

console.log('\n✅ Ready for deployment!');