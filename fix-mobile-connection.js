#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

function findLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
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
  console.log('🔧 Fixing mobile connection issues...\n');
  
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
  console.log(`\n🎯 Using IP: ${selectedIP}`);
  
  // Update .env file
  updateEnvFile(selectedIP);
  
  console.log('\n📋 Что делать дальше:');
  console.log('1. Убедитесь что backend сервер запущен: npm run backend:dev');
  console.log('2. Перезапустите приложение: npm run start');
  console.log('3. Сканируйте QR код на телефоне');
  console.log('4. Если не работает, попробуйте другие IP из списка выше');
  
  console.log('\n🔧 Альтернативные URL для тестирования:');
  ips.forEach(ip => {
    console.log(`  - http://${ip.address}:3000`);
  });
  
  console.log('\n⚠️  Важно:');
  console.log('- Телефон и компьютер должны быть в одной WiFi сети');
  console.log('- Отключите VPN если используете');
  console.log('- Проверьте что порт 3000 не заблокирован файрволом');
}

if (require.main === module) {
  main();
}

module.exports = { findLocalIPs, updateEnvFile };