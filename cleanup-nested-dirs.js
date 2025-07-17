const fs = require('fs');
const path = require('path');

function removeNestedDirs(dir) {
  const nestedPath = path.join(dir, 'home/user/rork-app');
  
  if (fs.existsSync(nestedPath)) {
    console.log(`Removing nested directory: ${nestedPath}`);
    fs.rmSync(nestedPath, { recursive: true, force: true });
  }
  
  // Check for any remaining nested directories
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      removeNestedDirs(fullPath);
    }
  }
}

// Start cleanup from root
removeNestedDirs('/home/user/rork-app');
console.log('Cleanup completed');