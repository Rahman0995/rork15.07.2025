#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

function findLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        ips.push({
          interface: name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }
  
  return ips;
}

function updateEnvFile(selectedIP) {
  const envPath = path.join(__dirname, '.env');
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add LOCAL_IP
    if (envContent.includes('LOCAL_IP=')) {
      envContent = envContent.replace(/LOCAL_IP=.*/, `LOCAL_IP=${selectedIP}`);
    } else {
      envContent += `\nLOCAL_IP=${selectedIP}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated .env file with LOCAL_IP=${selectedIP}`);
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
}

function main() {
  console.log('🔍 Finding local IP addresses...\n');
  
  const ips = findLocalIPs();
  
  if (ips.length === 0) {
    console.log('❌ No local IP addresses found.');
    console.log('Make sure you are connected to a network.');
    return;
  }
  
  console.log('📱 Available IP addresses:');
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. ${ip.address} (${ip.interface})`);
  });
  
  // Auto-select the first non-loopback IP
  const selectedIP = ips[0].address;
  console.log(`\n🎯 Recommended IP: ${selectedIP}`);
  
  // Update .env file
  updateEnvFile(selectedIP);
  
  console.log('\n📋 Next steps:');
  console.log('1. Make sure your backend server is running on port 3000');
  console.log('2. Test the connection using the NetworkConnectionTest component');
  console.log('3. If connection fails, try other IPs from the list above');
  
  console.log('\n🔧 Manual configuration:');
  console.log(`Update your .env file with: LOCAL_IP=${selectedIP}`);
  console.log(`Or try these URLs in your app config:`);
  ips.forEach(ip => {
    console.log(`  - http://${ip.address}:3000`);
  });
}

if (require.main === module) {
  main();
}

module.exports = { findLocalIPs, updateEnvFile };