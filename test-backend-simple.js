#!/usr/bin/env node

const http = require('http');

// Test different URLs
const testUrls = [
  'http://localhost:3000/api',
  'http://127.0.0.1:3000/api',
  'http://192.168.1.100:3000/api',
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode === 200,
          data: data.substring(0, 200) + (data.length > 200 ? '...' : '')
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function testBackend() {
  console.log('🔍 Testing backend connectivity...\n');

  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    const result = await testUrl(url);
    
    if (result.success) {
      console.log(`✅ SUCCESS - Status: ${result.status}`);
      console.log(`   Response: ${result.data}\n`);
    } else {
      console.log(`❌ FAILED - ${result.error}\n`);
    }
  }

  // Test tRPC endpoint
  console.log('Testing tRPC endpoint...');
  const trpcUrl = 'http://localhost:3000/api/trpc/example.hi';
  const trpcResult = await testUrl(trpcUrl);
  
  if (trpcResult.success) {
    console.log(`✅ tRPC SUCCESS - Status: ${trpcResult.status}`);
    console.log(`   Response: ${trpcResult.data}`);
  } else {
    console.log(`❌ tRPC FAILED - ${trpcResult.error}`);
  }
}

testBackend().catch(console.error);