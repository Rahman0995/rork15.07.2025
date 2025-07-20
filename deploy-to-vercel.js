#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 Setting up Vercel deployment...');

// Create vercel.json
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "web-build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

// Update package.json for Vercel
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts['build-vercel'] = 'bunx expo export:web';
packageJson.scripts['vercel-build'] = 'npm run build-vercel';

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Created vercel.json and updated package.json');
console.log('');
console.log('🔗 Deploy to Vercel:');
console.log('1. Go to https://vercel.com');
console.log('2. Sign up/in with GitHub');
console.log('3. Click "New Project"');
console.log('4. Import your GitHub repository');
console.log('5. Vercel will auto-deploy');
console.log('');
console.log('🔧 Your app will be available at: https://your-project-name.vercel.app');
console.log('');
console.log('💡 Vercel provides:');
console.log('- Serverless functions for API');
console.log('- Global CDN');
console.log('- Automatic HTTPS');
console.log('- Custom domains');
console.log('- Auto-deploy from GitHub');