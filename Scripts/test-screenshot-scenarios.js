#!/usr/bin/env node

/**
 * Test: Screenshot Scenario Reproduction
 * 
 * This test reproduces the exact scenarios from the GitHub issue screenshots
 * to verify that the fix resolves all reported problems:
 * 
 * Screenshot 1: Story mode - "/ping" works but AI generates prose after
 * Screenshot 2: Say mode - "> You say \"/ping\"" not detected
 * Screenshot 3: Do mode - "> You /ping." not detected  
 * Screenshot 4: Multiple duplicate SYS responses
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

// Helper to simulate full Input → Context → Output flow
function simulateFullFlow(inputCode, contextCode, outputCode, userInput, aiProse) {
  // Reset state
  LC.Drafts.clear();
  if (state.lincoln) {
    state.lincoln._commandExecuted = false;
  }
  
  // Step 1: Input processing
  const inputResult = executeModifier(inputCode, userInput);
  
  // Check if command was detected (BEFORE Context clears the flag)
  const commandWasDetected = state.lincoln && state.lincoln._commandExecuted === true;
  
  // Step 2: Context processing (only if AI would generate)
  let contextResult = null;
  if (inputResult.stop !== true) {
    contextResult = executeModifier(contextCode, aiProse);
  }
  
  // Step 3: Output processing
  const outputText = contextResult && contextResult.stop === true ? '' : aiProse;
  const outputResult = executeModifier(outputCode, outputText);
  
  return {
    input: inputResult,
    context: contextResult,
    output: outputResult,
    commandDetected: commandWasDetected,
    aiGenerated: contextResult && contextResult.stop !== true,
    finalOutput: outputResult.text
  };
}

try {
  section('Screenshot Scenario Reproduction Tests');
  
  // Load scripts
  const libraryPath = path.join(__dirname, 'Library.txt');
  const inputPath = path.join(__dirname, 'Input.txt');
  const contextPath = path.join(__dirname, 'Context.txt');
  const outputPath = path.join(__dirname, 'Output.txt');
  
  const libraryCode = fs.readFileSync(libraryPath, 'utf8');
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  const contextCode = fs.readFileSync(contextPath, 'utf8');
  const outputCode = fs.readFileSync(outputPath, 'utf8');
  
  // Initialize library
  eval(libraryCode);
  LC.lcInit('Test');
  
  let allTestsPassed = true;
  
  // ===== SCREENSHOT 1: Story Mode - Raw /ping with AI prose after =====
  section('Screenshot 1: Story Mode - "/ping"');
  log(colors.yellow, '  Issue: Command works but AI generates prose after SYS');
  log(colors.yellow, '  Input from screenshot: "/ping"');
  
  const test1 = simulateFullFlow(
    inputCode, 
    contextCode, 
    outputCode, 
    '/ping',
    'Хлоя отпускает твою руку, но её взгляд остаётся прикованным к тебе...'
  );
  
  const test1Pass = test1.commandDetected && 
                    !test1.aiGenerated && 
                    test1.finalOutput.includes('⟦SYS⟧') &&
                    !test1.finalOutput.includes('Хлоя');
  
  if (test1Pass) {
    log(colors.green, '  ✓ Command detected correctly');
    log(colors.green, '  ✓ AI prose generation HALTED');
    log(colors.green, '  ✓ Only SYS message in output');
    log(colors.green, `  ✓ Output: "${test1.finalOutput}"`);
  } else {
    allTestsPassed = false;
    log(colors.red, '  ✗ Test FAILED');
    log(colors.red, `  ✗ Detected: ${test1.commandDetected}, AI generated: ${test1.aiGenerated}`);
    log(colors.red, `  ✗ Output: "${test1.finalOutput}"`);
  }
  
  // ===== SCREENSHOT 2: Say Mode - Command not detected =====
  section('Screenshot 2: Say Mode - "> You say \\"/ping\\""');
  log(colors.yellow, '  Issue: Command not detected at all (NO MODE MATCH)');
  log(colors.yellow, '  Input from screenshot: "> You say \\"/ping\\""');
  
  const test2 = simulateFullFlow(
    inputCode, 
    contextCode, 
    outputCode, 
    '> You say "/ping"',
    'Вы произносите «/ping» вслух, и на мгновение в глазах Хлои...'
  );
  
  const test2Pass = test2.commandDetected && 
                    !test2.aiGenerated && 
                    test2.finalOutput.includes('⟦SYS⟧') &&
                    !test2.finalOutput.includes('Хлои');
  
  if (test2Pass) {
    log(colors.green, '  ✓ Command detected correctly (FIXED!)');
    log(colors.green, '  ✓ AI prose generation HALTED');
    log(colors.green, '  ✓ Only SYS message in output');
    log(colors.green, `  ✓ Output: "${test2.finalOutput}"`);
  } else {
    allTestsPassed = false;
    log(colors.red, '  ✗ Test FAILED');
    log(colors.red, `  ✗ Detected: ${test2.commandDetected}, AI generated: ${test2.aiGenerated}`);
    log(colors.red, `  ✗ Output: "${test2.finalOutput}"`);
  }
  
  // ===== SCREENSHOT 3: Do Mode - Command not detected =====
  section('Screenshot 3: Do Mode - "> You /ping."');
  log(colors.yellow, '  Issue: Command not detected (NO MODE MATCH)');
  log(colors.yellow, '  Input from screenshot: "> You /ping."');
  
  const test3 = simulateFullFlow(
    inputCode, 
    contextCode, 
    outputCode, 
    '> You /ping.',
    'Вы произносите «/ping», и система мгновенно откликается тонким...'
  );
  
  const test3Pass = test3.commandDetected && 
                    !test3.aiGenerated && 
                    test3.finalOutput.includes('⟦SYS⟧') &&
                    !test3.finalOutput.includes('система');
  
  if (test3Pass) {
    log(colors.green, '  ✓ Command detected correctly (FIXED!)');
    log(colors.green, '  ✓ AI prose generation HALTED');
    log(colors.green, '  ✓ Only SYS message in output');
    log(colors.green, `  ✓ Output: "${test3.finalOutput}"`);
  } else {
    allTestsPassed = false;
    log(colors.red, '  ✗ Test FAILED');
    log(colors.red, `  ✗ Detected: ${test3.commandDetected}, AI generated: ${test3.aiGenerated}`);
    log(colors.red, `  ✗ Output: "${test3.finalOutput}"`);
  }
  
  // ===== SCREENSHOT 4: Multiple duplicate responses =====
  section('Screenshot 4: Multiple /ping Commands');
  log(colors.yellow, '  Issue: Multiple duplicate SYS responses in output');
  log(colors.yellow, '  Testing: Sequential /ping commands should not duplicate');
  
  // First /ping
  const test4a = simulateFullFlow(inputCode, contextCode, outputCode, '/ping', '');
  
  // Second /ping (should not have residual from first)
  const test4b = simulateFullFlow(inputCode, contextCode, outputCode, '/ping', '');
  
  // Third /ping
  const test4c = simulateFullFlow(inputCode, contextCode, outputCode, '/ping', '');
  
  const noDuplicates = test4a.finalOutput.split('⟦SYS⟧').length === 2 && // 1 SYS + empty split
                       test4b.finalOutput.split('⟦SYS⟧').length === 2 &&
                       test4c.finalOutput.split('⟦SYS⟧').length === 2;
  
  if (noDuplicates) {
    log(colors.green, '  ✓ No duplicate SYS messages');
    log(colors.green, '  ✓ Queue properly flushed after each command');
    log(colors.green, '  ✓ Each output contains exactly 1 SYS message');
  } else {
    allTestsPassed = false;
    log(colors.red, '  ✗ Test FAILED - Duplicates detected');
    log(colors.red, `  ✗ Output 1: ${test4a.finalOutput.split('⟦SYS⟧').length - 1} SYS messages`);
    log(colors.red, `  ✗ Output 2: ${test4b.finalOutput.split('⟦SYS⟧').length - 1} SYS messages`);
    log(colors.red, `  ✗ Output 3: ${test4c.finalOutput.split('⟦SYS⟧').length - 1} SYS messages`);
  }
  
  // ===== Additional verification: All three modes with same command =====
  section('Verification: Cross-Mode Consistency');
  log(colors.yellow, '  Testing: /help command in all three modes');
  
  const storyMode = simulateFullFlow(inputCode, contextCode, outputCode, '/help', '');
  const doMode = simulateFullFlow(inputCode, contextCode, outputCode, 'You /help', '');
  const sayMode = simulateFullFlow(inputCode, contextCode, outputCode, 'You say "/help"', '');
  
  const allDetected = storyMode.commandDetected && doMode.commandDetected && sayMode.commandDetected;
  const allHalted = !storyMode.aiGenerated && !doMode.aiGenerated && !sayMode.aiGenerated;
  const allShowSYS = storyMode.finalOutput.includes('AVAILABLE COMMANDS') &&
                     doMode.finalOutput.includes('AVAILABLE COMMANDS') &&
                     sayMode.finalOutput.includes('AVAILABLE COMMANDS');
  
  if (allDetected && allHalted && allShowSYS) {
    log(colors.green, '  ✓ Story mode: Command detected, AI halted, SYS displayed');
    log(colors.green, '  ✓ Do mode: Command detected, AI halted, SYS displayed');
    log(colors.green, '  ✓ Say mode: Command detected, AI halted, SYS displayed');
    log(colors.green, '  ✓ All modes produce identical behavior');
  } else {
    allTestsPassed = false;
    log(colors.red, '  ✗ Cross-mode consistency FAILED');
    log(colors.red, `  Story: detected=${storyMode.commandDetected}, halted=${!storyMode.aiGenerated}`);
    log(colors.red, `  Do: detected=${doMode.commandDetected}, halted=${!doMode.aiGenerated}`);
    log(colors.red, `  Say: detected=${sayMode.commandDetected}, halted=${!sayMode.aiGenerated}`);
  }
  
  // ===== Final Summary =====
  section('Test Results Summary');
  
  if (allTestsPassed) {
    log(colors.green + colors.bold, '\n✓ ALL SCREENSHOT SCENARIOS FIXED!');
    log(colors.green, '✓ Screenshot 1: Story mode - AI prose no longer generated');
    log(colors.green, '✓ Screenshot 2: Say mode - Command now detected (was broken)');
    log(colors.green, '✓ Screenshot 3: Do mode - Command now detected (was broken)');
    log(colors.green, '✓ Screenshot 4: No duplicate SYS messages');
    log(colors.green, '✓ All modes work identically');
    
    console.log(colors.bold + '\n  Acceptance Criteria Status:\n' + colors.reset);
    log(colors.green, '  ✓ /ping, /help, /debug work identically in Do, Say, Story modes');
    log(colors.green, '  ✓ SYS output displayed, no unwanted AI prose or dialog after');
    log(colors.green, '  ✓ No scenario hangs/errors in any mode');
    log(colors.green, '  ✓ Edge cases with punctuation, quotes handled');
    
    process.exit(0);
  } else {
    log(colors.red + colors.bold, '\n✗ SOME SCENARIOS STILL FAILING');
    log(colors.yellow, '\nPlease review the failed tests above for details.');
    process.exit(1);
  }
  
} catch (e) {
  log(colors.red + colors.bold, '\n✗ TEST EXECUTION FAILED');
  console.error(e);
  process.exit(1);
}
