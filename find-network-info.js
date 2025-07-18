#!/usr/bin/env node

const os = require('os');
const { exec } = require('child_process');

function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const results = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    if (!addresses) continue;
    
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal) {
        results.push({
          interface: name,
          address: addr.address,
          netmask: addr.netmask,
          mac: addr.mac
        });
      }
    }
  }

  return results;
}

function testPort(host, port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(2000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  console.log('🔍 Network Diagnostic Information\n');
  
  // Show network interfaces
  console.log('📡 Available Network Interfaces:');
  const interfaces = getNetworkInterfaces();
  
  if (interfaces.length === 0) {
    console.log('   No external network interfaces found');
  } else {
    interfaces.forEach((iface, index) => {
      console.log(`   ${index + 1}. ${iface.interface}: ${iface.address}`);
      console.log(`      Netmask: ${iface.netmask}`);
      console.log(`      MAC: ${iface.mac}\n`);
    });
  }
  
  // Test common ports
  console.log('🔌 Testing Port Availability:');
  const testHosts = ['localhost', '127.0.0.1'];
  
  // Add discovered IPs
  interfaces.forEach(iface => {
    if (!testHosts.includes(iface.address)) {
      testHosts.push(iface.address);
    }
  });
  
  for (const host of testHosts) {
    const port3000Available = await testPort(host, 3000);
    console.log(`   ${host}:3000 - ${port3000Available ? '✅ Available' : '❌ Not available'}`);
  }
  
  console.log('\n📝 Recommended Configuration:');
  if (interfaces.length > 0) {
    const primaryInterface = interfaces[0];
    console.log(`   Set LOCAL_IP environment variable to: ${primaryInterface.address}`);
    console.log(`   Or update app.config.js with: const YOUR_IP_ADDRESS = '${primaryInterface.address}';`);
  } else {
    console.log('   Use localhost for development: const YOUR_IP_ADDRESS = \'127.0.0.1\';');
  }
  
  console.log('\n🚀 To start the backend server:');
  console.log('   npm run dev:backend');
  console.log('   or');
  console.log('   bun run dev:backend');
}

main().catch(console.error);