#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove SQLite dependencies since we're using MySQL
  delete packageJson.dependencies['better-sqlite3'];
  delete packageJson.dependencies['@types/better-sqlite3'];
  
  // Write back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('✅ Removed SQLite dependencies from package.json');
  console.log('📝 You can now run: bun install');
  
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
  process.exit(1);
}