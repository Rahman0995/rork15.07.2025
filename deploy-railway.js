#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to Railway...');

// Check if railway CLI is installed
function checkRailwayCLI() {
  return new Promise((resolve) => {
    const check = spawn('railway', ['--version'], { stdio: 'pipe' });
    check.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Install railway CLI if needed
async function installRailwayCLI() {
  console.log('📦 Installing Railway CLI...');
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', '-g', '@railway/cli'], { stdio: 'inherit' });
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Railway CLI installed successfully');
        resolve();
      } else {
        reject(new Error('Failed to install Railway CLI'));
      }
    });
  });
}

// Create railway.json if it doesn't exist
function createRailwayConfig() {
  const railwayConfig = {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
      "builder": "NIXPACKS",
      "buildCommand": "bun install && bun run build:web"
    },
    "deploy": {
      "startCommand": "node start-production.js",
      "healthcheckPath": "/api/health",
      "healthcheckTimeout": 100,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  };

  if (!fs.existsSync('railway.json')) {
    fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
    console.log('✅ Created railway.json configuration');
  }
}

// Create production start script
function createProductionScript() {
  const productionScript = `#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting production server...');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

// Start the backend server
const backend = spawn('node', ['backend/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

backend.on('close', (code) => {
  console.log(\`Backend process exited with code \${code}\`);
  process.exit(code);
});

backend.on('error', (error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
`;

  if (!fs.existsSync('start-production.js')) {
    fs.writeFileSync('start-production.js', productionScript);
    console.log('✅ Created production start script');
  }
}

// Main deployment function
async function deploy() {
  try {
    // Check and install Railway CLI
    const hasRailway = await checkRailwayCLI();
    if (!hasRailway) {
      await installRailwayCLI();
    }

    // Create necessary config files
    createRailwayConfig();
    createProductionScript();

    console.log('🔧 Preparing deployment...');
    
    // Login to Railway (if not already logged in)
    console.log('🔐 Please login to Railway if prompted...');
    const login = spawn('railway', ['login'], { stdio: 'inherit' });
    
    await new Promise((resolve, reject) => {
      login.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Railway login successful');
          resolve();
        } else {
          reject(new Error('Railway login failed'));
        }
      });
    });

    // Deploy to Railway
    console.log('🚀 Deploying to Railway...');
    const deploy = spawn('railway', ['up'], { stdio: 'inherit' });
    
    await new Promise((resolve, reject) => {
      deploy.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Deployment successful!');
          console.log('🌐 Your app should be available at your Railway domain');
          resolve();
        } else {
          reject(new Error('Deployment failed'));
        }
      });
    });

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploy();