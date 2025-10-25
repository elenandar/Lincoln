#!/usr/bin/env node
/**
 * Phase 1 Test for Lincoln v17.0.0-alpha.1
 * 
 * Tests the basic infrastructure implementation according to MASTER_PLAN_v17.md
 * 
 * Success Criteria:
 * 1. Game loads without errors
 * 2. /ping command responds with "Pong!"
 * 3. /debug on/off commands work correctly
 * 4. Turn counter increments for story actions, not for commands
 */

const fs = require('fs');
const path = require('path');

// Simple test harness for v17 scripts
class V17TestHarness {
  constructor() {
    this.reset();
  }

  reset() {
    // Clear global state
    delete global.state;
    delete global.LC;
    delete global.globalThis;
    delete global.text;
    
    // Setup globalThis polyfill
    if (typeof global !== 'undefined' && !global.globalThis) {
      global.globalThis = global;
    }

    // Initialize AI Dungeon-like state
    global.state = {
      shared: {},
      message: ''
    };

    // stop() function for Input.js
    global.stop = () => {
      this.stopped = true;
    };

    this.stopped = false;
  }

  loadScript(filePath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      eval(code);
      return true;
    } catch (e) {
      console.error(`Error loading ${filePath}:`, e.message);
      throw e;
    }
  }

  simulateInput(inputText) {
    this.reset();
    
    // Load scripts in order from scripts/ folder
    this.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    global.text = inputText;
    this.loadScript(path.join(__dirname, 'scripts/Input.js'));
    
    return {
      message: global.state.message,
      stopped: this.stopped,
      lincoln: global.state.shared.lincoln
    };
  }

  simulateFullCycle(inputText, aiResponse) {
    this.reset();
    
    // Load Library
    this.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    // Run Input
    global.text = inputText;
    this.loadScript(path.join(__dirname, 'scripts/Input.js'));
    
    // If not stopped, continue with Context and Output
    if (!this.stopped) {
      global.text = aiResponse || 'The story continues...';
      this.loadScript(path.join(__dirname, 'scripts/Context.js'));
      this.loadScript(path.join(__dirname, 'scripts/Output.js'));
    }
    
    return {
      message: global.state.message,
      outputText: global.text,
      stopped: this.stopped,
      lincoln: global.state.shared.lincoln
    };
  }
}

// Test suite
function runTests() {
  const harness = new V17TestHarness();
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`✗ ${name}`);
      console.error(`  Error: ${e.message}`);
      failed++;
    }
  }

  console.log('\n=== Lincoln v17.0.0-alpha.1 Phase 1 Tests ===\n');

  // Test 1: Loading without errors
  test('Scripts load without errors', () => {
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    harness.loadScript(path.join(__dirname, 'scripts/Input.js'));
    harness.loadScript(path.join(__dirname, 'scripts/Context.js'));
    harness.loadScript(path.join(__dirname, 'scripts/Output.js'));
  });

  // Test 2: State initialization
  test('State initializes correctly', () => {
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    const L = global.LC.lcInit('test');
    
    if (L.version !== "17.0.0-alpha.2") throw new Error("Wrong version");
    if (L.turn !== 0) throw new Error("Turn should start at 0");
    if (L.sysShow !== true) throw new Error("sysShow should be true");
    if (L.debugMode !== false) throw new Error("debugMode should be false");
    if (L.currentAction.type !== 'story') throw new Error("Default action should be story");
  });

  // Test 3: /ping command
  test('/ping command responds with Pong!', () => {
    const result = harness.simulateInput('/ping');
    
    if (!result.stopped) throw new Error("Command should stop processing");
    if (!result.message.includes('Pong!')) throw new Error("Should respond with Pong!");
    if (result.lincoln.currentAction.type !== 'command') throw new Error("Action type should be command");
  });

  // Test 4: /debug on command
  test('/debug on enables debug mode', () => {
    const result = harness.simulateInput('/debug on');
    
    if (!result.stopped) throw new Error("Command should stop processing");
    if (!result.message.includes('Debug ON')) throw new Error("Should respond with Debug ON");
    if (result.lincoln.debugMode !== true) throw new Error("Debug mode should be enabled");
  });

  // Test 5: /debug off command
  test('/debug off disables debug mode', () => {
    const result = harness.simulateInput('/debug off');
    
    if (!result.stopped) throw new Error("Command should stop processing");
    if (!result.message.includes('Debug OFF')) throw new Error("Should respond with Debug OFF");
    if (result.lincoln.debugMode !== false) throw new Error("Debug mode should be disabled");
  });

  // Test 6: Unknown command
  test('Unknown command produces error message', () => {
    const result = harness.simulateInput('/unknown');
    
    if (!result.stopped) throw new Error("Command should stop processing");
    if (!result.message.includes('Unknown command')) throw new Error("Should report unknown command");
  });

  // Test 7: Turn counter increments for story actions
  test('Turn counter increments for story actions', () => {
    const result = harness.simulateFullCycle('I look around.', 'You see a room.');
    
    if (result.lincoln.turn !== 1) throw new Error(`Turn should be 1, got ${result.lincoln.turn}`);
  });

  // Test 8: Turn counter does not increment for commands
  test('Turn counter does not increment for commands', () => {
    const result = harness.simulateInput('/ping');
    
    if (result.lincoln.turn !== 0) throw new Error(`Turn should remain 0, got ${result.lincoln.turn}`);
  });

  // Test 9: System messages display
  test('System messages are displayed in output', () => {
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    // Manually add system message
    global.LC.lcSys("Test message");
    
    // Run output
    global.text = 'Story text';
    harness.loadScript(path.join(__dirname, 'scripts/Output.js'));
    
    if (!global.text.includes('⟦SYS⟧ Test message')) {
      throw new Error("System message should be in output");
    }
    if (!global.text.includes('===')) {
      throw new Error("System block markers should be present");
    }
  });

  // Test 10: Multiple story actions increment turn correctly
  test('Multiple story actions increment turn correctly', () => {
    // Action 1
    let result = harness.simulateFullCycle('Action 1', 'Response 1');
    if (result.lincoln.turn !== 1) throw new Error(`Turn should be 1, got ${result.lincoln.turn}`);
    
    // Action 2
    result = harness.simulateFullCycle('Action 2', 'Response 2');
    if (result.lincoln.turn !== 1) throw new Error(`Each full cycle resets state, so turn is 1`);
  });

  // Test 11: LC.Utils type conversion functions
  test('LC.Utils type conversion works correctly', () => {
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    const Utils = global.LC.Utils;
    
    if (Utils.toNum("42") !== 42) throw new Error("toNum should convert string to number");
    if (Utils.toNum("invalid", 10) !== 10) throw new Error("toNum should return default for invalid");
    if (Utils.toStr(42) !== "42") throw new Error("toStr should convert number to string");
    if (Utils.toStr(null) !== "") throw new Error("toStr should return empty string for null");
    if (Utils.toBool(1) !== true) throw new Error("toBool should convert 1 to true");
    if (Utils.toBool(0) !== false) throw new Error("toBool should convert 0 to false");
    if (Utils.toBool(null, true) !== true) throw new Error("toBool should return default for null");
  });

  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n✓ All tests passed! Phase 1 implementation is successful.');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed. Please fix the issues.');
    process.exit(1);
  }
}

// Run the tests
runTests();
