const fs = require('fs');
const path = require('path');

// Remove nested directories
const nestedPaths = [
  'home/user/rork-app/home',
  'home/user/rork-app/backend/trpc/routes/chat',
  'home/user/rork-app/backend/trpc/routes/notifications'
];

nestedPaths.forEach(nestedPath => {
  if (fs.existsSync(nestedPath)) {
    console.log(`Removing: ${nestedPath}`);
    fs.rmSync(nestedPath, { recursive: true, force: true });
  }
});

console.log('Cleanup completed');