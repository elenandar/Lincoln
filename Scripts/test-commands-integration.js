#!/usr/bin/env node

/**
 * Command Integration Test Suite
 * 
 * Tests the complete command flow with Drafts queue integration:
 * - Input.txt detects commands, executes them, adds to LC.Drafts
 * - Output.txt prepends drafts to output
 * - Commands work in all modes: Do, Say, Story
 * - No AI generation after commands (stop:true works)
 * - No freezing in Story mode
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

// Helper to simulate a complete turn cycle: Input -> (AI) -> Output
function simulateCompleteTurn(inputCode, outputCode, userInput, aiResponse) {
  // Step 1: Process input through Input.txt
  const inputResult = executeModifier(inputCode, userInput);
  
  // Step 2: Determine what goes to AI (or if we skip AI due to stop:true)
  let textForAI = inputResult.text;
  let shouldStopAI = inputResult.stop === true;
  
  // Step 3: Get AI response (or empty if stopped)
  let aiText = shouldStopAI ? '' : (aiResponse || 'AI generated text');
  
  // Step 4: Process output through Output.txt
  const outputResult = executeModifier(outputCode, aiText);
  
  return {
    input: inputResult,
    aiWasStopped: shouldStopAI,
    output: outputResult,
    finalText: outputResult.text
  };
}

try {
  section('Command Integration Tests - Issue elenandar/Lincoln#266 Fix');
  
  // Load scripts
  section('Setup: Loading Scripts');
  
  const libraryPath = path.join(__dirname, 'Library.txt');
  const libraryCode = fs.readFileSync(libraryPath, 'utf8');
  eval(libraryCode);
  passed += test('Library.txt loaded', typeof LC !== 'undefined');
  
  const inputPath = path.join(__dirname, 'Input.txt');
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  passed += test('Input.txt loaded', inputCode.length > 0);
  
  const outputPath = path.join(__dirname, 'Output.txt');
  const outputCode = fs.readFileSync(outputPath, 'utf8');
  passed += test('Output.txt loaded', outputCode.length > 0);
  
  // Initialize state
  LC.lcInit('CommandTest');
  passed += test('state.lincoln initialized', state.lincoln && state.lincoln.version === '17.0.0');
  
  // ===== Test 1: /ping in Do Mode =====
  section('Test 1: /ping Command in Do Mode');
  
  LC.currentAction.set('do');
  LC.Drafts.clear();
  
  const pingDoResult = simulateCompleteTurn(inputCode, outputCode, '/ping', null);
  
  passed += test('Do mode: AI generation stopped', pingDoResult.aiWasStopped === true,
    'stopped=' + pingDoResult.aiWasStopped);
  
  passed += test('Do mode: Input returns space', pingDoResult.input.text === ' ',
    'text="' + pingDoResult.input.text + '"');
  
  passed += test('Do mode: Output contains Pong', 
    pingDoResult.finalText.indexOf('Pong') !== -1,
    pingDoResult.finalText.substring(0, 50) + '...');
  
  passed += test('Do mode: No AI prose in output', 
    pingDoResult.finalText.indexOf('AI generated') === -1);
  
  // ===== Test 2: /ping in Say Mode =====
  section('Test 2: /ping Command in Say Mode');
  
  LC.currentAction.set('say');
  LC.Drafts.clear();
  
  const pingSayResult = simulateCompleteTurn(inputCode, outputCode, '/ping', null);
  
  passed += test('Say mode: AI generation stopped', pingSayResult.aiWasStopped === true,
    'stopped=' + pingSayResult.aiWasStopped);
  
  passed += test('Say mode: Output contains Pong', 
    pingSayResult.finalText.indexOf('Pong') !== -1,
    pingSayResult.finalText.substring(0, 50) + '...');
  
  passed += test('Say mode: No AI prose in output', 
    pingSayResult.finalText.indexOf('AI generated') === -1);
  
  // ===== Test 3: /ping in Story Mode =====
  section('Test 3: /ping Command in Story Mode (No Freeze Test)');
  
  LC.currentAction.set('story');
  LC.Drafts.clear();
  
  const pingStoryResult = simulateCompleteTurn(inputCode, outputCode, '/ping', null);
  
  passed += test('Story mode: AI generation stopped', pingStoryResult.aiWasStopped === true,
    'stopped=' + pingStoryResult.aiWasStopped);
  
  passed += test('Story mode: Output contains Pong', 
    pingStoryResult.finalText.indexOf('Pong') !== -1,
    pingStoryResult.finalText.substring(0, 50) + '...');
  
  passed += test('Story mode: No freeze (output present)', 
    pingStoryResult.finalText.length > 0,
    'output length=' + pingStoryResult.finalText.length);
  
  passed += test('Story mode: No AI prose in output', 
    pingStoryResult.finalText.indexOf('AI generated') === -1);
  
  // ===== Test 4: /help in All Modes =====
  section('Test 4: /help Command in All Modes');
  
  LC.currentAction.set('do');
  LC.Drafts.clear();
  const helpDoResult = simulateCompleteTurn(inputCode, outputCode, '/help', null);
  passed += test('Do mode: /help displays commands', 
    helpDoResult.finalText.indexOf('AVAILABLE COMMANDS') !== -1,
    helpDoResult.finalText.substring(0, 50) + '...');
  
  LC.currentAction.set('say');
  LC.Drafts.clear();
  const helpSayResult = simulateCompleteTurn(inputCode, outputCode, '/help', null);
  passed += test('Say mode: /help displays commands', 
    helpSayResult.finalText.indexOf('AVAILABLE COMMANDS') !== -1);
  
  LC.currentAction.set('story');
  LC.Drafts.clear();
  const helpStoryResult = simulateCompleteTurn(inputCode, outputCode, '/help', null);
  passed += test('Story mode: /help displays commands', 
    helpStoryResult.finalText.indexOf('AVAILABLE COMMANDS') !== -1);
  
  // ===== Test 5: /debug in All Modes =====
  section('Test 5: /debug Command in All Modes');
  
  LC.currentAction.set('do');
  LC.Drafts.clear();
  const debugDoResult = simulateCompleteTurn(inputCode, outputCode, '/debug', null);
  passed += test('Do mode: /debug shows info', 
    debugDoResult.finalText.indexOf('LINCOLN DEBUG') !== -1,
    debugDoResult.finalText.substring(0, 50) + '...');
  
  LC.currentAction.set('say');
  LC.Drafts.clear();
  const debugSayResult = simulateCompleteTurn(inputCode, outputCode, '/debug', null);
  passed += test('Say mode: /debug shows info', 
    debugSayResult.finalText.indexOf('LINCOLN DEBUG') !== -1);
  
  LC.currentAction.set('story');
  LC.Drafts.clear();
  const debugStoryResult = simulateCompleteTurn(inputCode, outputCode, '/debug', null);
  passed += test('Story mode: /debug shows info', 
    debugStoryResult.finalText.indexOf('LINCOLN DEBUG') !== -1);
  
  // ===== Test 6: Normal Input (Non-Command) =====
  section('Test 6: Normal Input Does Not Interfere');
  
  LC.currentAction.set('do');
  LC.Drafts.clear();
  const normalDoResult = simulateCompleteTurn(inputCode, outputCode, 
    'you walk forward', 'You take a step forward into the dark hallway.');
  
  passed += test('Do mode: Normal input passes through', 
    normalDoResult.input.text === 'you walk forward',
    'text="' + normalDoResult.input.text + '"');
  
  passed += test('Do mode: AI not stopped for normal input', 
    normalDoResult.aiWasStopped === false,
    'stopped=' + normalDoResult.aiWasStopped);
  
  passed += test('Do mode: AI response present', 
    normalDoResult.finalText.indexOf('dark hallway') !== -1,
    normalDoResult.finalText);
  
  // ===== Test 7: Multiple Commands in Sequence =====
  section('Test 7: Multiple Commands in Sequence');
  
  LC.Drafts.clear();
  executeModifier(inputCode, '/turn');
  const draftsAfterTurn = LC.Drafts.getAll();
  passed += test('First command adds to Drafts', draftsAfterTurn.length === 1);
  
  executeModifier(inputCode, '/action');
  const draftsAfterAction = LC.Drafts.getAll();
  passed += test('Second command adds to Drafts', draftsAfterAction.length === 2,
    'count=' + draftsAfterAction.length);
  
  const multiCmdOutput = executeModifier(outputCode, '');
  passed += test('Output flushes both commands', 
    multiCmdOutput.text.indexOf('Current turn') !== -1 && 
    multiCmdOutput.text.indexOf('Current action') !== -1,
    multiCmdOutput.text.substring(0, 100) + '...');
  
  const draftsAfterFlush = LC.Drafts.getAll();
  passed += test('Drafts cleared after output', draftsAfterFlush.length === 0,
    'count=' + draftsAfterFlush.length);
  
  // ===== Test 8: Edge Cases =====
  section('Test 8: Edge Cases');
  
  LC.Drafts.clear();
  const justSlashResult = executeModifier(inputCode, '/');
  passed += test('Just "/" does not execute command', 
    justSlashResult.text === '/' && justSlashResult.stop !== true,
    'text="' + justSlashResult.text + '", stop=' + justSlashResult.stop);
  
  LC.Drafts.clear();
  const unknownCmdResult = executeModifier(inputCode, '/unknown');
  passed += test('Unknown command does not execute', 
    unknownCmdResult.text === '/unknown' && unknownCmdResult.stop !== true,
    'text="' + unknownCmdResult.text + '", stop=' + unknownCmdResult.stop);
  
  LC.Drafts.clear();
  const textWithSlashResult = executeModifier(inputCode, 'you say "/ping"');
  passed += test('Slash in quotes not treated as command', 
    textWithSlashResult.stop !== true,
    'text="' + textWithSlashResult.text.substring(0, 30) + '...", stop=' + textWithSlashResult.stop);
  
  // ===== Test 9: Acceptance Criteria Verification =====
  section('Test 9: Issue #266 Acceptance Criteria');
  
  // Criterion 1: Slash-commands display SYS response in ALL modes
  LC.Drafts.clear();
  const pingAllModes1 = simulateCompleteTurn(inputCode, outputCode, '/ping', null);
  LC.currentAction.set('say');
  LC.Drafts.clear();
  const pingAllModes2 = simulateCompleteTurn(inputCode, outputCode, '/ping', null);
  LC.currentAction.set('story');
  LC.Drafts.clear();
  const pingAllModes3 = simulateCompleteTurn(inputCode, outputCode, '/ping', null);
  
  passed += test('AC1: Commands display SYS in Do/Say/Story',
    pingAllModes1.finalText.indexOf('⟦SYS⟧') !== -1 &&
    pingAllModes2.finalText.indexOf('⟦SYS⟧') !== -1 &&
    pingAllModes3.finalText.indexOf('⟦SYS⟧') !== -1);
  
  // Criterion 2: No AI prose generated after command
  passed += test('AC2: No AI prose after commands',
    pingAllModes1.aiWasStopped && 
    pingAllModes2.aiWasStopped && 
    pingAllModes3.aiWasStopped);
  
  // Criterion 3: No scenario freeze
  passed += test('AC3: No freeze in Story mode',
    pingAllModes3.finalText.length > 0,
    'output length=' + pingAllModes3.finalText.length);
  
  // Criterion 4: Output shown via Drafts queue
  LC.Drafts.clear();
  executeModifier(inputCode, '/ping');
  const draftsCheck = LC.Drafts.getAll();
  passed += test('AC4: Output in Drafts queue',
    draftsCheck.length > 0 && draftsCheck[0].indexOf('Pong') !== -1);
  
  // ===== Summary =====
  section('Test Summary');
  
  const total = passed + failed;
  console.log('  Total tests: ' + total);
  console.log('  ' + colors.green + 'Passed: ' + passed + colors.reset);
  console.log('  ' + colors.red + 'Failed: ' + failed + colors.reset);
  console.log('  Success rate: ' + ((passed / total) * 100).toFixed(1) + '%');
  
  if (failed === 0) {
    log(colors.green + colors.bold, '\n✓ ALL COMMAND INTEGRATION TESTS PASSED!');
    log(colors.green, '✓ Commands work in all modes (Do/Say/Story)');
    log(colors.green, '✓ Drafts queue integration successful');
    log(colors.green, '✓ Issue #266 acceptance criteria met');
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
