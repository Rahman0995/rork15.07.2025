#!/usr/bin/env node

// Script to find and fix text node issues in React Native files
const fs = require('fs');
const path = require('path');

// Common patterns that cause text node errors
const problematicPatterns = [
  /}>\\s*\\.\\s*</g,  // }. <
  />\\s*\\.\\s*</g,   // >. <
  /View>\\s*\\.\\s*</g, // View>. <
  /Text>\\s*\\.\\s*</g, // Text>. <
  /TouchableOpacity>\\s*\\.\\s*</g, // TouchableOpacity>. <
];

function findTextNodeIssues(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for common problematic patterns
    problematicPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            pattern: pattern.toString(),
            match: match.trim(),
            line: content.substring(0, content.indexOf(match)).split('\\n').length
          });
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath) {
  const allIssues = [];
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanRecursive(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const issues = findTextNodeIssues(fullPath);
        allIssues.push(...issues);
      }
    });
  }
  
  scanRecursive(dirPath);
  return allIssues;
}

// Scan the project
const projectRoot = process.cwd();
const issues = scanDirectory(projectRoot);

if (issues.length > 0) {
  console.log('Found potential text node issues:');
  issues.forEach(issue => {
    console.log(`\\n📁 File: ${issue.file}`);
    console.log(`📍 Line: ${issue.line}`);
    console.log(`🔍 Pattern: ${issue.pattern}`);
    console.log(`❌ Match: "${issue.match}"`);
  });
  
  console.log('\\n💡 These patterns often cause "text node cannot be a child of View" errors.');
  console.log('💡 Make sure all text content is wrapped in <Text> components.');
} else {
  console.log('✅ No obvious text node issues found in TypeScript/TSX files.');
  console.log('\\n🔍 The error might be in:');
  console.log('   - Dynamic content that evaluates to a string');
  console.log('   - Conditional rendering that returns text');
  console.log('   - Template literals in JSX');
  console.log('\\n💡 Check your recent changes for any text that\\'s not wrapped in <Text> tags.');
}

console.log('\\n🚀 To run this script: node fix-text-nodes.js');