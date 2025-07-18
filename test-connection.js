#!/usr/bin/env node

const https = require('https');
const http = require('http');

async function testConnection(url, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, { timeout }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          responseTime,
          data: data.substring(0, 200) // First 200 chars
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        code: error.code
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        timeout: true
      });
    });
  });
}

async function main() {
  console.log('🔍 Testing network connections...\n');
  
  const urls = [
    'http://localhost:3000/api/health',
    'http://127.0.0.1:3000/api/health',
    'http://192.168.1.100:3000/api/health',
    'http://192.168.0.100:3000/api/health',
    'https://httpbin.org/json' // Internet test
  ];
  
  for (const url of urls) {
    console.log(`Testing: ${url}`);
    const result = await testConnection(url);
    
    if (result.success) {
      console.log(`✅ Success (${result.responseTime}ms) - Status: ${result.status}`);
      if (result.data) {
        console.log(`   Response: ${result.data.replace(/\n/g, ' ')}`);
      }
    } else {
      console.log(`❌ Failed - ${result.error}`);
      if (result.code) {
        console.log(`   Code: ${result.code}`);
      }
    }
    console.log('');
  }
  
  console.log('📋 Recommendations:');
  console.log('1. Make sure your backend server is running: npm run backend:dev');
  console.log('2. Check that your firewall allows connections on port 3000');
  console.log('3. Verify your mobile device is on the same network');
  console.log('4. Try the NetworkConnectionTest component in the app');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection };