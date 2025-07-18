const fs = require('fs');
const path = require('path');

function removeNestedDirs(dir) {
  try {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        
        // If we find a nested home directory, remove it entirely
        if (entry.name === 'home' && dir.includes('rork-app')) {
          console.log(`Removing nested directory: ${fullPath}`);
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          // Recursively check other directories
          removeNestedDirs(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${dir}:`, error.message);
  }
}

// Start cleanup from root
console.log('Starting cleanup of nested directories...');
removeNestedDirs('/home/user/rork-app');
console.log('Cleanup completed');