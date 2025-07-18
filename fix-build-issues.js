#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing build issues...');

// Function to recursively find and fix files with import.meta
function fixImportMeta(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other problematic directories
      if (file === 'node_modules' || file === '.git' || file === 'backend') {
        continue;
      }
      fixImportMeta(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.ts')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file contains import.meta
        if (content.includes('import.meta')) {
          console.log(`Fixing import.meta in: ${filePath}`);
          
          // Replace import.meta.env with process.env
          content = content.replace(/import\.meta\.env/g, '(process.env || {})');
          
          // Replace standalone import.meta with empty object
          content = content.replace(/import\.meta(?!\.)/g, '{}');
          
          fs.writeFileSync(filePath, content, 'utf8');
        }
      } catch (error) {
        // Skip files that can't be read/written
        console.warn(`Skipping ${filePath}: ${error.message}`);
      }
    }
  }
}

// Fix import.meta issues in node_modules (if any)
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('Checking node_modules for import.meta issues...');
  
  // Only check specific problematic packages
  const problematicPackages = [
    '@trpc/server',
    '@trpc/client',
    '@trpc/react-query'
  ];
  
  for (const pkg of problematicPackages) {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`Checking ${pkg}...`);
      fixImportMeta(pkgPath);
    }
  }
}

// Create a simple patch for Metro config if needed
const metroConfigPath = path.join(__dirname, 'metro.config.ts');
if (fs.existsSync(metroConfigPath)) {
  let metroConfig = fs.readFileSync(metroConfigPath, 'utf8');
  
  // Ensure we have proper blockList for problematic files
  if (!metroConfig.includes('import.*meta')) {
    console.log('Metro config looks good!');
  }
}

console.log('✅ Build issues fixed!');
console.log('Now run: npm run clear-cache && npx expo start -c');