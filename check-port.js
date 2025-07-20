#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🔍 Checking what is running on port 3000...');

// Check what's using port 3000
exec('lsof -i :3000', (error, stdout, stderr) => {
  if (error) {
    console.log('✅ Port 3000 is available (no processes found)');
    return;
  }
  
  if (stdout) {
    console.log('📋 Processes using port 3000:');
    console.log(stdout);
    
    // Try to kill the processes
    exec('lsof -ti:3000', (error, stdout, stderr) => {
      if (stdout) {
        const pids = stdout.trim().split('\n');
        console.log(`🔧 Found ${pids.length} process(es) to kill: ${pids.join(', ')}`);
        
        pids.forEach(pid => {
          exec(`kill -9 ${pid}`, (error) => {
            if (error) {
              console.log(`❌ Failed to kill process ${pid}:`, error.message);
            } else {
              console.log(`✅ Killed process ${pid}`);
            }
          });
        });
      }
    });
  }
});

// Also check port 3001
exec('lsof -i :3001', (error, stdout, stderr) => {
  if (error) {
    console.log('✅ Port 3001 is available (no processes found)');
    return;
  }
  
  if (stdout) {
    console.log('📋 Processes using port 3001:');
    console.log(stdout);
  }
});