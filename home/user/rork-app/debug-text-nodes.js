#!/usr/bin/env node

// Script to find potential text node issues in React Native files
const fs = require('fs');
const path = require('path');

// Patterns that commonly cause text node errors
const problematicPatterns = [
  // Literal periods or text outside of Text components
  />\s*\.\s*</g,
  /}\s*\.\s*{/g,
  />\s*[А-Яа-яA-Za-z0-9]+\s*</g,
  // Template literals that might evaluate to strings
  /\$\{[^}]*\}\s*\./g,
  /\.\s*\$\{[^}]*\}/g,
  // Conditional rendering that might return strings
  /\{\s*[^}]*\s*\?\s*[^:]*\s*:\s*[^}]*\s*\}/g,
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for common problematic patterns
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Look for periods that might be rendered as text nodes
      if (line.includes('>') && line.includes('<') && line.includes('.')) {
        // Check if there's a period between JSX elements
        const periodBetweenElements = />\s*\.\s*</g.test(line);
        if (periodBetweenElements) {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            issue: 'Period between JSX elements'
          });
        }
      }
      
      // Look for template literals with periods
      if (line.includes('${') && line.includes('.')) {
        const templateWithPeriod = /\$\{[^}]*\}[^}]*\./g.test(line) || /\.\s*\$\{[^}]*\}/g.test(line);
        if (templateWithPeriod) {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            issue: 'Template literal with period'
          });
        }
      }
      
      // Look for conditional rendering that might return strings
      if (line.includes('?') && line.includes(':') && line.includes('{') && line.includes('}')) {
        const conditionalString = /\{\s*[^}]*\s*\?\s*['"`][^'"`]*['"`]\s*:\s*[^}]*\s*\}/g.test(line);
        if (conditionalString) {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            issue: 'Conditional rendering with string literal'
          });
        }
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
    try {
      const items = fs.readdirSync(currentPath);
      
      items.forEach(item => {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanRecursive(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          const issues = scanFile(fullPath);
          allIssues.push(...issues);
        }
      });
    } catch (error) {
      console.error(`Error scanning directory ${currentPath}:`, error.message);
    }
  }
  
  scanRecursive(dirPath);
  return allIssues;
}

// Scan the project
const projectRoot = process.cwd();
const issues = scanDirectory(projectRoot);

if (issues.length > 0) {
  console.log('🔍 Found potential text node issues:');
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. 📁 File: ${issue.file}`);
    console.log(`   📍 Line: ${issue.line}`);
    console.log(`   ❌ Issue: ${issue.issue}`);
    console.log(`   📝 Content: ${issue.content}`);
  });
  
  console.log('\n💡 These patterns often cause "text node cannot be a child of View" errors.');
  console.log('💡 Make sure all text content is wrapped in <Text> components.');
} else {
  console.log('✅ No obvious text node issues found.');
  console.log('\n🔍 The error might be in:');
  console.log('   - Dynamic content that evaluates to a string');
  console.log('   - Conditional rendering that returns text');
  console.log('   - Template literals in JSX');
  console.log('   - String concatenation in render methods');
}

console.log('\n🚀 To run this script: node debug-text-nodes.js');