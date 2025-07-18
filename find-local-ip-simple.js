#!/usr/bin/env node

const { networkInterfaces } = require('os');

console.log('🔍 Finding your local IP addresses...\n');

const nets = networkInterfaces();
const results = [];

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal) {
      results.push({
        interface: name,
        address: net.address
      });
    }
  }
}

if (results.length === 0) {
  console.log('❌ No external IPv4 addresses found');
  console.log('💡 Make sure you are connected to a network');
} else {
  console.log('✅ Found the following IP addresses:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.address} (${result.interface})`);
  });
  
  console.log('\n📝 To use one of these IPs:');
  console.log('1. Update your .env file:');
  console.log(`   LOCAL_IP=${results[0].address}`);
  console.log('2. Or set environment variable:');
  console.log(`   export LOCAL_IP=${results[0].address}`);
  console.log('3. Restart your app');
  
  console.log('\n🔧 Test your backend connection:');
  results.forEach((result) => {
    console.log(`   curl http://${result.address}:3000/api/health`);
  });
}

console.log('\n💡 Common troubleshooting:');
console.log('- Make sure your backend is running on port 3000');
console.log('- Check your firewall settings');
console.log('- Ensure your mobile device is on the same network');
console.log('- Try different IP addresses if one doesn\'t work');