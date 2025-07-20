#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing Netlify deployment...');

try {
  // Copy netlify-specific files
  if (fs.existsSync('package-netlify.json')) {
    fs.copyFileSync('package-netlify.json', 'package.json');
    console.log('✅ Updated package.json for Netlify');
  }
  
  if (fs.existsSync('app.config.netlify.js')) {
    fs.copyFileSync('app.config.netlify.js', 'app.config.js');
    console.log('✅ Updated app.config.js for Netlify');
  }
  
  console.log('📋 Netlify deployment setup complete!');
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('1. 📱 Go to https://netlify.com');
  console.log('2. 🔐 Sign in with GitHub');
  console.log('3. ➕ Click "New site from Git"');
  console.log('4. 📂 Select your repository');
  console.log('5. 🔧 Build settings:');
  console.log('   - Build command: npm run build');
  console.log('   - Publish directory: dist');
  console.log('6. 🚀 Deploy!');
  console.log('');
  console.log('⚠️  IMPORTANT: Update the API URL in app.config.netlify.js');
  console.log('   Replace "https://your-backend-url.com/api" with your actual backend URL');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}