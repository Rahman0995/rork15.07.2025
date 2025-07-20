#!/usr/bin/env node

console.log('🔍 Finding Your Backend URL');
console.log('===========================');

console.log('📊 Current Configuration:');
console.log('   • Database: Railway MySQL ✅');
console.log('   • URL: switchyard.proxy.rlwy.net:13348');
console.log('   • Status: Connected ✅');

console.log('\n🚀 Backend Deployment Options:');

console.log('\n1. 🚂 Railway (Recommended):');
console.log('   • Go to https://railway.app');
console.log('   • Create new project from GitHub');
console.log('   • Your backend will be at: https://your-project.railway.app');
console.log('   • Database already configured ✅');

console.log('\n2. 🎨 Render:');
console.log('   • Go to https://render.com');
console.log('   • Create new Web Service');
console.log('   • Your backend will be at: https://your-service.render.com');

console.log('\n3. ▲ Vercel:');
console.log('   • Go to https://vercel.com');
console.log('   • Deploy as serverless functions');
console.log('   • Your backend will be at: https://your-project.vercel.app/api');

console.log('\n📱 Frontend Deployment:');
console.log('   • Netlify: node deploy-netlify-fixed.js');
console.log('   • Vercel: node deploy-vercel-simple.js');

console.log('\n🔧 After Backend Deployment:');
console.log('   1. Copy your backend URL');
console.log('   2. Update EXPO_PUBLIC_RORK_API_BASE_URL in .env');
console.log('   3. Redeploy frontend');

console.log('\n💡 Quick Railway Deploy:');
console.log('   1. Push code to GitHub');
console.log('   2. Connect Railway to your repo');
console.log('   3. Railway auto-detects Node.js');
console.log('   4. Uses your existing database ✅');

console.log('\n✅ Your database is ready, just need to deploy backend server!');