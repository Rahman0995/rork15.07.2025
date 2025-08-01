#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing broken package.json...');

// Fixed package.json content
const fixedPackageJson = {
  "name": "military-unit-management-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel",
    "start-web": "bunx rork start -p jwjevnxtm1q2kz7xwsgmz --web --tunnel",
    "start-web-dev": "DEBUG=expo* bunx rork start -p jwjevnxtm1q2kz7xwsgmz --web --tunnel",
    "start-local": "expo start --localhost",
    "start-lan": "expo start --lan",
    "start-tunnel": "expo start --tunnel",
    "build": "expo export --platform web --output-dir dist",
    "build:web": "expo export --platform web --output-dir dist",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "test": "jest",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "clean": "expo r -c",
    "prebuild": "expo prebuild --clean",
    "backend:dev": "cd backend && bun run dev",
    "backend:build": "cd backend && bun run build",
    "backend:start": "cd backend && bun run start",
    "dev": "concurrently \"npm run backend:dev\" \"npm run start\"",
    "fix-text-nodes": "node fix-text-nodes.js",
    "check-config": "node -e \"console.log(require('./app.config.js').default)\""
  },
  "dependencies": {
    "@expo/cli": "^0.24.20",
    "@expo/config-plugins": "~10.1.1",
    "@expo/metro-config": "^0.20.17",
    "@expo/vector-icons": "^14.1.0",
    "@hono/node-server": "^1.16.0",
    "@hono/trpc-server": "^0.4.0",
    "@nkzw/create-context-hook": "^1.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/native": "^7.1.6",
    "@tanstack/react-query": "^5.83.0",
    "@trpc/client": "^11.4.3",
    "@trpc/react-query": "^11.4.3",
    "@trpc/server": "^11.4.3",
    "@types/better-sqlite3": "^7.6.13",
    "@types/uuid": "^10.0.0",
    "babel-plugin-transform-import-meta": "^2.3.3",
    "babel-preset-expo": "~13.0.0",
    "better-sqlite3": "^12.2.0",
    "drizzle-kit": "^0.31.4",
    "drizzle-orm": "^0.44.3",
    "expo": "53.0.20",
    "expo-audio": "~0.4.8",
    "expo-av": "~15.1.7",
    "expo-blur": "~14.1.5",
    "expo-camera": "~16.1.10",
    "expo-constants": "~17.1.7",
    "expo-document-picker": "~13.1.6",
    "expo-file-system": "~18.1.11",
    "expo-font": "~13.3.2",
    "expo-haptics": "~14.1.4",
    "expo-image": "~2.4.0",
    "expo-image-picker": "~16.1.4",
    "expo-linear-gradient": "~14.1.5",
    "expo-linking": "~7.1.7",
    "expo-localization": "~16.1.6",
    "expo-location": "~18.1.6",
    "expo-media-library": "~17.1.7",
    "expo-notifications": "~0.31.4",
    "expo-router": "~5.1.4",
    "expo-splash-screen": "~0.30.10",
    "expo-sqlite": "~15.2.14",
    "expo-status-bar": "~2.2.3",
    "expo-symbols": "~0.4.5",
    "expo-system-ui": "~5.0.10",
    "expo-video": "~2.2.2",
    "expo-web-browser": "~14.2.0",
    "hono": "^4.8.5",
    "lucide-react-native": "0.475.0",
    "mysql2": "^3.14.2",
    "nativewind": "^4.1.23",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-error-boundary": "^6.0.0",
    "react-native": "0.79.5",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.1",
    "react-native-svg": "15.11.2",
    "react-native-web": "^0.20.0",
    "serve": "^14.2.4",
    "sqlite3": "^5.1.7",
    "superjson": "^2.2.2",
    "ts-node": "^10.9.2",
    "uuid": "^11.1.0",
    "zod": "^4.0.5",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@expo/ngrok": "^4.1.0",
    "@types/react": "~19.0.10",
    "@types/jest": "^29.5.5",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    "@typescript-eslint/parser": "^6.7.0",
    "concurrently": "^8.2.2",
    "eslint": "^8.50.0",
    "eslint-config-expo": "~9.2.0",
    "jest": "^29.7.0",
    "typescript": "~5.8.3"
  },
  "private": true,
  "expo": {
    "web": {
      "bundler": "metro"
    },
    "doctor": {
      "reactNativeDirectoryCheck": {
        "listUnknownPackages": false
      }
    }
  }
};

try {
  // Backup current broken package.json
  const currentPackageJson = fs.readFileSync('package.json', 'utf8');
  fs.writeFileSync('package.json.broken.backup', currentPackageJson);
  console.log('✅ Backed up broken package.json to package.json.broken.backup');

  // Write fixed package.json
  fs.writeFileSync('package.json', JSON.stringify(fixedPackageJson, null, 2));
  console.log('✅ Fixed package.json with proper JSON structure');

  console.log('\n🎯 FIXED ISSUES:');
  console.log('   - Removed malformed expo.scripts section');
  console.log('   - Fixed JSON syntax errors');
  console.log('   - Updated build script for web deployment');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('   1. Test with: npm run build');
  console.log('   2. For Netlify: Update build command to "npm run build"');
  console.log('   3. Your app should now build successfully');

} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
  process.exit(1);
}