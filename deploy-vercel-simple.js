#!/usr/bin/env node

console.log('🚀 Vercel Deployment (Recommended)');
console.log('==================================');

// Create vercel.json configuration
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "buildCommand": "npm run build:web"
};

const fs = require('fs');
fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

console.log('✅ Created vercel.json configuration');

console.log('\n🎯 DEPLOYMENT STEPS:');
console.log('1. 📱 Go to https://vercel.com');
console.log('2. 🔐 Sign in with GitHub');
console.log('3. ➕ Click "New Project"');
console.log('4. 📂 Import your GitHub repository');
console.log('5. 🔧 Vercel will detect settings automatically');
console.log('6. 🚀 Click "Deploy"');

console.log('\n⚙️ Auto-configured settings:');
console.log('   • Framework: Other');
console.log('   • Build command: npm run build:web');
console.log('   • Output directory: dist');
console.log('   • Install command: npm install');

console.log('\n🌐 Your app will be at: https://your-project.vercel.app');
console.log('⏱️  Deployment takes 2-3 minutes');

console.log('\n💡 Why Vercel is better:');
console.log('   ✅ Better React Native Web support');
console.log('   ✅ Automatic HTTPS');
console.log('   ✅ Global CDN');
console.log('   ✅ Zero configuration');

console.log('\n✅ Ready to deploy to Vercel!');