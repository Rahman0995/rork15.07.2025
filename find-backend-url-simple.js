#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Finding your Backend URL...');
console.log('===============================');

// Check various configuration files for backend URLs
const configFiles = [
  'start-with-railway.js',
  'backend/config/index.ts',
  '.env',
  '.env.production',
  'lib/trpc.ts'
];

const foundUrls = [];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for various URL patterns
      const urlPatterns = [
        /https?:\/\/[^\/\s'"]+\.railway\.app/g,
        /https?:\/\/[^\/\s'"]+\.render\.com/g,
        /https?:\/\/[^\/\s'"]+\.vercel\.app/g,
        /https?:\/\/[^\/\s'"]+\.netlify\.app/g,
        /mysql:\/\/[^@]+@([^\/]+)/g,
        /DATABASE_URL.*=.*['"]([^'"]+)['"]/g,
        /baseUrl.*:.*['"]([^'"]+)['"]/g,
        /apiUrl.*:.*['"]([^'"]+)['"]/g
      ];
      
      urlPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!foundUrls.includes(match)) {
              foundUrls.push(match);
              console.log(`📍 Found in ${file}: ${match}`);
            }
          });
        }
      });
    } catch (error) {
      // Ignore file read errors
    }
  }
});

console.log('\n🎯 SUMMARY:');
console.log('===========');

if (foundUrls.length === 0) {
  console.log('❌ No backend URLs found in configuration files');
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Deploy your backend to Railway: https://railway.app');
  console.log('2. Or use a free hosting service like:');
  console.log('   • Render.com (free tier)');
  console.log('   • Vercel.com (serverless functions)');
  console.log('   • Railway.app (free $5 credit)');
  console.log('\n🔧 QUICK SETUP:');
  console.log('1. Go to https://railway.app');
  console.log('2. Sign in with GitHub');
  console.log('3. Create new project from your repo');
  console.log('4. Railway will auto-deploy your backend');
  console.log('5. Copy the generated URL (like: https://your-app.railway.app)');
} else {
  console.log('✅ Found potential backend URLs:');
  foundUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  // Extract Railway database info
  const railwayDb = foundUrls.find(url => url.includes('switchyard.proxy.rlwy.net'));
  if (railwayDb) {
    console.log('\n🚂 RAILWAY DATABASE DETECTED:');
    console.log('Your Railway MySQL database is configured');
    console.log('Backend URL should be: https://your-project-name.railway.app');
    console.log('\n📝 TO FIND YOUR ACTUAL BACKEND URL:');
    console.log('1. Go to https://railway.app/dashboard');
    console.log('2. Find your project');
    console.log('3. Click on your backend service');
    console.log('4. Look for the "Public Domain" or "Generated Domain"');
    console.log('5. That\'s your backend URL!');
  }
}

console.log('\n🌐 CURRENT FRONTEND CONFIGURATION:');
console.log('Your app is currently configured to use:');
console.log('• Local development: http://localhost:3000');
console.log('• Production: Update EXPO_PUBLIC_API_URL environment variable');

console.log('\n🔧 TO UPDATE YOUR FRONTEND:');
console.log('1. Find your backend URL from Railway dashboard');
console.log('2. Update the build-netlify.js file');
console.log('3. Set: process.env.EXPO_PUBLIC_API_URL = "https://your-backend.railway.app/api"');
console.log('4. Redeploy to Netlify');

console.log('\n✅ NEXT STEPS:');
console.log('1. Deploy backend to Railway (if not done)');
console.log('2. Get the Railway app URL');
console.log('3. Update frontend configuration');
console.log('4. Deploy frontend to Netlify');