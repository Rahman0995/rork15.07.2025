#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive Deployment Fix');
console.log('===============================');

function createFixedPackageJson() {
  console.log('📦 Fixing package.json...');
  
  const fixedPackage = {
    "name": "military-unit-management-app",
    "main": "expo-router/entry",
    "version": "1.0.0",
    "scripts": {
      "start": "bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel",
      "start-web": "bunx rork start -p jwjevnxtm1q2kz7xwsgmz --web --tunnel",
      "start-local": "expo start --localhost",
      "build": "expo export:web",
      "build:web": "expo export:web",
      "build:netlify": "npx expo export:web && mkdir -p dist && cp -r web-build/* dist/",
      "test": "jest",
      "lint": "eslint .",
      "type-check": "tsc --noEmit",
      "prebuild": "expo prebuild --clean",
      "backend:dev": "cd backend && bun run dev",
      "backend:start": "cd backend && bun run start",
      "dev": "concurrently \"npm run backend:dev\" \"npm run start\""
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
      "babel-preset-expo": "~13.0.0",
      "better-sqlite3": "^12.2.0",
      "drizzle-orm": "^0.44.3",
      "expo": "53.0.20",
      "expo-constants": "~17.1.7",
      "expo-font": "~13.3.2",
      "expo-image": "~2.4.0",
      "expo-linking": "~7.1.7",
      "expo-router": "~5.1.4",
      "expo-splash-screen": "~0.30.10",
      "expo-status-bar": "~2.2.3",
      "hono": "^4.8.5",
      "lucide-react-native": "0.475.0",
      "react": "19.0.0",
      "react-dom": "19.0.0",
      "react-native": "0.79.5",
      "react-native-gesture-handler": "~2.24.0",
      "react-native-reanimated": "~3.17.4",
      "react-native-safe-area-context": "5.4.0",
      "react-native-screens": "~4.11.1",
      "react-native-svg": "15.11.2",
      "react-native-web": "^0.20.0",
      "superjson": "^2.2.2",
      "zod": "^4.0.5"
    },
    "devDependencies": {
      "@babel/core": "^7.25.2",
      "@types/react": "~19.0.10",
      "concurrently": "^8.2.2",
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
  
  fs.writeFileSync('package.json', JSON.stringify(fixedPackage, null, 2));
  console.log('✅ Fixed package.json');
}

function createNetlifyConfig() {
  console.log('🌐 Creating Netlify configuration...');
  
  const netlifyToml = `[build]
  command = "npm run build:netlify"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
  EXPO_PUBLIC_API_URL = "https://your-backend-url.railway.app/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

  fs.writeFileSync('netlify.toml', netlifyToml);
  console.log('✅ Created netlify.toml');
}

function createAppConfig() {
  console.log('⚙️ Creating app configuration...');
  
  const appConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web support
config.resolver.platforms = ['web', 'ios', 'android'];

module.exports = {
  expo: {
    name: "Military Unit Management",
    slug: "military-unit-management-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "military-app",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};
`;

  fs.writeFileSync('app.config.js', appConfig);
  console.log('✅ Created app.config.js');
}

function createBuildScript() {
  console.log('🔨 Creating build script...');
  
  const buildScript = `#!/bin/bash
set -e

echo "🚀 Building for deployment..."

# Clean previous builds
rm -rf web-build dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build web version
echo "🌐 Building web version..."
npx expo export:web

# Create dist folder and copy files
echo "📁 Preparing distribution..."
mkdir -p dist
cp -r web-build/* dist/

echo "✅ Build complete!"
echo "📂 Files ready in dist/ folder"
`;

  fs.writeFileSync('build.sh', buildScript);
  fs.chmodSync('build.sh', '755');
  console.log('✅ Created build.sh');
}

function main() {
  try {
    createFixedPackageJson();
    createNetlifyConfig();
    createAppConfig();
    createBuildScript();
    
    console.log('');
    console.log('🎉 ALL FIXES APPLIED SUCCESSFULLY!');
    console.log('==================================');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Update EXPO_PUBLIC_API_URL in netlify.toml with your backend URL');
    console.log('2. Run: npm install');
    console.log('3. Test locally: npm run build');
    console.log('4. Commit and push to GitHub');
    console.log('5. Deploy will work automatically');
    console.log('');
    console.log('🔗 To find your backend URL:');
    console.log('   - Check Railway dashboard');
    console.log('   - Or run: node find-backend-url.js');
    console.log('');
    console.log('✅ Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Error applying fixes:', error.message);
    process.exit(1);
  }
}

main();