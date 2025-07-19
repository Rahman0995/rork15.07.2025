#!/usr/bin/env node

const http = require('http');
const os = require('os');

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '192.168.1.100'; // fallback
}

const localIP = getLocalIP();

console.log('🔍 Testing server connections...\n');

// Test URLs
const testUrls = [
  { name: 'Localhost API', url: 'http://localhost:3000/api/health' },
  { name: 'Local IP API', url: `http://${localIP}:3000/api/health` },
  { name: 'Localhost tRPC', url: 'http://localhost:3000/api/trpc' },
  { name: 'Local IP tRPC', url: `http://${localIP}:3000/api/trpc` },
];

async function testConnection(name, url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(url, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${name}: ${res.statusCode} (${duration}ms)`);
        if (res.statusCode === 200 && data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.status === 'healthy') {
              console.log(`   📊 Status: ${parsed.status}`);
            }
          } catch (e) {
            // Not JSON, that's ok for some endpoints
          }
        }
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ${name}: ${error.code} (${duration}ms)`);
      console.log(`   🔗 URL: ${url}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏰ ${name}: Timeout (5000ms)`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log(`🌐 Local IP detected: ${localIP}\n`);
  
  for (const test of testUrls) {
    await testConnection(test.name, test.url);
  }
  
  console.log('\n📋 Connection test completed!');
  console.log('\n💡 Tips:');
  console.log('   - If localhost works but local IP doesn\'t, check firewall settings');
  console.log('   - Make sure the server is running: bun run backend/index.ts');
  console.log('   - Update .env file with your correct LOCAL_IP');
  console.log(`   - Current detected IP: ${localIP}`);
}

runTests();