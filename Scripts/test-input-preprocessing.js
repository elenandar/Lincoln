#!/usr/bin/env node

/**
 * Test: AI Dungeon Input Preprocessing
 * 
 * This test verifies that Input.txt can detect and extract commands
 * from all AI Dungeon input formats across Do, Say, and Story modes.
 * 
 * AI Dungeon preprocesses user input differently per mode:
 * - Do mode:    "> You /ping." or "You /ping."
 * - Say mode:   "> You say "/ping"" or "You say '/ping'"
 * - Story mode: "/ping" (raw) or "  /ping"
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

function section(title) {
  console.log('\n' + colors.cyan + colors.bold + '═'.repeat(70) + colors.reset);
  log(colors.cyan + colors.bold, '  ' + title);
  console.log(colors.cyan + colors.bold + '═'.repeat(70) + colors.reset);
}

// Simulated AI Dungeon environment
global.state = { lincoln: null };

// Helper function to execute modifiers
function executeModifier(modifierCode, inputText) {
  var text = inputText;
  return eval('(function() { ' + modifierCode + ' })()');
}

// Test cases representing real AI Dungeon input formats
const testCases = [
  // Story mode formats
  { input: '/ping', mode: 'Story', expected: true, desc: 'Raw command (story mode)' },
  { input: '  /ping  ', mode: 'Story', expected: true, desc: 'Raw command with whitespace' },
  { input: '/help', mode: 'Story', expected: true, desc: 'Help command (story mode)' },
  
  // Do mode formats
  { input: '> You /ping', mode: 'Do', expected: true, desc: 'Do mode with > prefix' },
  { input: '> You /ping.', mode: 'Do', expected: true, desc: 'Do mode with > prefix and period' },
  { input: 'You /ping', mode: 'Do', expected: true, desc: 'Do mode without > prefix' },
  { input: 'You /ping.', mode: 'Do', expected: true, desc: 'Do mode without > prefix with period' },
  { input: 'You /debug!', mode: 'Do', expected: true, desc: 'Do mode with exclamation' },
  { input: '> You /help?', mode: 'Do', expected: true, desc: 'Do mode with question mark' },
  
  // Say mode formats
  { input: '> You say "/ping"', mode: 'Say', expected: true, desc: 'Say mode with > and double quotes' },
  { input: "You say '/ping'", mode: 'Say', expected: true, desc: 'Say mode with single quotes' },
  { input: 'You say "/help"', mode: 'Say', expected: true, desc: 'Say mode help command' },
  { input: '> You say "/debug"', mode: 'Say', expected: true, desc: 'Say mode debug command' },
  { input: 'You say "/ping."', mode: 'Say', expected: true, desc: 'Say mode with period in quotes' },
  { input: 'You say "/ping"!', mode: 'Say', expected: true, desc: 'Say mode with punctuation after' },
  
  // Edge cases
  { input: '/ping arg1 arg2', mode: 'Story', expected: true, desc: 'Command with arguments' },
  { input: 'You /turn set 100', mode: 'Do', expected: true, desc: 'Multi-arg command in Do mode' },
  { input: '/', mode: 'Story', expected: false, desc: 'Just slash (invalid)' },
  { input: 'You /', mode: 'Do', expected: false, desc: 'Just slash in Do mode (invalid)' },
  { input: 'look around', mode: 'Story', expected: false, desc: 'Normal input (not a command)' },
  { input: 'You look around', mode: 'Do', expected: false, desc: 'Normal Do action (not a command)' },
  { input: 'You say "hello"', mode: 'Say', expected: false, desc: 'Normal Say dialog (not a command)' },
];

let passCount = 0;
let failCount = 0;
let testResults = [];

try {
  section('AI Dungeon Input Preprocessing Test');
  
  // Load scripts
  const libraryPath = path.join(__dirname, 'Library.txt');
  const inputPath = path.join(__dirname, 'Input.txt');
  
  const libraryCode = fs.readFileSync(libraryPath, 'utf8');
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  
  // Initialize library
  eval(libraryCode);
  LC.lcInit('Test');
  
  section('Testing Command Detection Across All Modes');
  
  testCases.forEach((testCase, index) => {
    // Reset state
    LC.Drafts.clear();
    if (state.lincoln) {
      state.lincoln._commandExecuted = false;
    }
    
    // Execute input modifier
    const result = executeModifier(inputCode, testCase.input);
    
    // Check if command was detected
    const commandDetected = state.lincoln && state.lincoln._commandExecuted === true;
    const draftsQueued = LC.Drafts.getAll().length > 0;
    
    // Verify expected behavior
    const passed = (commandDetected === testCase.expected) && 
                   (testCase.expected ? draftsQueued : true);
    
    if (passed) {
      passCount++;
      log(colors.green, `  ✓ Test ${index + 1}: ${testCase.desc}`);
      log(colors.green, `    Input: "${testCase.input.substring(0, 40)}${testCase.input.length > 40 ? '...' : ''}"`);
      log(colors.green, `    Mode: ${testCase.mode} | Detected: ${commandDetected} | Expected: ${testCase.expected}`);
    } else {
      failCount++;
      log(colors.red, `  ✗ Test ${index + 1}: ${testCase.desc}`);
      log(colors.red, `    Input: "${testCase.input}"`);
      log(colors.red, `    Mode: ${testCase.mode} | Detected: ${commandDetected} | Expected: ${testCase.expected}`);
      log(colors.red, `    Drafts: ${draftsQueued} | Flag: ${state.lincoln._commandExecuted}`);
    }
    
    testResults.push({
      test: testCase.desc,
      passed: passed,
      input: testCase.input,
      mode: testCase.mode,
      detected: commandDetected,
      expected: testCase.expected
    });
  });
  
  section('Additional Edge Case Tests');
  
  // Test command extraction with multiple spaces
  LC.Drafts.clear();
  state.lincoln._commandExecuted = false;
  const multiSpaceResult = executeModifier(inputCode, 'You   /ping');
  const multiSpaceDetected = state.lincoln._commandExecuted === true;
  if (multiSpaceDetected) {
    passCount++;
    log(colors.green, '  ✓ Multiple spaces handled: "You   /ping"');
  } else {
    failCount++;
    log(colors.red, '  ✗ Multiple spaces FAILED: "You   /ping"');
  }
  
  // Test case sensitivity
  LC.Drafts.clear();
  state.lincoln._commandExecuted = false;
  const upperCaseResult = executeModifier(inputCode, '/PING');
  const upperCaseDetected = state.lincoln._commandExecuted === true;
  if (upperCaseDetected) {
    passCount++;
    log(colors.green, '  ✓ Case insensitive: "/PING" detected');
  } else {
    failCount++;
    log(colors.red, '  ✗ Case sensitivity FAILED: "/PING" not detected');
  }
  
  // Test mixed case prefixes
  LC.Drafts.clear();
  state.lincoln._commandExecuted = false;
  const mixedCaseResult = executeModifier(inputCode, 'YOU say "/ping"');
  const mixedCaseDetected = state.lincoln._commandExecuted === true;
  if (mixedCaseDetected) {
    passCount++;
    log(colors.green, '  ✓ Mixed case prefix: "YOU say \\"/ping\\""');
  } else {
    failCount++;
    log(colors.red, '  ✗ Mixed case prefix FAILED: "YOU say \\"/ping\\""');
  }
  
  section('Test Summary');
  
  const totalTests = passCount + failCount;
  const successRate = (passCount / totalTests * 100).toFixed(1);
  
  console.log(`\n  Total tests: ${totalTests}`);
  console.log(`  Passed: ${passCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Success rate: ${successRate}%\n`);
  
  if (failCount === 0) {
    log(colors.green + colors.bold, '✓ ALL INPUT PREPROCESSING TESTS PASSED!');
    log(colors.green, '✓ Commands work across all AI Dungeon modes');
    log(colors.green, '✓ All edge cases handled correctly');
    process.exit(0);
  } else {
    log(colors.red + colors.bold, '✗ SOME TESTS FAILED');
    log(colors.yellow, '\nFailed tests:');
    testResults.filter(r => !r.passed).forEach(r => {
      log(colors.yellow, `  - ${r.test}: "${r.input}"`);
      log(colors.yellow, `    Detected: ${r.detected}, Expected: ${r.expected}`);
    });
    process.exit(1);
  }
  
} catch (e) {
  log(colors.red + colors.bold, '\n✗ TEST EXECUTION FAILED');
  console.error(e);
  process.exit(1);
}
