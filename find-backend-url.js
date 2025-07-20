#!/usr/bin/env node

console.log('🔍 Finding Your Backend URL...');
console.log('================================');

// Check for Railway deployment
console.log('\n📡 RAILWAY DEPLOYMENT:');
console.log('1. Go to https://railway.app/dashboard');
console.log('2. Find your project');
console.log('3. Click on your backend service');
console.log('4. Look for "Domains" section');
console.log('5. Your URL will be like: https://your-project-name.railway.app');

// Check environment variables
console.log('\n🔧 CURRENT CONFIGURATION:');
const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'Not set';
console.log(`Current API URL: ${envUrl}`);

if (process.env.DATABASE_URL) {
  console.log('✅ Database configured (Railway MySQL)');
} else {
  console.log('❌ No database URL found');
}

console.log('\n🚀 DEPLOYMENT OPTIONS:');
console.log('1. Railway: https://railway.app (recommended)');
console.log('2. Render: https://render.com');
console.log('3. Vercel: https://vercel.com');

console.log('\n📝 NEXT STEPS:');
console.log('1. Deploy your backend to Railway/Render/Vercel');
console.log('2. Get your deployment URL');
console.log('3. Update netlify.toml with your backend URL');
console.log('4. Example: EXPO_PUBLIC_API_URL = "https://your-app.railway.app/api"');

console.log('\n💡 QUICK RAILWAY DEPLOY:');
console.log('1. Push your code to GitHub');
console.log('2. Go to railway.app');
console.log('3. Click "New Project" → "Deploy from GitHub"');
console.log('4. Select your repository');
console.log('5. Railway will auto-deploy and give you a URL');

console.log('\n✅ Once you have your backend URL, update netlify.toml and redeploy!');