#!/usr/bin/env node

const os = require('os');

function findLocalIP() {
  const interfaces = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        results.push({
          name: name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }

  console.log('🔍 Found local network interfaces:');
  console.log('=====================================');
  
  if (results.length === 0) {
    console.log('❌ No local IP addresses found');
    return;
  }

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.address}`);
  });

  console.log('\n📝 To use one of these IPs:');
  console.log('1. Update your .env file:');
  console.log(`   LOCAL_IP=${results[0].address}`);
  console.log('\n2. Or set environment variable:');
  console.log(`   export LOCAL_IP=${results[0].address}`);
  
  console.log('\n🚀 Common usage:');
  console.log('- Use the first IP for most home networks');
  console.log('- If using WiFi, look for "Wi-Fi" or "wlan" interface');
  console.log('- If using Ethernet, look for "Ethernet" or "eth" interface');
  
  console.log('\n⚠️  Make sure your mobile device is on the same network!');
}

findLocalIP();