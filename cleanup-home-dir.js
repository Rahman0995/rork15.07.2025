const fs = require('fs');
const path = require('path');

// Remove the entire home directory to clean up all nested duplicates
const homeDir = path.join(process.cwd(), 'home');

if (fs.existsSync(homeDir)) {
  console.log('Removing home directory and all nested duplicates...');
  fs.rmSync(homeDir, { recursive: true, force: true });
  console.log('Home directory removed successfully');
} else {
  console.log('Home directory does not exist');
}