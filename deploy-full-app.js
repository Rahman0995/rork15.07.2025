#!/usr/bin/env node

console.log('🚀 Full App Deployment Guide');
console.log('============================');

console.log('📊 Your Current Setup:');
console.log('   ✅ Database: Railway MySQL (connected)');
console.log('   ⏳ Backend: Need to deploy');
console.log('   ⏳ Frontend: Need to deploy');

console.log('\n🎯 STEP 1: Deploy Backend (Choose one):');

console.log('\n🚂 Option A: Railway (Recommended)');
console.log('   1. Go to https://railway.app');
console.log('   2. Sign in with GitHub');
console.log('   3. Click "New Project"');
console.log('   4. Select "Deploy from GitHub repo"');
console.log('   5. Choose your repository');
console.log('   6. Railway will auto-deploy!');
console.log('   7. Your backend URL: https://your-project.railway.app');

console.log('\n🎨 Option B: Render');
console.log('   1. Go to https://render.com');
console.log('   2. Create "New Web Service"');
console.log('   3. Connect GitHub repository');
console.log('   4. Build command: npm install');
console.log('   5. Start command: node backend/index.ts');
console.log('   6. Your backend URL: https://your-service.render.com');

console.log('\n🎯 STEP 2: Deploy Frontend');

console.log('\n▲ Vercel (Recommended for frontend)');
console.log('   1. Run: node deploy-vercel-simple.js');
console.log('   2. Follow the instructions');
console.log('   3. Your frontend URL: https://your-project.vercel.app');

console.log('\n🌐 Netlify (Alternative)');
console.log('   1. Run: node deploy-netlify-fixed.js');
console.log('   2. Follow the instructions');
console.log('   3. Your frontend URL: https://your-site.netlify.app');

console.log('\n🔧 STEP 3: Connect Frontend to Backend');
console.log('   1. Copy your backend URL from step 1');
console.log('   2. Update .env file:');
console.log('      EXPO_PUBLIC_RORK_API_BASE_URL=https://your-backend-url');
console.log('   3. Redeploy frontend');

console.log('\n⚡ Quick Deploy Commands:');
console.log('   • Backend info: node find-backend-url.js');
console.log('   • Vercel frontend: node deploy-vercel-simple.js');
console.log('   • Netlify frontend: node deploy-netlify-fixed.js');

console.log('\n✅ Total time: 10-15 minutes');
console.log('💰 Cost: FREE on all platforms');
console.log('🌍 Global availability: YES');

console.log('\n🎉 Ready to deploy your military management app!');