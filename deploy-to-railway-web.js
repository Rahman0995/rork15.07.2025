#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to Railway via GitHub...');

// Check if git is available
try {
  execSync('git --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Git is not available. Please use Railway web interface.');
  console.log('📋 Manual deployment steps:');
  console.log('1. Go to https://railway.app');
  console.log('2. Connect your GitHub repository');
  console.log('3. Deploy from GitHub');
  process.exit(1);
}

// Create production environment file
const prodEnv = `# Production Environment Variables
NODE_ENV=production

# Railway automatically provides DATABASE_URL
# Your MySQL is already configured

# JWT Secret - change this in Railway dashboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
API_PORT=3000
API_HOST=0.0.0.0

# Enable mock data fallback
ENABLE_MOCK_DATA=true
`;

fs.writeFileSync('.env.production', prodEnv);

console.log('✅ Created .env.production');
console.log('');
console.log('🔗 Next steps:');
console.log('1. Go to https://railway.app');
console.log('2. Sign in with GitHub');
console.log('3. Click "New Project" → "Deploy from GitHub repo"');
console.log('4. Select your repository');
console.log('5. Railway will automatically detect and deploy using railway.json');
console.log('');
console.log('🔧 Your app will be available at: https://your-project-name.railway.app');
console.log('');
console.log('📊 Railway will automatically:');
console.log('- Build using Dockerfile.web.clean');
console.log('- Connect to your existing MySQL database');
console.log('- Provide HTTPS and custom domain');
console.log('');
console.log('💡 Alternative: Use GitHub Actions for automatic deployment');