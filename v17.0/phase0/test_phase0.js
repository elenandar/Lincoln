#!/usr/bin/env node
// ============================================================================
// Phase 0 Test Script - Syntax and Basic Functionality Verification
// ============================================================================
// This script verifies that all Phase 0 scripts:
// 1. Have valid JavaScript syntax
// 2. Follow the modifier pattern correctly
// 3. Initialize state properly
// 4. Commands execute without errors
//
// Run with: node test_phase0.js
// ============================================================================

var fs = require('fs');
var path = require('path');

console.log('============================================');
console.log('Phase 0 Script Verification Test');
console.log('============================================\n');

var testsPassed = 0;
var testsFailed = 0;

// Helper function to create test result
function test(description, fn) {
  try {
    fn();
    console.log('✓ ' + description);
    testsPassed++;
  } catch (e) {
    console.log('✗ ' + description);
    console.log('  Error: ' + e.message);
    testsFailed++;
  }
}

// Mock AI Dungeon globals
var state = {};
var info = {actionCount: 0};
var history = [];
var storyCards = [];

function addStoryCard(keys, entry, type) {
  storyCards.push({keys: keys, entry: entry, type: type});
  return storyCards.length;
}

function updateStoryCard(index, keys, entry, type) {
  if (index < 0 || index >= storyCards.length) {
    throw new Error('Invalid index');
  }
  storyCards[index] = {keys: keys, entry: entry, type: type};
}

function removeStoryCard(index) {
  if (index < 0 || index >= storyCards.length) {
    throw new Error('Invalid index');
  }
  storyCards.splice(index, 1);
}

// Read and execute scripts
var scriptsDir = __dirname;

console.log('Loading scripts from: ' + scriptsDir + '\n');

// ============================================================================
// Test 1: Load Library.txt
// ============================================================================

console.log('--- Testing Library.txt ---\n');

test('Library.txt exists', function() {
  var libraryPath = path.join(scriptsDir, 'Library.txt');
  if (!fs.existsSync(libraryPath)) {
    throw new Error('Library.txt not found');
  }
});

test('Library.txt has valid syntax', function() {
  var libraryPath = path.join(scriptsDir, 'Library.txt');
  var libraryCode = fs.readFileSync(libraryPath, 'utf8');
  // Try to parse it - will throw if syntax error
  new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', libraryCode);
});

test('Library.txt executes without error', function() {
  var libraryPath = path.join(scriptsDir, 'Library.txt');
  var libraryCode = fs.readFileSync(libraryPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', libraryCode);
  fn('test', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
});

test('state.shared.LC created', function() {
  if (!state.shared || !state.shared.LC) {
    throw new Error('state.shared.LC not created');
  }
});

test('LC.VERSION is correct', function() {
  if (state.shared.LC.VERSION !== '17.0.0-phase0') {
    throw new Error('Expected version 17.0.0-phase0, got ' + state.shared.LC.VERSION);
  }
});

test('LC.lcInit function exists', function() {
  if (typeof state.shared.LC.lcInit !== 'function') {
    throw new Error('lcInit is not a function');
  }
});

test('state.lincoln initialized', function() {
  var L = state.shared.LC.lcInit();
  if (!L) {
    throw new Error('lcInit did not return state.lincoln');
  }
  if (!state.lincoln) {
    throw new Error('state.lincoln not created');
  }
});

test('state.lincoln has correct structure', function() {
  var L = state.lincoln;
  if (!L.characters || typeof L.characters !== 'object') throw new Error('characters missing');
  if (!L.relations || typeof L.relations !== 'object') throw new Error('relations missing');
  if (!L.hierarchy || typeof L.hierarchy !== 'object') throw new Error('hierarchy missing');
  if (!L.time || typeof L.time !== 'object') throw new Error('time missing');
  if (!L.environment || typeof L.environment !== 'object') throw new Error('environment missing');
  if (!Array.isArray(L.rumors)) throw new Error('rumors not array');
  if (!Array.isArray(L.evergreen)) throw new Error('evergreen not array');
  if (!Array.isArray(L.secrets)) throw new Error('secrets not array');
  if (!Array.isArray(L.myths)) throw new Error('myths not array');
  if (!Array.isArray(L.lore)) throw new Error('lore not array');
  if (!L.goals || typeof L.goals !== 'object') throw new Error('goals missing');
});

test('CommandsRegistry is plain object', function() {
  var CR = state.shared.LC.CommandsRegistry;
  if (!CR || typeof CR !== 'object') {
    throw new Error('CommandsRegistry is not an object');
  }
  if (CR.constructor !== Object) {
    throw new Error('CommandsRegistry is not a plain object');
  }
});

test('/ping command registered', function() {
  if (typeof state.shared.LC.CommandsRegistry['/ping'] !== 'function') {
    throw new Error('/ping command not registered');
  }
});

test('/debug command registered', function() {
  if (typeof state.shared.LC.CommandsRegistry['/debug'] !== 'function') {
    throw new Error('/debug command not registered');
  }
});

test('/test-phase0 command registered', function() {
  if (typeof state.shared.LC.CommandsRegistry['/test-phase0'] !== 'function') {
    throw new Error('/test-phase0 command not registered');
  }
});

test('/help command registered', function() {
  if (typeof state.shared.LC.CommandsRegistry['/help'] !== 'function') {
    throw new Error('/help command not registered');
  }
});

test('/ping command returns correct message', function() {
  var result = state.shared.LC.CommandsRegistry['/ping']();
  if (!result || !result.text) {
    throw new Error('No text returned');
  }
  if (result.text.indexOf('Pong!') === -1) {
    throw new Error('Expected "Pong!" in response, got: ' + result.text);
  }
  if (result.text.indexOf('17.0.0-phase0') === -1) {
    throw new Error('Expected version in response');
  }
});

test('/debug command returns system info', function() {
  var result = state.shared.LC.CommandsRegistry['/debug']();
  if (!result || !result.text) {
    throw new Error('No text returned');
  }
  if (result.text.indexOf('Version:') === -1) {
    throw new Error('Expected version info');
  }
  if (result.text.indexOf('Turn:') === -1) {
    throw new Error('Expected turn info');
  }
});

test('/test-phase0 command passes', function() {
  var result = state.shared.LC.CommandsRegistry['/test-phase0']();
  if (!result || !result.text) {
    throw new Error('No text returned');
  }
  if (result.text.indexOf('PASSED') === -1) {
    throw new Error('Phase 0 verification failed: ' + result.text);
  }
});

// ============================================================================
// Test 2: Load Input.txt
// ============================================================================

console.log('\n--- Testing Input.txt ---\n');

test('Input.txt exists', function() {
  var inputPath = path.join(scriptsDir, 'Input.txt');
  if (!fs.existsSync(inputPath)) {
    throw new Error('Input.txt not found');
  }
});

test('Input.txt has valid syntax', function() {
  var inputPath = path.join(scriptsDir, 'Input.txt');
  var inputCode = fs.readFileSync(inputPath, 'utf8');
  new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', inputCode);
});

test('Input.txt executes without error', function() {
  var inputPath = path.join(scriptsDir, 'Input.txt');
  var inputCode = fs.readFileSync(inputPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', inputCode);
  // Just verify it doesn't throw - the script itself doesn't return a value, it calls modifier(text)
  fn('test', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
});

test('Input.txt passes through normal text', function() {
  var inputPath = path.join(scriptsDir, 'Input.txt');
  var inputCode = fs.readFileSync(inputPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', inputCode + '; return modifier("hello world");');
  var result = fn('hello world', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
  if (!result || !result.text) {
    throw new Error('No result returned');
  }
  if (result.text !== 'hello world') {
    throw new Error('Expected pass-through, got: ' + result.text);
  }
});

test('Input.txt handles /ping command', function() {
  var inputPath = path.join(scriptsDir, 'Input.txt');
  var inputCode = fs.readFileSync(inputPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', inputCode + '; return modifier("/ping");');
  var result = fn('/ping', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
  if (!result || !result.text) {
    throw new Error('No result returned');
  }
  if (result.text.indexOf('Pong!') === -1) {
    throw new Error('Expected Pong response, got: ' + result.text);
  }
});

test('Input.txt handles unknown command', function() {
  var inputPath = path.join(scriptsDir, 'Input.txt');
  var inputCode = fs.readFileSync(inputPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', inputCode + '; return modifier("/unknown");');
  var result = fn('/unknown', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
  if (!result || !result.text) {
    throw new Error('No result returned');
  }
  if (result.text.indexOf('Unknown command') === -1) {
    throw new Error('Expected unknown command message, got: ' + result.text);
  }
});

// ============================================================================
// Test 3: Load Output.txt
// ============================================================================

console.log('\n--- Testing Output.txt ---\n');

test('Output.txt exists', function() {
  var outputPath = path.join(scriptsDir, 'Output.txt');
  if (!fs.existsSync(outputPath)) {
    throw new Error('Output.txt not found');
  }
});

test('Output.txt has valid syntax', function() {
  var outputPath = path.join(scriptsDir, 'Output.txt');
  var outputCode = fs.readFileSync(outputPath, 'utf8');
  new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', outputCode);
});

test('Output.txt executes without error', function() {
  var outputPath = path.join(scriptsDir, 'Output.txt');
  var outputCode = fs.readFileSync(outputPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', outputCode + '; return modifier("test");');
  var result = fn('test', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
  if (!result) {
    throw new Error('Output modifier did not return a result');
  }
});

test('Output.txt passes through text unchanged', function() {
  var outputPath = path.join(scriptsDir, 'Output.txt');
  var outputCode = fs.readFileSync(outputPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', outputCode + '; return modifier("AI output text");');
  var result = fn('AI output text', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
  if (!result || result.text !== 'AI output text') {
    throw new Error('Expected pass-through, got: ' + (result ? result.text : 'no result'));
  }
});

// ============================================================================
// Test 4: Load Context.txt
// ============================================================================

console.log('\n--- Testing Context.txt ---\n');

test('Context.txt exists', function() {
  var contextPath = path.join(scriptsDir, 'Context.txt');
  if (!fs.existsSync(contextPath)) {
    throw new Error('Context.txt not found');
  }
});

test('Context.txt has valid syntax', function() {
  var contextPath = path.join(scriptsDir, 'Context.txt');
  var contextCode = fs.readFileSync(contextPath, 'utf8');
  new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', contextCode);
});

test('Context.txt executes without error', function() {
  var contextPath = path.join(scriptsDir, 'Context.txt');
  var contextCode = fs.readFileSync(contextPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', contextCode + '; return modifier("test");');
  var result = fn('test', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
  if (!result) {
    throw new Error('Context modifier did not return a result');
  }
});

test('Context.txt passes through text unchanged', function() {
  var contextPath = path.join(scriptsDir, 'Context.txt');
  var contextCode = fs.readFileSync(contextPath, 'utf8');
  var fn = new Function('text', 'state', 'info', 'history', 'storyCards', 'addStoryCard', 'updateStoryCard', 'removeStoryCard', contextCode + '; return modifier("context text");');
  var result = fn('context text', state, info, history, storyCards, addStoryCard, updateStoryCard, removeStoryCard);
  if (!result || result.text !== 'context text') {
    throw new Error('Expected pass-through, got: ' + (result ? result.text : 'no result'));
  }
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n============================================');
console.log('Test Summary');
console.log('============================================');
console.log('Passed: ' + testsPassed);
console.log('Failed: ' + testsFailed);

if (testsFailed > 0) {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
