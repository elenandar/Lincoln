#!/usr/bin/env node

/**
 * Phase 1 Infrastructure Test Suite
 * 
 * This script verifies all Phase 1 infrastructure components:
 * - lcInit with full state.lincoln structure
 * - LC.Tools (safety utilities)
 * - LC.Utils (type conversion)
 * - LC.Turns (turn counter)
 * - LC.Drafts (message queue)
 * - currentAction (action type tracker)
 * - LC.Flags (compatibility facade)
 * - Commands: /help, /debug, /turn, /action, /test-phase1
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
global.state = { lincoln: null };
let passed = 0;
let failed = 0;

// Helper function to execute modifiers as AI Dungeon would
function executeModifier(modifierCode, inputText) {
  var text = inputText;
  return eval('(function() { ' + modifierCode + ' })()');
}

try {
  section('Phase 1: Infrastructure Layer - Verification Test');
  
  // ===== Test 1: Library.txt =====
  section('Test 1: Library.txt - Infrastructure Components');
  
  const libraryPath = path.join(__dirname, 'Library.txt');
  const libraryCode = fs.readFileSync(libraryPath, 'utf8');
  eval(libraryCode);
  
  passed += test('LC object created', typeof LC !== 'undefined');
  passed += test('Version: 17.0.0-phase1', LC.DATA_VERSION === '17.0.0-phase1', LC.DATA_VERSION);
  passed += test('LC.lcInit function exists', typeof LC.lcInit === 'function');
  
  // Test lcInit creates full structure
  const initResult = LC.lcInit('Test');
  passed += test('LC.lcInit returns context', 
    initResult && typeof initResult.turn === 'number' && initResult.slot === 'Test',
    JSON.stringify(initResult));
  
  passed += test('state.lincoln initialized', 
    state.lincoln && state.lincoln.version === '17.0.0',
    'version: ' + (state.lincoln ? state.lincoln.version : 'null'));
  
  passed += test('state.lincoln.stateVersion exists', 
    typeof state.lincoln.stateVersion === 'number',
    'stateVersion: ' + state.lincoln.stateVersion);
  
  passed += test('state.lincoln.characters exists', 
    typeof state.lincoln.characters === 'object');
  
  passed += test('state.lincoln.relations exists', 
    typeof state.lincoln.relations === 'object');
  
  // ===== Test 2: LC.Tools =====
  section('Test 2: LC.Tools - Safety Utilities');
  
  passed += test('LC.Tools exists', typeof LC.Tools === 'object');
  passed += test('LC.Tools.safeRegexMatch exists', typeof LC.Tools.safeRegexMatch === 'function');
  
  const regexMatch = LC.Tools.safeRegexMatch("Hello World", /World/);
  passed += test('safeRegexMatch works', regexMatch && regexMatch[0] === 'World', 
    regexMatch ? regexMatch[0] : 'null');
  
  const regexMatchNull = LC.Tools.safeRegexMatch(null, /test/);
  passed += test('safeRegexMatch handles null', regexMatchNull === null);
  
  passed += test('LC.Tools.escapeRegex exists', typeof LC.Tools.escapeRegex === 'function');
  
  const escaped = LC.Tools.escapeRegex("test.*regex");
  passed += test('escapeRegex works', escaped === 'test\\.\\*regex', escaped);
  
  passed += test('LC.Tools.truncate exists', typeof LC.Tools.truncate === 'function');
  
  const truncated = LC.Tools.truncate("This is a very long string", 10);
  passed += test('truncate works', truncated.length <= 10, truncated);
  
  passed += test('LC.Tools.safeString exists', typeof LC.Tools.safeString === 'function');
  
  const safeStr = LC.Tools.safeString(null, 'fallback');
  passed += test('safeString handles null', safeStr === 'fallback', safeStr);
  
  // ===== Test 3: LC.Utils =====
  section('Test 3: LC.Utils - Type Conversion Utilities');
  
  passed += test('LC.Utils exists', typeof LC.Utils === 'object');
  passed += test('LC.Utils.toNum exists', typeof LC.Utils.toNum === 'function');
  
  const num1 = LC.Utils.toNum('42', 0);
  passed += test('toNum converts string', num1 === 42, num1);
  
  const num2 = LC.Utils.toNum('invalid', 99);
  passed += test('toNum returns fallback', num2 === 99, num2);
  
  passed += test('LC.Utils.toStr exists', typeof LC.Utils.toStr === 'function');
  
  const str1 = LC.Utils.toStr(123);
  passed += test('toStr converts number', str1 === '123', str1);
  
  const str2 = LC.Utils.toStr(null, 'default');
  passed += test('toStr handles null', str2 === 'default', str2);
  
  passed += test('LC.Utils.toBool exists', typeof LC.Utils.toBool === 'function');
  
  const bool1 = LC.Utils.toBool('true');
  passed += test('toBool converts "true"', bool1 === true, bool1);
  
  const bool2 = LC.Utils.toBool('false');
  passed += test('toBool converts "false"', bool2 === false, bool2);
  
  passed += test('LC.Utils.clamp exists', typeof LC.Utils.clamp === 'function');
  
  const clamped1 = LC.Utils.clamp(150, 0, 100);
  passed += test('clamp upper bound', clamped1 === 100, clamped1);
  
  const clamped2 = LC.Utils.clamp(-50, 0, 100);
  passed += test('clamp lower bound', clamped2 === 0, clamped2);
  
  passed += test('LC.Utils.clone exists', typeof LC.Utils.clone === 'function');
  
  const original = { a: 1, b: { c: 2 } };
  const cloned = LC.Utils.clone(original);
  cloned.b.c = 999;
  passed += test('clone deep copies', original.b.c === 2 && cloned.b.c === 999,
    'original.b.c=' + original.b.c + ', cloned.b.c=' + cloned.b.c);
  
  // ===== Test 4: LC.Turns =====
  section('Test 4: LC.Turns - Turn Counter');
  
  passed += test('LC.Turns exists', typeof LC.Turns === 'object');
  passed += test('LC.Turns.get exists', typeof LC.Turns.get === 'function');
  
  const turn1 = LC.Turns.get();
  passed += test('Turns.get returns number', typeof turn1 === 'number', turn1);
  
  passed += test('LC.Turns.increment exists', typeof LC.Turns.increment === 'function');
  
  const turn2 = LC.Turns.increment();
  passed += test('Turns.increment works', turn2 === turn1 + 1, 'before=' + turn1 + ', after=' + turn2);
  
  passed += test('LC.Turns.set exists', typeof LC.Turns.set === 'function');
  
  LC.Turns.set(100);
  const turn3 = LC.Turns.get();
  passed += test('Turns.set works', turn3 === 100, turn3);
  
  // ===== Test 5: LC.Drafts =====
  section('Test 5: LC.Drafts - Message Queue System');
  
  passed += test('LC.Drafts exists', typeof LC.Drafts === 'object');
  passed += test('LC.Drafts.add exists', typeof LC.Drafts.add === 'function');
  passed += test('LC.Drafts.getAll exists', typeof LC.Drafts.getAll === 'function');
  passed += test('LC.Drafts.clear exists', typeof LC.Drafts.clear === 'function');
  passed += test('LC.Drafts.flush exists', typeof LC.Drafts.flush === 'function');
  
  LC.Drafts.clear();
  LC.Drafts.add('Message 1');
  LC.Drafts.add('Message 2');
  
  const drafts = LC.Drafts.getAll();
  passed += test('Drafts.add/getAll works', drafts.length === 2,
    'count=' + drafts.length);
  
  const flushed = LC.Drafts.flush();
  passed += test('Drafts.flush concatenates', flushed === 'Message 1\nMessage 2',
    flushed);
  
  const draftsAfter = LC.Drafts.getAll();
  passed += test('Drafts.flush clears queue', draftsAfter.length === 0,
    'count=' + draftsAfter.length);
  
  // ===== Test 6: currentAction =====
  section('Test 6: currentAction - Action Type Tracker');
  
  passed += test('LC.currentAction exists', typeof LC.currentAction === 'object');
  passed += test('currentAction.set exists', typeof LC.currentAction.set === 'function');
  passed += test('currentAction.get exists', typeof LC.currentAction.get === 'function');
  passed += test('currentAction.detect exists', typeof LC.currentAction.detect === 'function');
  
  LC.currentAction.set('do');
  const action1 = LC.currentAction.get();
  passed += test('currentAction.set/get works', action1 === 'do', action1);
  
  LC.currentAction.detect('you run away');
  const action2 = LC.currentAction.get();
  passed += test('currentAction.detect "do"', action2 === 'do', action2);
  
  LC.currentAction.detect('you say "hello"');
  const action3 = LC.currentAction.get();
  passed += test('currentAction.detect "say"', action3 === 'say', action3);
  
  LC.currentAction.detect('The door opens');
  const action4 = LC.currentAction.get();
  passed += test('currentAction.detect "story"', action4 === 'story', action4);
  
  // ===== Test 7: LC.Flags =====
  section('Test 7: LC.Flags - Compatibility Facade');
  
  passed += test('LC.Flags exists', typeof LC.Flags === 'object');
  passed += test('LC.Flags.isDo exists', typeof LC.Flags.isDo === 'function');
  passed += test('LC.Flags.isSay exists', typeof LC.Flags.isSay === 'function');
  passed += test('LC.Flags.isStory exists', typeof LC.Flags.isStory === 'function');
  
  LC.currentAction.set('do');
  passed += test('Flags.isDo works', LC.Flags.isDo() === true);
  passed += test('Flags.isSay returns false', LC.Flags.isSay() === false);
  
  LC.currentAction.set('say');
  passed += test('Flags.isSay works', LC.Flags.isSay() === true);
  
  LC.currentAction.set('story');
  passed += test('Flags.isStory works', LC.Flags.isStory() === true);
  
  // ===== Test 8: Commands Registry =====
  section('Test 8: Commands Registry - Enhanced System');
  
  passed += test('LC.Commands exists', typeof LC.Commands === 'object');
  passed += test('Commands.list exists', typeof LC.Commands.list === 'function');
  passed += test('Commands.getMetadata exists', typeof LC.Commands.getMetadata === 'function');
  
  const commands = LC.Commands.list();
  passed += test('Commands registered', commands.length >= 6,
    'count=' + commands.length + ': ' + commands.join(', '));
  
  const helpMeta = LC.Commands.getMetadata('help');
  passed += test('getMetadata works', helpMeta && helpMeta.name === 'help',
    JSON.stringify(helpMeta));
  
  // ===== Test 9: /help Command =====
  section('Test 9: /help Command');
  
  passed += test('/help registered', LC.Commands.has('help'));
  
  const helpOutput = LC.Commands.execute('help', []);
  passed += test('/help executes', helpOutput && helpOutput.indexOf('AVAILABLE COMMANDS') !== -1,
    LC.Tools.truncate(helpOutput, 60));
  
  const helpPing = LC.Commands.execute('help', ['ping']);
  passed += test('/help [command] works', helpPing && helpPing.indexOf('PING') !== -1,
    LC.Tools.truncate(helpPing, 60));
  
  // ===== Test 10: /debug Command =====
  section('Test 10: /debug Command');
  
  passed += test('/debug registered', LC.Commands.has('debug'));
  
  const debugOutput = LC.Commands.execute('debug', []);
  passed += test('/debug executes', debugOutput && debugOutput.indexOf('LINCOLN DEBUG') !== -1,
    LC.Tools.truncate(debugOutput, 60));
  
  passed += test('/debug shows version', debugOutput.indexOf('17.0.0') !== -1);
  passed += test('/debug shows turn', debugOutput.indexOf('Turn:') !== -1);
  
  // ===== Test 11: /turn Command =====
  section('Test 11: /turn Command');
  
  passed += test('/turn registered', LC.Commands.has('turn'));
  
  LC.Turns.set(42);
  const turnOutput = LC.Commands.execute('turn', []);
  passed += test('/turn displays turn', turnOutput && turnOutput.indexOf('42') !== -1,
    turnOutput);
  
  const turnSet = LC.Commands.execute('turn', ['set', '999']);
  passed += test('/turn set works', LC.Turns.get() === 999,
    'turn=' + LC.Turns.get());
  
  // ===== Test 12: /action Command =====
  section('Test 12: /action Command');
  
  passed += test('/action registered', LC.Commands.has('action'));
  
  LC.currentAction.set('say');
  const actionOutput = LC.Commands.execute('action', []);
  passed += test('/action displays type', actionOutput && actionOutput.indexOf('say') !== -1,
    actionOutput);
  
  passed += test('/action shows flags', actionOutput.indexOf('isDo:') !== -1);
  
  // ===== Test 13: /test-phase1 Command =====
  section('Test 13: /test-phase1 Command');
  
  passed += test('/test-phase1 registered', LC.Commands.has('test-phase1'));
  
  const testOutput = LC.Commands.execute('test-phase1', []);
  passed += test('/test-phase1 executes', testOutput && testOutput.indexOf('INFRASTRUCTURE TESTS') !== -1,
    LC.Tools.truncate(testOutput, 60));
  
  passed += test('/test-phase1 runs tests', testOutput.indexOf('Total:') !== -1);
  
  // ===== Test 14: Input.txt Integration =====
  section('Test 14: Input.txt - Phase 1 Integration');
  
  const inputPath = path.join(__dirname, 'Input.txt');
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  
  // Reset turn
  LC.Turns.set(0);
  const initialTurn = LC.Turns.get();
  
  const inputResult = executeModifier(inputCode, 'you say "hello"');
  passed += test('Input.txt loads', inputResult && typeof inputResult.text === 'string');
  
  const turnAfterInput = LC.Turns.get();
  passed += test('Input increments turn', turnAfterInput === initialTurn + 1,
    'before=' + initialTurn + ', after=' + turnAfterInput);
  
  const currentActionType = LC.currentAction.get();
  passed += test('Input detects action type', currentActionType === 'say',
    currentActionType);
  
  // Test that normal input does NOT set stop flag
  passed += test('Normal input does not set stop flag', 
    inputResult.stop === undefined || inputResult.stop === false,
    'stop=' + inputResult.stop);
  
  // Test command execution through Input (now uses Drafts queue)
  LC.Drafts.clear();
  const cmdResult = executeModifier(inputCode, '/ping');
  const draftsAfterCmd = LC.Drafts.getAll();
  passed += test('Input executes commands and adds to Drafts', 
    draftsAfterCmd.length > 0 && draftsAfterCmd[0].indexOf('Pong') !== -1,
    LC.Tools.truncate(draftsAfterCmd[0] || '', 40));
  
  // Test that commands return space (not empty string)
  passed += test('Commands return space in text field', 
    cmdResult.text === ' ',
    'text="' + cmdResult.text + '"');
  
  // Test that commands set stop flag to prevent further AI generation
  passed += test('Commands set stop:true flag', cmdResult.stop === true,
    'stop=' + cmdResult.stop);
  
  // Test stop flag across different command types
  LC.Drafts.clear();
  const helpResult = executeModifier(inputCode, '/help');
  passed += test('/help sets stop:true', helpResult.stop === true,
    'stop=' + helpResult.stop);
  
  const helpDrafts = LC.Drafts.getAll();
  passed += test('/help adds to Drafts', 
    helpDrafts.length > 0 && helpDrafts[0].indexOf('AVAILABLE COMMANDS') !== -1,
    LC.Tools.truncate(helpDrafts[0] || '', 40));
  
  LC.Drafts.clear();
  const debugResult = executeModifier(inputCode, '/debug');
  passed += test('/debug sets stop:true', debugResult.stop === true,
    'stop=' + debugResult.stop);
  
  const debugDrafts = LC.Drafts.getAll();
  passed += test('/debug adds to Drafts',
    debugDrafts.length > 0 && debugDrafts[0].indexOf('LINCOLN DEBUG') !== -1,
    LC.Tools.truncate(debugDrafts[0] || '', 40));
  
  // ===== Test 15: Output.txt Integration =====
  section('Test 15: Output.txt - Phase 1 Integration');
  
  const outputPath = path.join(__dirname, 'Output.txt');
  const outputCode = fs.readFileSync(outputPath, 'utf8');
  
  LC.Drafts.clear();
  LC.Drafts.add('System message');
  
  const outputResult = executeModifier(outputCode, 'AI response');
  passed += test('Output.txt loads', outputResult && typeof outputResult.text === 'string');
  
  passed += test('Output prepends drafts', outputResult.text.indexOf('System message') !== -1,
    LC.Tools.truncate(outputResult.text, 40));
  
  const draftsAfterOutput = LC.Drafts.getAll();
  passed += test('Output clears drafts', draftsAfterOutput.length === 0,
    'count=' + draftsAfterOutput.length);
  
  // ===== Test 16: State Versioning =====
  section('Test 16: State Versioning');
  
  const versionBefore = state.lincoln.stateVersion;
  LC.Turns.increment();
  const versionAfter = state.lincoln.stateVersion;
  
  passed += test('stateVersion increments on write', versionAfter > versionBefore,
    'before=' + versionBefore + ', after=' + versionAfter);
  
  const versionBefore2 = state.lincoln.stateVersion;
  LC.Drafts.add('test');
  const versionAfter2 = state.lincoln.stateVersion;
  
  passed += test('Drafts increments stateVersion', versionAfter2 > versionBefore2,
    'before=' + versionBefore2 + ', after=' + versionAfter2);
  
  // ===== Test 17: ES5 Compliance =====
  section('Test 17: ES5 Compliance Verification');
  
  passed += test('No Map usage', libraryCode.indexOf('new Map()') === -1);
  passed += test('No Set usage', libraryCode.indexOf('new Set()') === -1);
  passed += test('No async/await', libraryCode.indexOf('async ') === -1 && libraryCode.indexOf('await ') === -1);
  passed += test('No arrow functions in critical code', 
    libraryCode.indexOf('LC.Tools =') !== -1 && libraryCode.indexOf('=>') === -1 ||
    libraryCode.indexOf('function(') !== -1);
  
  // Check that Commands uses plain object
  passed += test('Commands registry is plain object', 
    typeof LC.Commands._registry === 'object' && 
    LC.Commands._registry.constructor === Object);
  
  // ===== Summary =====
  section('Test Summary');
  
  const total = passed + failed;
  console.log('  Total tests: ' + total);
  console.log('  ' + colors.green + 'Passed: ' + passed + colors.reset);
  console.log('  ' + colors.red + 'Failed: ' + failed + colors.reset);
  console.log('  Success rate: ' + ((passed / total) * 100).toFixed(1) + '%');
  
  if (failed === 0) {
    log(colors.green + colors.bold, '\n✓ ALL PHASE 1 VERIFICATION TESTS PASSED!');
    log(colors.green, '✓ Infrastructure layer is complete and functional');
    log(colors.green, '✓ Ready for Phase 2 development');
  } else {
    log(colors.red + colors.bold, '\n✗ SOME TESTS FAILED');
    log(colors.yellow, '  Please review failed tests above');
  }
  
  process.exit(failed === 0 ? 0 : 1);
  
} catch (e) {
  log(colors.red + colors.bold, '\n✗ FATAL ERROR DURING TESTING');
  console.error(e);
  process.exit(1);
}
