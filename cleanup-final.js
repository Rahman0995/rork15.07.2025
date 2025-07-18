const fs = require('fs');
const path = require('path');

function removeNestedDirs(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        
        // Remove any nested home/user/rork-app directories
        if (entry.name === 'home' && fullPath.includes('/home/user/rork-app/')) {
          console.log(`Removing nested directory: ${fullPath}`);
          fs.rmSync(fullPath, { recursive: true, force: true });
          continue;
        }
        
        // Recursively check subdirectories
        removeNestedDirs(fullPath);
      }
    }
  } catch (error) {
    console.log(`Error processing ${dir}: ${error.message}`);
  }
}

// Start cleanup from root
console.log('Starting cleanup of nested directories...');
removeNestedDirs('/home/user/rork-app');
console.log('Cleanup completed');