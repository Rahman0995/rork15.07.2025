#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Removing SQLite dependencies from package.json...');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove SQLite-related dependencies
const depsToRemove = [
  'better-sqlite3',
  '@types/better-sqlite3',
  'drizzle-kit',
  'drizzle-orm',
  'expo-sqlite'
];

let removed = [];

depsToRemove.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    removed.push(dep);
  }
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    delete packageJson.devDependencies[dep];
    removed.push(dep);
  }
});

if (removed.length > 0) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Removed dependencies:', removed.join(', '));
  console.log('📦 Please run "bun install" to update your lock file');
} else {
  console.log('ℹ️  No SQLite dependencies found to remove');
}