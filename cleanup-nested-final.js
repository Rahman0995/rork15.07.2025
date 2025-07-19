const fs = require('fs');
const path = require('path');

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Removed: ${dirPath}`);
    } catch (error) {
      console.error(`Error removing ${dirPath}:`, error.message);
    }
  }
}

// Remove all nested home/user/rork-app directories
const nestedDirs = [
  'home/user/rork-app',
];

nestedDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    removeDirectory(dir);
  }
});

console.log('Cleanup completed!');