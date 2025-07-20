#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 Setting up Render deployment...');

// Create render.yaml for automatic deployment
const renderConfig = `services:
  - type: web
    name: military-management-app
    env: node
    plan: free
    buildCommand: |
      npm install -g bun
      bun install
      bun run build:web
    startCommand: serve -s dist -l 3000
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: military-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: ENABLE_MOCK_DATA
        value: true

databases:
  - name: military-db
    databaseName: military_management
    user: admin
    plan: free
`;

fs.writeFileSync('render.yaml', renderConfig);

// Create build script for Render
const buildScript = `#!/bin/bash
echo "🔧 Building for Render..."

# Install dependencies
npm install -g bun
bun install

# Build web version
echo "📦 Building web app..."
bunx expo export:web

# Create serve directory
mkdir -p dist
cp -r web-build/* dist/

echo "✅ Build complete!"
`;

fs.writeFileSync('build-render.sh', buildScript);
fs.chmodSync('build-render.sh', '755');

console.log('✅ Created render.yaml and build script');
console.log('');
console.log('🔗 Deploy to Render:');
console.log('1. Go to https://render.com');
console.log('2. Sign up/in with GitHub');
console.log('3. Click "New" → "Web Service"');
console.log('4. Connect your GitHub repository');
console.log('5. Render will auto-detect render.yaml and deploy');
console.log('');
console.log('🔧 Your app will be available at: https://your-service-name.onrender.com');
console.log('');
console.log('💡 Render provides:');
console.log('- Free PostgreSQL database');
console.log('- Automatic HTTPS');
console.log('- Custom domains');
console.log('- Auto-deploy from GitHub');