#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Simple Netlify Deployment Setup');
console.log('===================================');

try {
  // Create a simple build script
  const buildScript = `#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Building for Netlify...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Build the app
  console.log('🔧 Building web app...');
  execSync('npx expo export -p web', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}`;

  fs.writeFileSync('build-simple.js', buildScript);
  fs.chmodSync('build-simple.js', '755');

  // Update package.json for Netlify
  const packageJson = {
    "name": "military-unit-management-app",
    "version": "1.0.0",
    "scripts": {
      "build": "node build-simple.js",
      "build:netlify": "node build-simple.js",
      "start": "serve dist -s"
    },
    "dependencies": {
      "@expo/cli": "^0.24.20",
      "expo": "53.0.20",
      "react": "19.0.0",
      "react-dom": "19.0.0",
      "react-native": "0.79.5",
      "react-native-web": "^0.20.0",
      "serve": "^14.2.4"
    },
    "devDependencies": {
      "@babel/core": "^7.25.2",
      "typescript": "~5.8.3"
    }
  };

  fs.writeFileSync('package.netlify.simple.json', JSON.stringify(packageJson, null, 2));

  // Create simple netlify.toml
  const netlifyConfig = `[build]
  command = "npm run build:netlify"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

  fs.writeFileSync('netlify.simple.toml', netlifyConfig);

  console.log('✅ Created simplified Netlify deployment files:');
  console.log('   - build-simple.js');
  console.log('   - package.netlify.simple.json');
  console.log('   - netlify.simple.toml');
  console.log('');
  console.log('🎯 DEPLOYMENT STEPS:');
  console.log('1. Go to https://netlify.com');
  console.log('2. Sign in with GitHub');
  console.log('3. Click "New site from Git"');
  console.log('4. Connect your repository');
  console.log('5. Set build command: npm run build:netlify');
  console.log('6. Set publish directory: dist');
  console.log('7. Deploy!');
  console.log('');
  console.log('💡 Or copy the contents of netlify.simple.toml to netlify.toml');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}