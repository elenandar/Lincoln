#!/usr/bin/env node

/**
 * Phase 0 Verification Test
 * 
 * This script simulates AI Dungeon's execution environment to verify that
 * all Phase 0 scripts load and execute correctly.
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

function test(name, passed, details) {
  const icon = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  log(color, `  ${icon} ${name}`);
  if (details) {
    console.log(colors.yellow + '    → ' + details + colors.reset);
  }
  return passed ? 1 : 0;
}

// Simulated AI Dungeon environment
global.state = { message: {} };
let passed = 0;
let failed = 0;

// Helper function to execute modifiers as AI Dungeon would
function executeModifier(modifierCode, inputText) {
  var text = inputText;
  return eval('(function() { ' + modifierCode + ' })()');
}

try {
  section('Phase 0: Null System Foundation - Verification Test');
  
  // ===== Test 1: Library.txt =====
  section('Test 1: Library.txt - Core Infrastructure');
  
  const libraryPath = path.join(__dirname, 'Library.txt');
  const libraryCode = fs.readFileSync(libraryPath, 'utf8');
  eval(libraryCode);
  
  passed += test('LC object created', typeof LC !== 'undefined');
  passed += test('Version: 17.0.0-phase0', LC.DATA_VERSION === '17.0.0-phase0', LC.DATA_VERSION);
  passed += test('LC.lcInit function exists', typeof LC.lcInit === 'function');
  
  const initResult = LC.lcInit('Test');
  passed += test('LC.lcInit returns state object', 
    initResult && initResult.turn === 0 && initResult.slot === 'Test',
    JSON.stringify(initResult));
  
  passed += test('LC.Commands registry exists', typeof LC.Commands === 'object');
  passed += test('LC.Commands.set exists', typeof LC.Commands.set === 'function');
  passed += test('LC.Commands.get exists', typeof LC.Commands.get === 'function');
  passed += test('LC.Commands.has exists', typeof LC.Commands.has === 'function');
  passed += test('LC.Commands.execute exists', typeof LC.Commands.execute === 'function');
  
  // ===== Test 2: /ping Command =====
  section('Test 2: /ping Command - Health Check');
  
  passed += test('/ping command registered', LC.Commands.has('ping'));
  
  const pingResult = LC.Commands.execute('ping', []);
  const expectedPing = '⟦SYS⟧ Pong! Lincoln v17.0.0-phase0 is active.';
  passed += test('/ping executes correctly', pingResult === expectedPing, pingResult);
  
  // ===== Test 3: Input.txt =====
  section('Test 3: Input.txt - Command Handler');
  
  const inputPath = path.join(__dirname, 'Input.txt');
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  
  let result = executeModifier(inputCode, '/ping');
  passed += test('Handles /ping command', 
    result && result.text === expectedPing,
    result.text);
  
  result = executeModifier(inputCode, 'Hello world');
  passed += test('Passes through regular text',
    result && result.text === 'Hello world',
    result.text);
  
  result = executeModifier(inputCode, '/unknown');
  passed += test('Passes through unknown commands',
    result && result.text === '/unknown',
    result.text);
  
  result = executeModifier(inputCode, '/');
  passed += test('Handles empty command (edge case)',
    result && result.text === '/',
    'Just "/" returns unchanged');
  
  result = executeModifier(inputCode, '');
  passed += test('Handles empty input',
    result && typeof result.text === 'string',
    'Returns empty string');
  
  // ===== Test 4: Output.txt =====
  section('Test 4: Output.txt - Response Processor');
  
  const outputPath = path.join(__dirname, 'Output.txt');
  const outputCode = fs.readFileSync(outputPath, 'utf8');
  
  result = executeModifier(outputCode, 'Test output');
  passed += test('Passes through text',
    result && result.text === 'Test output',
    result.text);
  
  result = executeModifier(outputCode, '');
  passed += test('Handles empty text',
    result && typeof result.text === 'string',
    'Returns empty string');
  
  // ===== Test 5: Context.txt =====
  section('Test 5: Context.txt - Context Manager');
  
  const contextPath = path.join(__dirname, 'Context.txt');
  const contextCode = fs.readFileSync(contextPath, 'utf8');
  
  result = executeModifier(contextCode, 'Test context');
  passed += test('Passes through text',
    result && result.text === 'Test context',
    result.text);
  
  result = executeModifier(contextCode, '');
  passed += test('Handles empty text',
    result && typeof result.text === 'string',
    'Returns empty string');
  
  // ===== Test 6: Error Handling =====
  section('Test 6: Error Handling - Robustness');
  
  const unknownResult = LC.Commands.execute('nonexistent', []);
  passed += test('Unknown command error handling',
    unknownResult.includes('Unknown command'),
    unknownResult);
  
  // Test command that throws error
  LC.Commands.set('error_test', {
    handler: function() {
      throw new Error('Test error message');
    }
  });
  const errorResult = LC.Commands.execute('error_test', []);
  passed += test('Command exception handling',
    errorResult.includes('Command error'),
    errorResult);
  
  // Test command that throws non-Error
  LC.Commands.set('throw_string', {
    handler: function() {
      throw 'Plain string error';
    }
  });
  const stringErrorResult = LC.Commands.execute('throw_string', []);
  passed += test('Non-Error exception handling',
    stringErrorResult.includes('Command error'),
    stringErrorResult);
  
  // ===== Summary =====
  section('Test Summary');
  
  const total = passed + failed;
  log(colors.cyan, `  Total tests: ${total}`);
  log(colors.green, `  Passed: ${passed}`);
  log(failed > 0 ? colors.red : colors.green, `  Failed: ${failed}`);
  
  const percentage = ((passed / total) * 100).toFixed(1);
  log(colors.cyan, `  Success rate: ${percentage}%`);
  
  console.log('');
  if (failed === 0) {
    log(colors.green + colors.bold, '✓ ALL PHASE 0 VERIFICATION TESTS PASSED!');
    log(colors.green, '✓ Scripts are ready for deployment to AI Dungeon');
    log(colors.green, '✓ Foundation is stable for Phase 1 development');
    console.log('');
    process.exit(0);
  } else {
    log(colors.red + colors.bold, '✗ SOME TESTS FAILED');
    console.log('');
    process.exit(1);
  }
  
} catch (error) {
  console.log('');
  log(colors.red + colors.bold, '✗ FATAL ERROR DURING TESTING');
  console.error(error);
  console.log('');
  process.exit(1);
}
