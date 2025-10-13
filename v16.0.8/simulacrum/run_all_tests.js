#!/usr/bin/env node
/**
 * Legion Protocol, Part 1 - Master Test Runner
 * 
 * Командный центр для запуска всех видов тестов.
 * Рекурсивно находит и запускает все test_*.js файлы
 * во всех поддиректориях /tests и выводит единый отчет.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

console.log(colors.bright + colors.cyan);
console.log("╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║           LEGION PROTOCOL - MASTER TEST RUNNER                            ║");
console.log("║           Командный Центр Тестирования v1.0                               ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
console.log(colors.reset);
console.log();

const testsDir = path.join(__dirname, 'tests');
const testResults = {
  unit: { passed: 0, failed: 0, tests: [] },
  integration: { passed: 0, failed: 0, tests: [] },
  endurance: { passed: 0, failed: 0, tests: [] }
};

/**
 * Recursively find all test_*.js files in a directory
 */
function findTestFiles(dir, category) {
  const testFiles = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        testFiles.push(...findTestFiles(fullPath, category));
      } else if (entry.isFile() && entry.name.startsWith('test_') && entry.name.endsWith('.js')) {
        testFiles.push({ path: fullPath, name: entry.name, category });
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
  }
  
  return testFiles;
}

/**
 * Run a single test file and capture its output
 */
function runTest(testFile) {
  const startTime = Date.now();
  let passed = false;
  let output = '';
  
  try {
    // Run the test and capture output
    output = execSync(`node "${testFile.path}"`, {
      cwd: path.dirname(testFile.path),
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000 // 60 second timeout
    });
    passed = true;
  } catch (error) {
    // Test failed - capture error output
    output = error.stdout || error.stderr || error.message;
    passed = false;
  }
  
  const duration = Date.now() - startTime;
  
  return {
    name: testFile.name,
    category: testFile.category,
    passed,
    duration,
    output
  };
}

/**
 * Print a test result line
 */
function printTestResult(result) {
  const status = result.passed 
    ? colors.green + '✓ PASS' + colors.reset
    : colors.red + '✗ FAIL' + colors.reset;
  
  const duration = colors.gray + `(${result.duration}ms)` + colors.reset;
  const name = result.passed 
    ? result.name
    : colors.bright + result.name + colors.reset;
  
  console.log(`  ${status} ${name} ${duration}`);
}

/**
 * Print category summary
 */
function printCategorySummary(category, stats) {
  const total = stats.passed + stats.failed;
  if (total === 0) {
    console.log(colors.gray + `  No tests found` + colors.reset);
    return;
  }
  
  const passRate = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
  const status = stats.failed === 0 
    ? colors.green + '✓' + colors.reset
    : colors.red + '✗' + colors.reset;
  
  console.log(`  ${status} ${stats.passed}/${total} passed (${passRate}%)`);
}

// Main execution
console.log(colors.bright + "Scanning for tests..." + colors.reset);
console.log();

// Find all test files in each category
const categories = ['unit', 'integration', 'endurance'];
const allTests = [];

for (const category of categories) {
  const categoryDir = path.join(testsDir, category);
  const tests = findTestFiles(categoryDir, category);
  allTests.push(...tests);
}

console.log(`Found ${allTests.length} test file(s)\n`);

if (allTests.length === 0) {
  console.log(colors.yellow + "⚠ No test files found. Tests should be named test_*.js" + colors.reset);
  process.exit(0);
}

// Run all tests
console.log(colors.bright + "Running tests..." + colors.reset);
console.log();

for (const category of categories) {
  const categoryTests = allTests.filter(t => t.category === category);
  
  if (categoryTests.length === 0) continue;
  
  console.log(colors.bright + colors.cyan + `[${category.toUpperCase()}]` + colors.reset);
  
  for (const testFile of categoryTests) {
    const result = runTest(testFile);
    printTestResult(result);
    
    if (result.passed) {
      testResults[category].passed++;
    } else {
      testResults[category].failed++;
    }
    
    testResults[category].tests.push(result);
  }
  
  console.log();
}

// Print final summary
console.log();
console.log(colors.bright + "═".repeat(79) + colors.reset);
console.log(colors.bright + "SUMMARY" + colors.reset);
console.log(colors.bright + "═".repeat(79) + colors.reset);
console.log();

let totalPassed = 0;
let totalFailed = 0;

for (const category of categories) {
  const stats = testResults[category];
  const total = stats.passed + stats.failed;
  
  if (total > 0) {
    console.log(colors.bright + `${category.toUpperCase()}:` + colors.reset);
    printCategorySummary(category, stats);
    console.log();
    
    totalPassed += stats.passed;
    totalFailed += stats.failed;
  }
}

const grandTotal = totalPassed + totalFailed;
const overallPassRate = grandTotal > 0 ? Math.round((totalPassed / grandTotal) * 100) : 0;

console.log(colors.bright + "OVERALL:" + colors.reset);
console.log(`  Total: ${grandTotal} tests`);
console.log(`  Passed: ${colors.green}${totalPassed}${colors.reset}`);
console.log(`  Failed: ${colors.red}${totalFailed}${colors.reset}`);
console.log(`  Pass Rate: ${overallPassRate}%`);
console.log();

// Print failed test details if any
if (totalFailed > 0) {
  console.log(colors.bright + "═".repeat(79) + colors.reset);
  console.log(colors.bright + colors.red + "FAILED TESTS" + colors.reset);
  console.log(colors.bright + "═".repeat(79) + colors.reset);
  console.log();
  
  for (const category of categories) {
    const failedTests = testResults[category].tests.filter(t => !t.passed);
    
    if (failedTests.length > 0) {
      console.log(colors.bright + `[${category.toUpperCase()}]` + colors.reset);
      
      for (const test of failedTests) {
        console.log();
        console.log(colors.red + `✗ ${test.name}` + colors.reset);
        console.log(colors.gray + "─".repeat(79) + colors.reset);
        
        // Print last 20 lines of output
        const lines = test.output.split('\n');
        const relevantLines = lines.slice(-20);
        console.log(relevantLines.join('\n'));
        console.log();
      }
    }
  }
}

// Exit with appropriate code
console.log(colors.bright + "═".repeat(79) + colors.reset);
console.log();

if (totalFailed === 0) {
  console.log(colors.green + colors.bright + "✓ ALL TESTS PASSED" + colors.reset);
  console.log();
  process.exit(0);
} else {
  console.log(colors.red + colors.bright + "✗ SOME TESTS FAILED" + colors.reset);
  console.log();
  process.exit(1);
}
