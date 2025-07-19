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

// Remove all nested home directories
const nestedDirs = [
  'home',
];

nestedDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    removeDirectory(dir);
  }
});

console.log('Cleanup completed!');