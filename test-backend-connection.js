#!/usr/bin/env node

const http = require('http');

const testUrls = [
  'http://localhost:3000/api/health',
  'http://127.0.0.1:3000/api/health',
  'http://192.168.1.100:3000/api/health',
  'http://0.0.0.0:3000/api/health'
];

async function testConnection(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${url} - Status: ${res.statusCode}`);
        resolve({ url, success: true, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${url} - Error: ${error.message}`);
      resolve({ url, success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      resolve({ url, success: false, error: 'Timeout' });
    });
  });
}

async function testAllConnections() {
  console.log('🔍 Testing backend connections...\n');
  
  const results = await Promise.all(testUrls.map(testConnection));
  
  console.log('\n📊 Results:');
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working: ${working.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (working.length > 0) {
    console.log('\n🎉 Backend is accessible at:');
    working.forEach(r => console.log(`  - ${r.url}`));
  } else {
    console.log('\n⚠️  Backend is not accessible. Make sure to start it with:');
    console.log('  node start-backend.js');
  }
}

testAllConnections().catch(console.error);