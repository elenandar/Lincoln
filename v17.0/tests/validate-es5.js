#!/usr/bin/env node
// ============================================================================
// Lincoln v17 ES5 Compliance Validator
// ============================================================================
// Validates all Lincoln v17 scripts for ES5 compatibility
// Checks for forbidden ES6+ features that won't work in AI Dungeon
// ============================================================================

const fs = require('fs');
const path = require('path');

// Configuration
const scriptsDir = path.join(__dirname, '../Scripts');
const testPatterns = [
  // ES6+ Features
  { pattern: /\bnew\s+Map\s*\(/, name: 'Map constructor', severity: 'ERROR' },
  { pattern: /\bnew\s+Set\s*\(/, name: 'Set constructor', severity: 'ERROR' },
  { pattern: /\bnew\s+WeakMap\s*\(/, name: 'WeakMap constructor', severity: 'ERROR' },
  { pattern: /\bnew\s+WeakSet\s*\(/, name: 'WeakSet constructor', severity: 'ERROR' },
  { pattern: /\basync\s+function/, name: 'async function', severity: 'ERROR' },
  { pattern: /\bawait\s+/, name: 'await keyword', severity: 'ERROR' },
  { pattern: /\bclass\s+\w+/, name: 'class declaration', severity: 'ERROR' },
  { pattern: /\bextends\s+\w+/, name: 'class inheritance', severity: 'ERROR' },
  { pattern: /\bsuper\(/, name: 'super keyword', severity: 'ERROR' },
  { pattern: /\bimport\s+/, name: 'import statement', severity: 'ERROR' },
  { pattern: /\bexport\s+/, name: 'export statement', severity: 'ERROR' },
  { pattern: /\byield\s+/, name: 'yield keyword', severity: 'ERROR' },
  { pattern: /function\s*\*/, name: 'generator function', severity: 'ERROR' },
  { pattern: /`[^`]*\$\{/, name: 'template literals', severity: 'WARNING' },
  { pattern: /\.includes\(/, name: 'Array.includes()', severity: 'ERROR' },
  { pattern: /\.find\(/, name: 'Array.find()', severity: 'WARNING' },
  { pattern: /\.findIndex\(/, name: 'Array.findIndex()', severity: 'WARNING' },
  { pattern: /\.fill\(/, name: 'Array.fill()', severity: 'WARNING' },
  { pattern: /\.from\(/, name: 'Array.from()', severity: 'ERROR' },
  { pattern: /\.of\(/, name: 'Array.of()', severity: 'WARNING' },
  { pattern: /\.entries\(/, name: 'Object.entries()', severity: 'WARNING' },
  { pattern: /\.values\(/, name: 'Object.values()', severity: 'WARNING' },
  { pattern: /\.assign\(/, name: 'Object.assign()', severity: 'WARNING' },
  { pattern: /\.startsWith\(/, name: 'String.startsWith()', severity: 'WARNING' },
  { pattern: /\.endsWith\(/, name: 'String.endsWith()', severity: 'WARNING' },
  { pattern: /\.repeat\(/, name: 'String.repeat()', severity: 'WARNING' },
  { pattern: /\.padStart\(/, name: 'String.padStart()', severity: 'WARNING' },
  { pattern: /\.padEnd\(/, name: 'String.padEnd()', severity: 'WARNING' },
  { pattern: /\bSymbol\(/, name: 'Symbol', severity: 'ERROR' },
  { pattern: /\bProxy\(/, name: 'Proxy', severity: 'ERROR' },
  { pattern: /\bReflect\./, name: 'Reflect API', severity: 'ERROR' },
  { pattern: /\bPromise\(/, name: 'Promise', severity: 'ERROR' },
];

// Allowed patterns (exceptions)
const allowedPatterns = [
  /\/\*[\s\S]*?\*\//,  // Block comments
  /\/\/.*$/,           // Line comments
  /\*\s+@param.*=>/,   // JSDoc with arrow in param description
  /function\s*\(/,     // Regular functions
];

// Results
let totalFiles = 0;
let totalErrors = 0;
let totalWarnings = 0;
let issues = [];

// Helper: Check if line is a comment or allowed pattern
function isAllowedContext(line) {
  for (const pattern of allowedPatterns) {
    if (pattern.test(line)) {
      return true;
    }
  }
  return false;
}

// Helper: Remove comments from code
function removeComments(code) {
  // Remove block comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove line comments
  code = code.replace(/\/\/.*$/gm, '');
  return code;
}

// Validate a file
function validateFile(filePath) {
  const fileName = path.basename(filePath);
  const code = fs.readFileSync(filePath, 'utf8');
  const lines = code.split('\n');
  const cleanCode = removeComments(code);
  
  let fileErrors = 0;
  let fileWarnings = 0;
  
  console.log(`\nChecking: ${fileName}`);
  console.log('─'.repeat(60));
  
  // Check for arrow functions (special case - check in clean code)
  const arrowFunctionPattern = /\w+\s*=>\s*\w+/;
  if (arrowFunctionPattern.test(cleanCode)) {
    issues.push({
      file: fileName,
      severity: 'ERROR',
      feature: 'arrow function',
      line: 'multiple',
      code: '(detected in cleaned code)'
    });
    fileErrors++;
    console.log(`  ✗ ERROR: arrow function detected`);
  }
  
  // Check each test pattern
  for (const test of testPatterns) {
    const matches = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip if line is in allowed context
      if (isAllowedContext(line)) {
        continue;
      }
      
      if (test.pattern.test(line)) {
        matches.push({ lineNum: i + 1, line: line.trim() });
      }
    }
    
    if (matches.length > 0) {
      for (const match of matches) {
        issues.push({
          file: fileName,
          severity: test.severity,
          feature: test.name,
          line: match.lineNum,
          code: match.line
        });
        
        if (test.severity === 'ERROR') {
          fileErrors++;
          console.log(`  ✗ ERROR: ${test.name} at line ${match.lineNum}`);
        } else {
          fileWarnings++;
          console.log(`  ⚠ WARNING: ${test.name} at line ${match.lineNum}`);
        }
      }
    }
  }
  
  if (fileErrors === 0 && fileWarnings === 0) {
    console.log(`  ✓ No issues found`);
  } else {
    console.log(`  Summary: ${fileErrors} error(s), ${fileWarnings} warning(s)`);
  }
  
  totalErrors += fileErrors;
  totalWarnings += fileWarnings;
}

// Main
console.log('============================================================================');
console.log('Lincoln v17 ES5 Compliance Validator');
console.log('============================================================================');

// Find all script files
const scriptFiles = fs.readdirSync(scriptsDir)
  .filter(f => !f.startsWith('.'))
  .map(f => path.join(scriptsDir, f));

totalFiles = scriptFiles.length;

// Validate each file
scriptFiles.forEach(validateFile);

// Summary
console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Files Checked:    ${totalFiles}`);
console.log(`Total Errors:     ${totalErrors}`);
console.log(`Total Warnings:   ${totalWarnings}`);

// Detailed report if issues found
if (issues.length > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('DETAILED ISSUE REPORT');
  console.log('='.repeat(60));
  
  const errors = issues.filter(i => i.severity === 'ERROR');
  const warnings = issues.filter(i => i.severity === 'WARNING');
  
  if (errors.length > 0) {
    console.log('\nERRORS (Must Fix):');
    console.log('-'.repeat(60));
    errors.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.file}:${issue.line}] ${issue.feature}`);
      console.log(`   ${issue.code.substring(0, 70)}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\nWARNINGS (Review Recommended):');
    console.log('-'.repeat(60));
    warnings.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.file}:${issue.line}] ${issue.feature}`);
      console.log(`   ${issue.code.substring(0, 70)}`);
    });
  }
}

console.log('\n' + '='.repeat(60));
if (totalErrors === 0) {
  console.log('✓ ES5 COMPLIANCE VERIFIED');
  console.log('All scripts are ES5-compatible and ready for AI Dungeon.');
  process.exit(0);
} else {
  console.log('✗ ES5 COMPLIANCE FAILED');
  console.log(`Found ${totalErrors} critical error(s) that must be fixed.`);
  process.exit(1);
}
