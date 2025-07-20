#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Restoring package.json from backup...');

// Read the backup package.json
const backupPath = path.join(__dirname, 'package.netlify.json');
const targetPath = path.join(__dirname, 'package.json');

if (!fs.existsSync(backupPath)) {
  console.error('❌ Backup file package.netlify.json not found');
  process.exit(1);
}

try {
  // Read and parse the backup to ensure it's valid JSON
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  const backupJson = JSON.parse(backupContent);
  
  // Add back the necessary scripts for the full app
  const restoredPackage = {
    ...backupJson,
    scripts: {
      ...backupJson.scripts,
      "start": "bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel",
      "start-web": "bunx rork start -p jwjevnxtm1q2kz7xwsgmz --web --tunnel",
      "start-web-dev": "DEBUG=expo* bunx rork start -p jwjevnxtm1q2kz7xwsgmz --web --tunnel",
      "start-local": "expo start --localhost",
      "start-lan": "expo start --lan",
      "start-tunnel": "expo start --tunnel",
      "build": "expo export:web",
      "build:web": "expo export:web",
      "build:android": "eas build --platform android",
      "build:ios": "eas build --platform ios",
      "prebuild": "expo prebuild --clean",
      "backend:dev": "cd backend && bun run dev",
      "backend:build": "cd backend && bun run build",
      "backend:start": "cd backend && bun run start",
      "dev": "concurrently \"npm run backend:dev\" \"npm run start\"",
      "fix-text-nodes": "node fix-text-nodes.js",
      "check-config": "node -e \"console.log(require('./app.config.js').default)\""
    },
    dependencies: {
      ...backupJson.dependencies,
      "@hono/node-server": "^1.16.0",
      "@hono/trpc-server": "^0.4.0",
      "@types/better-sqlite3": "^7.6.13",
      "@types/uuid": "^10.0.0",
      "babel-plugin-transform-import-meta": "^2.3.3",
      "better-sqlite3": "^12.2.0",
      "drizzle-kit": "^0.31.4",
      "drizzle-orm": "^0.44.3",
      "expo-audio": "~0.4.8",
      "expo-av": "~15.1.7",
      "expo-blur": "~14.1.5",
      "expo-camera": "~16.1.10",
      "expo-document-picker": "~13.1.6",
      "expo-file-system": "~18.1.11",
      "expo-haptics": "~14.1.4",
      "expo-image-picker": "~16.1.4",
      "expo-linear-gradient": "~14.1.5",
      "expo-localization": "~16.1.6",
      "expo-location": "~18.1.6",
      "expo-media-library": "~17.1.7",
      "expo-notifications": "~0.31.4",
      "expo-sqlite": "~15.2.14",
      "expo-symbols": "~0.4.5",
      "expo-system-ui": "~5.0.10",
      "expo-video": "~2.2.2",
      "expo-web-browser": "~14.2.0",
      "hono": "^4.8.5",
      "mysql2": "^3.14.2",
      "nativewind": "^4.1.23",
      "react-error-boundary": "^6.0.0",
      "serve": "^14.2.4",
      "sqlite3": "^5.1.7",
      "ts-node": "^10.9.2",
      "uuid": "^11.1.0",
      "zustand": "^5.0.2"
    },
    devDependencies: {
      ...backupJson.devDependencies,
      "@expo/ngrok": "^4.1.0",
      "@types/jest": "^29.5.5",
      "@typescript-eslint/eslint-plugin": "^6.7.0",
      "@typescript-eslint/parser": "^6.7.0",
      "concurrently": "^8.2.2",
      "eslint": "^8.50.0",
      "eslint-config-expo": "~9.2.0",
      "jest": "^29.7.0"
    },
    expo: {
      ...backupJson.expo,
      doctor: {
        reactNativeDirectoryCheck: {
          listUnknownPackages: false
        }
      }
    }
  };
  
  // Write the restored package.json
  fs.writeFileSync(targetPath, JSON.stringify(restoredPackage, null, 2));
  
  console.log('✅ Successfully restored package.json');
  console.log('📦 Package.json has been fixed with proper JSON structure');
  console.log('🚀 You can now run: npm install');
  
} catch (error) {
  console.error('❌ Error restoring package.json:', error.message);
  process.exit(1);
}