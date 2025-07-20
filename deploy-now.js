#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 One-Click Deployment Setup');
console.log('============================');

// Create production environment
const prodEnv = `NODE_ENV=production
DATABASE_URL=mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway
JWT_SECRET=military-app-super-secret-jwt-key-2024
API_PORT=3000
API_HOST=0.0.0.0
ENABLE_MOCK_DATA=true
`;

fs.writeFileSync('.env.production', prodEnv);

// Create simple Dockerfile for Railway
const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy package files
COPY package*.json ./
COPY bun.lock* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the app
RUN bunx expo export:web

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "web-build", "-l", "3000"]
`;

fs.writeFileSync('Dockerfile.simple', dockerfile);

// Update railway.json to use simple dockerfile
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.simple"
  },
  "deploy": {
    "startCommand": "serve -s web-build -l 3000",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
};

fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));

console.log('✅ Created deployment files');
console.log('');
console.log('🎯 NEXT STEPS:');
console.log('');
console.log('1. 📱 Go to https://railway.app');
console.log('2. 🔐 Sign in with GitHub');
console.log('3. ➕ Click "New Project"');
console.log('4. 📂 Select "Deploy from GitHub repo"');
console.log('5. 🔗 Connect your repository');
console.log('6. 🚀 Railway will automatically deploy!');
console.log('');
console.log('⏱️  Deployment takes 2-3 minutes');
console.log('🌐 Your app will be at: https://your-project-name.railway.app');
console.log('');
console.log('💡 Alternative free options:');
console.log('   • Render.com - run: node deploy-to-render.js');
console.log('   • Vercel.com - run: node deploy-to-vercel.js');
console.log('');
console.log('🔧 Database: Already configured with Railway MySQL');
console.log('✅ Ready to deploy!');