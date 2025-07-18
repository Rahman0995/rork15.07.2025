#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');
const os = require('os');

// Get network interfaces
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }
  
  return addresses;
}

// Test if backend is running on a specific URL
async function testBackend(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          url, 
          success: true, 
          status: res.statusCode, 
          data: data.substring(0, 200) 
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ url, success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, success: false, error: 'Timeout' });
    });
  });
}

// Check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -i :${port}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ port, inUse: false });
      } else {
        resolve({ port, inUse: true, processes: stdout });
      }
    });
  });
}

async function diagnose() {
  console.log('🔍 Network Diagnostics for Military Management System\n');
  
  // 1. Show network interfaces
  console.log('📡 Network Interfaces:');
  const interfaces = getNetworkInterfaces();
  interfaces.forEach(iface => {
    console.log(`  ${iface.name}: ${iface.address} (${iface.netmask})`);
  });
  console.log('');
  
  // 2. Check if port 3000 is in use
  console.log('🔌 Port Status:');
  const portCheck = await checkPort(3000);
  if (portCheck.inUse) {
    console.log('  ✅ Port 3000 is in use');
    console.log('  📋 Processes:');
    console.log(portCheck.processes.split('\n').slice(0, 3).join('\n'));
  } else {
    console.log('  ❌ Port 3000 is not in use');
    console.log('  💡 Start the backend with: node start-backend.js');
  }
  console.log('');
  
  // 3. Test backend URLs
  console.log('🌐 Testing Backend URLs:');
  const testUrls = [
    'http://localhost:3000/api/health',
    'http://127.0.0.1:3000/api/health',
    ...interfaces.map(iface => `http://${iface.address}:3000/api/health`)
  ];
  
  const results = await Promise.all(testUrls.map(testBackend));
  
  results.forEach(result => {
    if (result.success) {
      console.log(`  ✅ ${result.url} - Status: ${result.status}`);
    } else {
      console.log(`  ❌ ${result.url} - Error: ${result.error}`);
    }
  });
  
  // 4. Recommendations
  console.log('\n💡 Recommendations:');
  const working = results.filter(r => r.success);
  
  if (working.length === 0) {
    console.log('  1. Start the backend server:');
    console.log('     chmod +x run-backend.sh && ./run-backend.sh');
    console.log('  2. Or use: node start-backend.js');
    console.log('  3. Check if port 3000 is blocked by firewall');
  } else {
    console.log('  ✅ Backend is accessible!');
    console.log('  📱 For mobile testing, use these URLs:');
    working.forEach(r => {
      if (!r.url.includes('localhost') && !r.url.includes('127.0.0.1')) {
        console.log(`     ${r.url.replace('/api/health', '')}`);
      }
    });
  }
  
  console.log('\n🔧 Environment Variables to set:');
  if (interfaces.length > 0) {
    console.log(`  export EXPO_PUBLIC_RORK_API_BASE_URL=http://${interfaces[0].address}:3000`);
  }
  console.log('  export API_HOST=0.0.0.0');
  console.log('  export API_PORT=3000');
}

diagnose().catch(console.error);