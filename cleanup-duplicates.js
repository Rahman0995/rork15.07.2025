const fs = require('fs');
const path = require('path');

// Function to remove directory recursively
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Removed: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${dirPath}:`, error.message);
      return false;
    }
  }
  return false;
}

// Remove the nested duplicate directories
const duplicatePaths = [
  path.join(__dirname, 'home')
];

console.log('Cleaning up duplicate nested directories...');

duplicatePaths.forEach(dirPath => {
  if (removeDirectory(dirPath)) {
    console.log(`✅ Successfully removed duplicate directory: ${dirPath}`);
  } else {
    console.log(`⚠️  Directory not found or already removed: ${dirPath}`);
  }
});

console.log('Cleanup completed!');