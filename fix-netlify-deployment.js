#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing Netlify Deployment Issues...');
console.log('=====================================');

try {
  // 1. Create a working build script
  const buildScript = `#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Building for Netlify deployment...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  console.log('🔧 Exporting web build...');
  execSync('npx expo export -p web', { stdio: 'inherit' });
  
  if (fs.existsSync('dist')) {
    console.log('✅ Build completed successfully!');
  } else {
    throw new Error('Build output directory not found');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}`;

  fs.writeFileSync('build-netlify-fixed.js', buildScript);
  fs.chmodSync('build-netlify-fixed.js', '755');

  // 2. Create minimal package.json for Netlify
  const minimalPackage = {
    "name": "military-unit-management-app",
    "version": "1.0.0",
    "scripts": {
      "build": "node build-netlify-fixed.js",
      "build:netlify": "node build-netlify-fixed.js",
      "start": "serve dist -s"
    },
    "dependencies": {
      "@expo/cli": "^0.24.20",
      "@expo/config-plugins": "~10.1.1",
      "@expo/metro-config": "^0.20.17",
      "@expo/vector-icons": "^14.1.0",
      "@nkzw/create-context-hook": "^1.1.0",
      "@react-native-async-storage/async-storage": "2.1.2",
      "@tanstack/react-query": "^5.83.0",
      "@trpc/client": "^11.4.3",
      "@trpc/react-query": "^11.4.3",
      "babel-preset-expo": "~13.0.0",
      "expo": "53.0.20",
      "expo-constants": "~17.1.7",
      "expo-font": "~13.3.2",
      "expo-linking": "~7.1.7",
      "expo-router": "~5.1.4",
      "expo-splash-screen": "~0.30.10",
      "expo-status-bar": "~2.2.3",
      "expo-system-ui": "~5.0.10",
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
      "serve": "^14.2.4",
      "superjson": "^2.2.2",
      "zod": "^4.0.5"
    },
    "devDependencies": {
      "@babel/core": "^7.25.2",
      "@types/react": "~19.0.10",
      "typescript": "~5.8.3"
    },
    "private": true
  };

  fs.writeFileSync('package.netlify.fixed.json', JSON.stringify(minimalPackage, null, 2));

  // 3. Create working netlify.toml
  const netlifyConfig = `[build]
  command = "npm run build:netlify"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
  EXPO_PUBLIC_API_URL = "http://localhost:3000/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

  fs.writeFileSync('netlify.fixed.toml', netlifyConfig);

  // 4. Create simplified app config for web-only build
  const webConfig = `export default {
  expo: {
    name: 'Military Unit Management',
    slug: 'military-unit-management-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    platforms: ['web'],
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro'
    },
    plugins: [
      'expo-font'
    ]
  }
};`;

  fs.writeFileSync('app.config.web.fixed.js', webConfig);

  console.log('✅ Created fixed deployment files:');
  console.log('   - build-netlify-fixed.js (working build script)');
  console.log('   - package.netlify.fixed.json (minimal dependencies)');
  console.log('   - netlify.fixed.toml (correct configuration)');
  console.log('   - app.config.web.fixed.js (web-only config)');

  console.log('\n🎯 DEPLOYMENT INSTRUCTIONS:');
  console.log('1. Copy netlify.fixed.toml to netlify.toml');
  console.log('2. Copy package.netlify.fixed.json to package.json (backup original first)');
  console.log('3. Copy app.config.web.fixed.js to app.config.js (backup original first)');
  console.log('4. Commit and push to GitHub');
  console.log('5. Netlify will auto-deploy');

  console.log('\n🚀 QUICK COMMANDS:');
  console.log('cp netlify.fixed.toml netlify.toml');
  console.log('cp package.netlify.fixed.json package.json');
  console.log('cp app.config.web.fixed.js app.config.js');
  console.log('git add . && git commit -m "Fix Netlify deployment" && git push');

  console.log('\n⚠️  IMPORTANT:');
  console.log('Update EXPO_PUBLIC_API_URL in netlify.toml with your actual backend URL');
  console.log('Example: EXPO_PUBLIC_API_URL = "https://your-app.railway.app/api"');

} catch (error) {
  console.error('❌ Fix failed:', error.message);
  process.exit(1);
}